import Box2d from '@supersede/box2d';
import {log} from 'src/server/utils/logs';
import {Player} from 'src/server/store/player';
import {nanoid} from 'src/server/utils/crypto';
import {AudioChannel, MAX_ROOM_SIZE} from 'src/server/config/constants';
import {PhysicsEngine, TEMP_createWorldBoundaries} from 'src/shared/physics-engine';
import {BufferPlayerData, BufferSnapshotData, InputData} from 'src/shared/types';
import {Movement, TICK_RATE, WORLD_SCALE} from 'src/shared/constants';
import {findSmallestMissingInt} from 'src/server/utils/array';
import {snapshotModel} from 'src/shared/buffer-schema';

export type Voting = {
  timeRemaining: number;
  ballots: Ballot[];
};

export type Ballot = {
  voter: string;
  candidate: string | null;
};

export type Job = {
  id: string;
  complete: boolean;
};

type Settings = {
  mapType: 'lol' | 'we' | 'have' | 'no' | 'maps';
  numSpies: number;
  discussionTime: number;
  killCooldown: number;
  emergencyCooldown: number;
  walkingSpeed: number;
  visionRadiusCivilian: number;
  visionRadiusSpy: number;
  numRegularJobs: number;
  numEasyJobs: number;
  numDifficultJobs: number;
};

function hrtimeMs() {
  const time = process.hrtime();
  return time[0] * 1000 + time[1] / 1000000;
}

export class GameRoom {
  private static readonly instances = new Map<string, GameRoom>();
  private readonly players: Player[] = [];
  private readonly engine: PhysicsEngine;
  private isGameStarted: boolean = false;
  private isVoting: boolean = false;
  private host?: Player;
  private settings: Settings = {
    mapType: 'lol',
    numSpies: 2,
    discussionTime: 120,
    killCooldown: 30,
    emergencyCooldown: 30,
    walkingSpeed: 1,
    visionRadiusCivilian: 1,
    visionRadiusSpy: 1.5,
    numRegularJobs: 2,
    numEasyJobs: 3,
    numDifficultJobs: 1,
  };
  private jobs: Job[] = [];
  private voting: Voting = {
    timeRemaining: 0,
    ballots: [],
  };
  public id: string;

  /**
   * Private constructor to prevent instances from being created outside of static methods
   */
  private constructor() {
    this.id = nanoid();
    this.engine = new PhysicsEngine();
    this.engine.shouldInterpolate = false; // Do not interpolate on the server
    TEMP_createWorldBoundaries(this.engine);
  }

  /**
   * Retrieves a room instance by its id
   * @param id Id of the room instance
   */
  public static getById(id?: string): GameRoom | undefined {
    return id ? GameRoom.instances.get(id) : undefined;
  }

  /**
   * Creates a new room instance with a random id
   */
  public static create(): GameRoom {
    const newRoom = new GameRoom();
    GameRoom.instances.set(newRoom.id, newRoom);
    return newRoom;
  }

  /**
   * Only deletes rooms that no longer contain players. Skips if id is not found in the map.
   * @param id Id of the room instance
   */
  public static delete(id: string) {
    GameRoom.instances.delete(id);
  }

  tick = 0;
  previous = 0;
  timeout: NodeJS.Timeout;

  loop = () => {
    this.timeout = setTimeout(this.loop, 1000 / TICK_RATE);
    const now = hrtimeMs();
    const delta = now - this.previous; // Delta update time in milliseconds
    // console.log('Looping delta:', delta);
    this.update(delta);
    this.previous = now;
    this.tick++;
  };

  update(deltaTime: number) {
    this.processInputs();
    this.engine.fixedStep(deltaTime);
    this.emitWorldState();
  }

  processInputs() {
    for (const player of this.players) {
      // DOES NOT ENFORCE MAXIMUM AMOUTN OF INPUT TO BE HANDLED
      while (player.inputQueue.length > 0) {
        const input = player.inputQueue.shift()!;
        // Check if input contained movement
        if (input.h > 0 || input.v > 0) {
          const vector = new Box2d.b2Vec2();
          const movementUnit = 90 / WORLD_SCALE;
          if (input.h === Movement.Right) {
            vector.Set(movementUnit, 0);
          } else if (input.h === Movement.Left) {
            vector.Set(-movementUnit, 0);
          }
          if (input.v === Movement.Down) {
            vector.y = movementUnit;
          } else if (input.v === Movement.Up) {
            vector.y = -movementUnit;
          }
          player.body!.SetLinearVelocity(vector);
          const vel = player.body!.GetLinearVelocity();
          console.log('input:', input, `|| velocity: ${vel.x}, ${vel.y}`);
          player.lastProcessedInput = input.s;
        }
      }
    }
  }

