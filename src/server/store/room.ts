import Box2d from '@supersede/box2d';
import {log} from 'src/server/utils/logs';
import {Player} from 'src/server/store/player';
import {nanoid} from 'src/server/utils/crypto';
import {AudioChannel, MAX_ROOM_SIZE} from 'src/server/config/constants';
import {PhysicsEngine} from 'src/shared/physics-engine';
import {InputData} from 'src/shared/types';
import {TICK_RATE} from 'src/shared/constants';

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
  public static deleteIfEmpty(id: string = '') {
    const roomToDelete = GameRoom.instances.get(id);
    if (!roomToDelete) {
      return;
    }
    if (roomToDelete.players.length === 0) {
      GameRoom.instances.delete(id);
    }
  }

  tick = 0;
  previous = hrtimeMs();

  loop() {
    const nextTimeout = setTimeout(this.loop, 1000 / TICK_RATE);
    const now = hrtimeMs();
    const delta = (now - this.previous) / 1000; // Delta update time in seconds
    this.update(delta, this.tick);
    this.previous = now;
    this.tick++;
    return nextTimeout;
  }

  update(deltaTime: number) {
    this.processInputs();
    this.engine.fixedStep(deltaTime);
    this.sendWorldState();
  }

  processInputs(input: InputData) {
    // if valid input, ignoring inputs that don't look valid
    const id = message.entity_id;
    this.entities[id].applyInput(message);
    this.last_processed_input[id] = message.input_sequence_number;
  }

  setPlayerVelocity() {
    const vector = new Box2d.b2Vec2();
    const movementUnit = 90 / WORLD_SCALE;

    // Determine horizontal velocity
    if (this.cursors.right!.isDown) {
      vector.Set(movementUnit, 0);
    } else if (this.cursors.left!.isDown) {
      vector.Set(-movementUnit, 0);
    }
    // Determine vertical velocity
    if (this.cursors.down!.isDown) {
      vector.Set(vector.x, movementUnit);
    } else if (this.cursors.up!.isDown) {
      vector.Set(vector.x, -movementUnit);
    }

    this.player[0].SetLinearVelocity(vector);
  }

  sendWorldState() {
    // send world state to all connected clients
    var world_state = [];
    var num_clients = this.clients.length;
    for (var i = 0; i < num_clients; i++) {
      var entity = this.entities[i];
      world_state.push({
        entity_id: entity.entity_id,
        position: entity.x,
        last_processed_input: this.last_processed_input[i],
      });
    }

    // Broadcast the state to all the clients.
    for (var i = 0; i < num_clients; i++) {
      var client = this.clients[i];
      client.network.send(client.lag, world_state);
    }
  }

  public hasCapacity() {
    return this.players.length < MAX_ROOM_SIZE;
  }

  public addPlayer(newPlayer: Player) {
    if (!this.host) {
      this.host = newPlayer;
    }
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
    const audioIds = this.getAudioIdsInChannel(AudioChannel.Silent);
    this.emitToPlayers('connectAudioIds', audioIds);
    log('info', `Start game for room ${this.id}`);
  }

  public endGame() {
    this.isGameStarted = false;
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
