import {Socket} from 'socket.io';
import {ObjectService} from 'src/config/types';

export class Player {
  private position: {
    x: number;
    y: number;
  };
  // private jobs: Job[];
  private spy: boolean;
  private meetingsRemaining: number;
  public alive: boolean;
  public id: string;
  public audioId?: string;
  public roomId?: string;
  public socket: Socket;

  constructor(socket: Socket) {
    this.socket = socket;
    this.id = socket.client.id;
    this.roomId = undefined;
    this.audioId = undefined;
    this.position = {
      x: 0,
      y: 0,
    };
    this.alive = true;
    this.spy = false;
    this.meetingsRemaining = 0;
  }

  joinRoom(roomId: string) {
    this.roomId = roomId;
    this.socket.join(roomId);
  }

  leaveRoom(audioIds: string[]) {
    this.socket.emit('connectAudioIds', audioIds);
    this.socket.leave(this.roomId!);
    this.roomId = undefined;
  }

  kill(audioIds: string[]) {
    this.alive = false;
    this.socket.emit('connectAudioIds', audioIds);
  }

  revive(audioIds: string[]) {
    this.alive = true;
    this.socket.emit('connectAudioIds', audioIds);
  }
}

export class PlayerService implements ObjectService {
  private static instance: PlayerService;
  private players = new Map<string, Player>();

  private constructor() {
    // Empty private constructor to enforce singleton
  }

  public static getInstance() {
    if (!PlayerService.instance) {
      PlayerService.instance = new PlayerService();
    }
    return PlayerService.instance;
  }

  public create(socket: Socket) {
    const player = new Player(socket);
    this.players.set(player.id, player);
    return player;
  }

  public getById(id: string) {
    return this.players.get(id);
  }
}
