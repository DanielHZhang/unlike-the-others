import Box2d from '@supersede/box2d';
import {log} from 'src/server/utils/logs';
import {Player} from 'src/server/store/player';
import {nanoid} from 'src/server/utils/crypto';
import {ObjectService} from 'src/config/types';
import {AudioChannel, WORLD_SCALE} from 'src/config/constants';

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
  private players: Map<string, Player> = new Map<string, Player>();
  private isGameStarted: boolean = false;
  private isVoting: boolean = false;
  private host?: Player = undefined;
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
  private world: Box2d.b2World;
  public id: string;

  constructor(roomId: string) {
    this.id = roomId;
    // Set up physics engine of the room
    const gravity = new Box2d.b2Vec2(0, 0);
    this.world = new Box2d.b2World(gravity);
    this.addStuffToWorld();
  }

  addStuffToWorld() {
    // create the top ceiling edge
    {
      const bodyDef = new Box2d.b2BodyDef();
      const ground = this.world.CreateBody(bodyDef);
      const shape = new Box2d.b2EdgeShape();
      shape.SetTwoSided(
        new Box2d.b2Vec2(5 / WORLD_SCALE, 5 / WORLD_SCALE),
        new Box2d.b2Vec2(600 / WORLD_SCALE, 5 / WORLD_SCALE)
      );
      ground.CreateFixture(shape, 0);
    }

    // create the left edge
    {
      const bodyDef = new Box2d.b2BodyDef();
      const leftSide = this.world.CreateBody(bodyDef);
      const shape = new Box2d.b2EdgeShape();
      shape.SetTwoSided(
        new Box2d.b2Vec2(5 / WORLD_SCALE, 5 / WORLD_SCALE),
        new Box2d.b2Vec2(5 / WORLD_SCALE, 600 / WORLD_SCALE)
      );
      leftSide.CreateFixture(shape, 0);
    }

    // create the bottom edge
    {
      const bodyDef = new Box2d.b2BodyDef();
      const bottom = this.world.CreateBody(bodyDef);
      const shape = new Box2d.b2EdgeShape();
      shape.SetTwoSided(
        new Box2d.b2Vec2(5 / WORLD_SCALE, 600 / WORLD_SCALE),
        new Box2d.b2Vec2(600 / WORLD_SCALE, 600 / WORLD_SCALE)
      );
      bottom.CreateFixture(shape, 0);
    }

    // create the right edge
    {
      const bodyDef = new Box2d.b2BodyDef();
      const rightSide = this.world.CreateBody(bodyDef);
      const shape = new Box2d.b2EdgeShape();
      shape.SetTwoSided(
        new Box2d.b2Vec2(600 / WORLD_SCALE, 5 / WORLD_SCALE),
        new Box2d.b2Vec2(600 / WORLD_SCALE, 600 / WORLD_SCALE)
      );
      rightSide.CreateFixture(shape, 0);
    }
  }

  createBox(
    posX: number,
    posY: number,
    width: number,
    height: number,
    isDynamic: boolean
  ): Box2d.b2Body {
    // this is how we create a generic Box2D body
    const box = this.world.CreateBody();
    if (isDynamic) {
      // Box2D bodies born as static bodies, but we can make them dynamic
      box.SetType(Box2d.b2BodyType.b2_dynamicBody);
      box.SetLinearDamping(10);
      box.SetFixedRotation(true);
    }

    // a body can have one or more fixtures. This is how we create a box fixture inside a body
    const boxShape = new Box2d.b2PolygonShape();
    boxShape.SetAsBox(width / 2 / WORLD_SCALE, height / 2 / WORLD_SCALE);
    const fixtureDef = new Box2d.b2FixtureDef();
    fixtureDef.density = 20.0;
    fixtureDef.friction = 1.0;
    fixtureDef.shape = boxShape;
    box.CreateFixture(fixtureDef);

    // now we place the body in the world
    box.SetPosition(new Box2d.b2Vec2(posX / WORLD_SCALE, posY / WORLD_SCALE));

    // time to set mass information
    box.SetMassData({
      mass: 1,
      center: new Box2d.b2Vec2(),
      I: 0, // if you set it to zero, bodies won't rotate
    });

    return box;
  }

  addPlayer(player: Player) {
    if (!this.host) {
      this.host = player;
    }
    this.players.set(player.id, player);
    player.joinRoom(this.id);
  }

  removePlayer(player: Player) {
    if (this.players.has(player.id)) {
      this.players.delete(player.id);
    }
    if (this.host === player && this.players.size > 0) {
      this.host = this.players.values().next().value;
    }
    const audioIds = this.getAudioIdsInChannel(AudioChannel.Silent);
    player.leaveRoom(audioIds);
  }

  killPlayer(player: Player) {
    const audioIds = this.getAudioIdsInChannel(AudioChannel.Lobby);
    player.kill(audioIds);
    log('info', `Kill player ${this.id}`);
  }

  revivePlayer(player: Player) {
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

  getAudioIdsInChannel(channel: AudioChannel): string[] {
    const players = Array.from(this.players.values());
    switch (channel) {
      case AudioChannel.Silent: {
        return [];
      }
      case AudioChannel.Lobby: {
        if (this.isGameStarted) {
          // If in game, then add people who are dead
          return players.filter((p) => !p.alive).map((p) => p.audioId!);
        }
        return players.map((p) => p.audioId!); // In lobby
      }
      case AudioChannel.Voting: {
        return players.filter((p) => p.alive).map((p) => p.audioId!);
      }
      default: {
        throw new Error('Invalid AudioChannel passed');
      }
    }
  }

  emitToPlayers(event: string, message: any, filter?: (args0: Player) => boolean) {
    const players = Array.from(this.players.values());
    const filtered = filter ? players.filter(filter) : players;
    filtered.forEach((p) => p.socket.emit(event, message));
  }

  modifySettings() {
    // TODO
  }

  startGame() {
    this.isGameStarted = true;
    const audioIds = this.getAudioIdsInChannel(AudioChannel.Silent);
    this.emitToPlayers('connectAudioIds', audioIds);
    log('info', `Start game for room ${this.id}`);
  }

  endGame() {
    this.isGameStarted = false;
    const audioIds = this.getAudioIdsInChannel(AudioChannel.Lobby);
    this.emitToPlayers('connectAudioIds', audioIds);
    log('info', `End game for room ${this.id}`);
  }

  startVoting() {
    this.isVoting = true;
    const audioIds = this.getAudioIdsInChannel(AudioChannel.Voting);
    this.emitToPlayers('connectAudioIds', audioIds, (p) => p.alive);
    log('info', `Start voting for room ${this.id}`);
  }

  endVoting() {
    this.isVoting = false;
    const audioIds = this.getAudioIdsInChannel(AudioChannel.Silent);
    this.emitToPlayers('connectAudioIds', audioIds, (p) => p.alive);
    log('info', `End voting for room ${this.id}`);
  }
}

export class RoomService implements ObjectService {
  private static instance: RoomService;
  private rooms = new Map<string, GameRoom>();

  private constructor() {
    // Empty private constructor to enforce singleton
  }

  public static getInstance() {
    if (!RoomService.instance) {
      RoomService.instance = new RoomService();
    }
    return RoomService.instance;
  }

  create() {
    const roomId = nanoid();
    const newRoom = new GameRoom(roomId);
    this.rooms.set(roomId, newRoom);
    return newRoom;
  }

  getById(id?: string) {
    return id ? this.rooms.get(id) : undefined;
  }

  /**
   * Only deletes rooms that no longer contain players. Skips if id is not found in the map.
   * @param id
   */
  deleteIfEmpty(id?: string) {
    if (!id) {
      return;
    }
    const roomToDelete = this.rooms.get(id);
    if (!roomToDelete) {
      return;
    }
    if (roomToDelete.players.size <= 1) {
      this.rooms.delete(id);
    }
  }
}
