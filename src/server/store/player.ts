import Box2d from '@supersede/box2d';
import {ServerChannel} from '@geckos.io/server';
import {nanoid} from 'src/server/utils/crypto';
import {Socket} from 'src/server/services/sockets';
import type {BufferInputData, InputData} from 'src/shared/types';

export class Player {
  public static readonly MAX_QUEUE_SIZE = 20;
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
  public socket?: Socket;
  public channel?: ServerChannel;
  public active = false;
  public body?: Box2d.b2Body;
  private inputQueue: BufferInputData[] = [];
  public lastProcessedInput = 0;

  /**
   * Private constructor to prevent instances from being created outside of static methods
   * @param socket Reference to the socket object
   * @param id Id of the room, if any
   */
  private constructor(id: string) {
    // this.socket = socket;
    this.id = id;
  }

  /**
   * Creates a new room instance with a random id using the provided TCP socket
   */
  public static create(id: string): Player {
    const player = new Player(id);
    Player.instances.set(player.id, player);
    return player;
  }

  /**
   * Get player from player map by their generated id
   */
  public static getById(id: string): Player | undefined {
    return Player.instances.get(id);
  }

  public enqueueInput(input: BufferInputData) {
    this.inputQueue.push(input);
    if (this.inputQueue.length > Player.MAX_QUEUE_SIZE) {
      this.inputQueue.shift(); // Drop the previously queued input
    }
  }

  public dequeueInput() {
    return this.inputQueue.shift();
  }

  public processInputs() {
    // POTENTIALLY HANDLE PLAYER INPUTS HERE
  }

  public joinRoom(roomId: string) {
    this.roomId = roomId;
    this.active = true;
    this.socket.join(roomId);
  }

  public leaveRoom(audioIds: string[]) {
    this.socket.emit('connectAudioIds', audioIds);
    this.socket.leave(this.roomId!);
    this.active = false;
    this.roomId = undefined;
    this.uiid = undefined;
    this.inputQueue = []; // Drop all input when leaving room
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
