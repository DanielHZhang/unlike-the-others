import Box2d from '@supersede/box2d';
import {Socket} from 'socket.io';
import {ServerChannel} from '@geckos.io/server';
import {nanoid} from 'src/server/utils/crypto';
import {InputData} from 'src/shared/types';

export class Player {
  private static readonly instances = new Map<string, Player>();
  private position = {x: 0, y: 0};
  // private jobs: Job[];
  private spy = false;
  private meetingsRemaining = 0;
  public alive = true;
  public id: string;
  public uiid?: number; // Unsigned integer id
  public audioId?: string;
  public roomId?: string;
  public socket: Socket;
  public channel?: ServerChannel;
  public active = false;
  public body?: Box2d.b2Body;
  public inputQueue: InputData[] = [];
  public lastProcessedInput = -1;

  /**
   * Private constructor to prevent instances from being created outside of static methods
   * @param socket Reference to the socket object
   * @param id Id of the room, if any
   */
  private constructor(socket: Socket, id: string = nanoid()) {
    this.socket = socket;
    this.id = id;
  }

  /**
   * Creates a new room instance with a random id using the provided TCP socket
   */
  public static create(socket: Socket, id?: string): Player {
    const player = new Player(socket, id);
    Player.instances.set(player.id, player);
    return player;
  }

  /**
   * Get player from player map by their generated id
   */
  public static getById(id: string): Player | undefined {
    return Player.instances.get(id);
  }

  public joinRoom(roomId: string) {
    this.roomId = roomId;
    this.active = true;
    this.socket.join(roomId);
  }

  public leaveRoom(audioIds: string[]) {
    this.socket.emit('connectAudioIds', audioIds);
    this.socket.leave(this.roomId!);
    this.roomId = undefined;
    this.active = false;
  }

  public kill(audioIds: string[]) {
    this.alive = false;
    this.socket.emit('connectAudioIds', audioIds);
  }

  public revive(audioIds: string[]) {
    this.alive = true;
    this.socket.emit('connectAudioIds', audioIds);
  }
}
