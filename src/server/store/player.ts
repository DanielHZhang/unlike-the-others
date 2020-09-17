import {Socket} from 'socket.io';
import {ServerChannel} from '@geckos.io/server';
import {ObjectService} from 'src/shared/types';
import {nanoid} from 'src/server/utils/crypto';

export class Player {
  private position = {x: 0, y: 0};
  // private jobs: Job[];
  private spy = false;
  private meetingsRemaining = 0;
  public alive: boolean = true;
  public id: string;
  public audioId?: string;
  public roomId?: string;
  public socket: Socket;
  public channel?: ServerChannel;
  public active = false;

  constructor(socket: Socket, id?: string) {
    this.socket = socket;
    this.id = id || nanoid();
  }

  joinRoom(roomId: string) {
    this.roomId = roomId;
    this.active = true;
    this.socket.join(roomId);
  }

  leaveRoom(audioIds: string[]) {
    this.socket.emit('connectAudioIds', audioIds);
    this.socket.leave(this.roomId!);
    this.roomId = undefined;
    this.active = false;
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

  public create(socket: Socket, id?: string) {
    const player = new Player(socket, id);
    this.players.set(player.id, player);
    return player;
  }

  /** Get player from player map by their generated id */
  public getById(id: string) {
    return this.players.get(id);
  }
}