  // Naive implementation returns positions of all players within rectangle
  // Ideal implementation only returns positions of viewable players in raycast
  emitWorldState() {
    const VIEW_DISTANCE_X = 1280;
    const VIEW_DISTANCE_Y = 720;

    for (const player of this.players) {
      if (!player.channel) {
        continue; // Player has disconnected or left the room
      }
      const playerEntities: BufferPlayerData[] = [];
      const position = player.body!.GetPosition();
      const bottomLeft = {x: position.x - VIEW_DISTANCE_X / 2, y: position.y - VIEW_DISTANCE_Y / 2};
      const topRight = {x: position.x + VIEW_DISTANCE_X / 2, y: position.y + VIEW_DISTANCE_Y / 2};

      // Add player's own position
      playerEntities.push({
        uiid: player.uiid!,
        x: position.x,
        y: position.y,
      });

      for (const otherPlayer of this.players) {
        if (player === otherPlayer) {
          continue;
        }
        const otherPosition = otherPlayer.body!.GetPosition();
        if (
          otherPosition.x < topRight.x &&
          otherPosition.x > bottomLeft.x &&
          otherPosition.y < topRight.y &&
          otherPosition.y > bottomLeft.y
        ) {
          // Other player is within view box, send information
          playerEntities.push({
            uiid: otherPlayer.uiid!,
            x: otherPosition.x,
            y: otherPosition.y,
          });
        }
      }
      const state: BufferSnapshotData = {
        seq: player.lastProcessedInput,
        tick: this.tick,
        players: playerEntities,
      };
      console.log('State:', state);
      const buffer = snapshotModel.toBuffer(state);
      player.channel.emit('update', buffer);
    }
  }

  public isEmpty() {
    return this.players.length === 0;
  }

  public hasCapacity() {
    return this.players.length < MAX_ROOM_SIZE;
  }

  public addPlayer(newPlayer: Player) {
    if (!this.host) {
      this.host = newPlayer;
    }
    newPlayer.uiid = findSmallestMissingInt(this.players.map((player) => player.uiid!));
    newPlayer.body = this.engine.createPlayer();
    this.players.push(newPlayer);
    newPlayer.joinRoom(this.id);
  }

  public removePlayer(player: Player) {
    const index = this.players.findIndex((p) => p === player);
    if (index > -1) {
      this.players.splice(index, 1);
      if (this.host === player && this.players.length > 0) {
        this.host = this.players[0];
      }
      const audioIds = this.getAudioIdsInChannel(AudioChannel.Silent);
      player.leaveRoom(audioIds);
      player.uiid = undefined;
    }
  }

  public killPlayer(player: Player) {
    const audioIds = this.getAudioIdsInChannel(AudioChannel.Lobby);
    player.kill(audioIds);
    log('info', `Kill player ${this.id}`);
  }

  public revivePlayer(player: Player) {
    let channelType = AudioChannel.Silent;
    if (this.isGameStarted && this.isVoting) {
      channelType = AudioChannel.Voting;
    } else {
      channelType = AudioChannel.Lobby;
    }
    const audioIds = this.getAudioIdsInChannel(channelType);
    player.revive(audioIds);
    log('info', `Revive player ${this.id}`);
  }

  public getAudioIdsInChannel(channel: AudioChannel): string[] {
    switch (channel) {
      case AudioChannel.Silent: {
        return [];
      }
      case AudioChannel.Lobby: {
        if (this.isGameStarted) {
          // If in game, then add people who are dead
          return this.players.filter((p) => !p.alive).map((p) => p.audioId!);
        }
        return this.players.map((p) => p.audioId!); // In lobby
      }
      case AudioChannel.Voting: {
        return this.players.filter((p) => p.alive).map((p) => p.audioId!);
      }
      default: {
        throw new Error('Invalid AudioChannel passed');
      }
    }
  }

  public emitToPlayers(event: string, message: any, filter?: (args0: Player) => boolean) {
    const players = Array.from(this.players.values());
    const filtered = filter ? players.filter(filter) : players;
    filtered.forEach((p) => p.socket.emit(event, message));
  }

  modifySettings() {
    // TODO
  }

  public startGame() {
    this.isGameStarted = true;
    this.loop();
    const audioIds = this.getAudioIdsInChannel(AudioChannel.Silent);
    this.emitToPlayers('connectAudioIds', audioIds);
    log('info', `Start game for room ${this.id}`);
  }

  public endGame() {
    this.isGameStarted = false;
    clearTimeout(this.timeout);
    const audioIds = this.getAudioIdsInChannel(AudioChannel.Lobby);
    this.emitToPlayers('connectAudioIds', audioIds);
    log('info', `End game for room ${this.id}`);
  }

  public startVoting() {
    this.isVoting = true;
    const audioIds = this.getAudioIdsInChannel(AudioChannel.Voting);
    this.emitToPlayers('connectAudioIds', audioIds, (p) => p.alive);
    log('info', `Start voting for room ${this.id}`);
  }

  public endVoting() {
    this.isVoting = false;
    const audioIds = this.getAudioIdsInChannel(AudioChannel.Silent);
    this.emitToPlayers('connectAudioIds', audioIds, (p) => p.alive);
    log('info', `End voting for room ${this.id}`);
  }
}
