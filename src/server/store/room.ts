import {nanoid} from 'nanoid';
import {Player} from 'src/server/store/player';
import {AudioChannel} from 'src/server/config/constants';
import {PhysicsEngine, snapshotModel} from 'src/shared/game';
import {Movement, WORLD_SCALE} from 'src/shared/constants';
import {findSmallestMissingInt} from 'src/server/utils/array';
import type {
  BufferInputData,
  BufferPlayerData,
  BufferSnapshotData,
  JwtClaims,
} from 'src/shared/types';
import {hrtimeToMs} from 'src/server/utils/time';

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

export class GameRoom {
  /** Maximum number of players allowed in a single room. */
  private static readonly MAX_ROOM_SIZE = 15;
  private static readonly instances = new Map<string, GameRoom>();
  private readonly engine: PhysicsEngine;
  private readonly createdAt: Date;

  private tick = 0;
  private prevHrtime?: [number, number];
  private updateTimeout?: NodeJS.Timeout;

  private players: Player[] = [];
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
  public creatorId: string;
  public isMatchStarted: boolean = false;
  public id: string;

  /**
   * Private constructor to prevent instances from being created outside of static methods
   */
  private constructor(creatorId: string) {
    this.createdAt = new Date();
    this.creatorId = creatorId;
    this.id = nanoid();
    this.engine = new PhysicsEngine(this.processInput);
    this.engine.shouldInterpolate = false; // Do not interpolate on the server
    // TEMP_createWorldBoundaries(this.engine);
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
  public static create(creatorId: string): GameRoom {
    const newRoom = new GameRoom(creatorId);
    GameRoom.instances.set(newRoom.id, newRoom);
    return newRoom;
  }

  /**
   * Only deletes rooms that no longer contain players. Skips if id is not found in the map.
   * @param id Id of the room instance
   */
  public static deleteById(id: string): void {
    GameRoom.instances.delete(id);
  }

  public isEmpty(): boolean {
    return this.players.length === 0;
  }

  public isFullCapacity(): boolean {
    return this.players.length === GameRoom.MAX_ROOM_SIZE;
  }

  public hasPlayerWithId(id: string): boolean {
    const playerIndex = this.players.findIndex((player) => player.userId === id);
    return playerIndex !== -1;
  }

  public addPlayer(claims: Required<JwtClaims>): Player {
    const {id, isGuest, username, hashtag} = claims;
    const player = Player.create({
      id: findSmallestMissingInt(this.players.map((player) => player.id)),
      userId: id,
      username: isGuest ? `${username}#${hashtag}` : username,
      body: this.engine.createPlayerBody(),
      roomId: this.id,
    });
    this.players.push(player);
    if (!this.host) {
      this.host = player;
    }
    return player;
  }

  public removePlayer(player: Player): void {
    const index = this.players.findIndex((value) => value === player);
    if (index > -1) {
      this.players.splice(index, 1);
      if (this.host === player && this.players.length > 0) {
        this.host = this.players[0];
      }
      const audioIds = this.getAudioIdsInChannel(AudioChannel.Silent);
      // player.leaveRoom(audioIds);
      this.engine.world.DestroyBody(player.body);
    }
  }

  public killPlayer(player: Player) {
    const audioIds = this.getAudioIdsInChannel(AudioChannel.Lobby);
    player.kill(audioIds);
    // log('info', `Kill player ${this.id}`);
  }

  public revivePlayer(player: Player) {
    let channelType = AudioChannel.Silent;
    if (this.isMatchStarted && this.isVoting) {
      channelType = AudioChannel.Voting;
    } else {
      channelType = AudioChannel.Lobby;
    }
    const audioIds = this.getAudioIdsInChannel(channelType);
    player.revive(audioIds);
    // log('info', `Revive player ${this.id}`);
  }

  public getAudioIdsInChannel(channel: AudioChannel): string[] {
    switch (channel) {
      case AudioChannel.Silent: {
        return [];
      }
      case AudioChannel.Lobby: {
        if (this.isMatchStarted) {
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

  public startGame() {
    this.isMatchStarted = true;
    this.update();
    const audioIds = this.getAudioIdsInChannel(AudioChannel.Silent);
    this.emitToPlayers('connectAudioIds', audioIds);
    // log('info', `Start game for room ${this.id}`);
  }

  public endGame(): void {
    this.isMatchStarted = false;
    if (this.updateTimeout !== undefined) {
      clearTimeout(this.updateTimeout);
    }
    // Remove all players who disconnected
    this.players = this.players.filter((player) => player.isActive);

    // TODO: Calculate ranking differential

    const audioIds = this.getAudioIdsInChannel(AudioChannel.Lobby);
    this.emitToPlayers('connectAudioIds', audioIds);
    // log('info', `End game for room ${this.id}`);
  }

  public startVoting() {
    this.isVoting = true;
    const audioIds = this.getAudioIdsInChannel(AudioChannel.Voting);
    this.emitToPlayers('connectAudioIds', audioIds, (p) => p.alive);
    // log('info', `Start voting for room ${this.id}`);
  }

  public endVoting() {
    this.isVoting = false;
    const audioIds = this.getAudioIdsInChannel(AudioChannel.Silent);
    this.emitToPlayers('connectAudioIds', audioIds, (p) => p.alive);
    // log('info', `End voting for room ${this.id}`);
  }

  private update = () => {
    this.updateTimeout = setTimeout(this.update, PhysicsEngine.FIXED_TIMESTEP);

    // Find the delta time since the previous update
    const delta = hrtimeToMs(process.hrtime(this.prevHrtime));
    this.prevHrtime = process.hrtime();

    // Perform the update of world state
    this.engine.fixedStep(delta);
    this.emitWorldState();

    // const now = hrtimeMs();
    // const delta = now - this.previous; // Delta update time in milliseconds
    // // console.log('Looping delta:', delta);
    // this.update(delta);
    // this.previous = now;
    this.tick++;
  };

  private processInput = () => {
    for (const player of this.players) {
      let input: BufferInputData | undefined;
      while ((input = player.dequeueInput()) !== undefined) {
        // Check if input contained movement
        if (input.h < 0 && input.v < 0) {
          continue;
        }
        const vector = {x: 0, y: 0};
        const movementUnit = 150 / WORLD_SCALE;
        if (input.h === Movement.Right) {
          vector.x = movementUnit;
        } else if (input.h === Movement.Left) {
          vector.x = -movementUnit;
        }
        if (input.v === Movement.Down) {
          vector.y = movementUnit;
        } else if (input.v === Movement.Up) {
          vector.y = -movementUnit;
        }
        player.body.SetLinearVelocity(vector);
        // console.log(`Received input: ${input}, Velocity: (${vel.x}, ${vel.y})`);
        player.lastProcessedInput = input.s;
      }
    }
  };

  // Naive implementation returns positions of all players within rectangle
  // Ideal implementation only returns positions of viewable players in raycast
  private emitWorldState() {
    const VIEW_DISTANCE_X = 500;
    const VIEW_DISTANCE_Y = 500;

    for (const player of this.players) {
      if (!player.socket || !player.id) {
        continue; // Player has disconnected or left the room
      }
      const playerEntities: BufferPlayerData[] = [];
      const position = player.body.GetPosition();
      const bottomLeft = {x: position.x - VIEW_DISTANCE_X / 2, y: position.y - VIEW_DISTANCE_Y / 2};
      const topRight = {x: position.x + VIEW_DISTANCE_X / 2, y: position.y + VIEW_DISTANCE_Y / 2};

      // Add player's own position
      playerEntities.push({
        id: player.id,
        x: position.x,
        y: position.y,
      });

      for (const otherPlayer of this.players) {
        if (player === otherPlayer || !otherPlayer.id) {
          continue;
        }
        const otherPosition = otherPlayer.body.GetPosition();
        if (
          otherPosition.x < topRight.x &&
          otherPosition.x > bottomLeft.x &&
          otherPosition.y < topRight.y &&
          otherPosition.y > bottomLeft.y
        ) {
          // Other player is within view box, send information
          playerEntities.push({
            id: otherPlayer.id,
            x: otherPosition.x,
            y: otherPosition.y,
          });
        }
      }
      const state: BufferSnapshotData = {
        s: player.lastProcessedInput,
        t: this.tick,
        p: playerEntities,
      };
      console.log('State:', state);
      player.socket.emitRaw(snapshotModel.toBuffer(state));
    }
  }

  private isKillValid(player: Player) {
    // determine if player attempting to kill is valid to do so
    // check if player is within kill range of all other players
  }

  protected emitToPlayers(event: string, message: any, filter?: (args0: Player) => boolean): void {
    const players = Array.from(this.players.values());
    const filtered = filter ? players.filter(filter) : players;
    filtered.forEach((player) => player.socket?.emit(event, message));
  }

  protected modifySettings() {
    // TODO
  }
}
