import Box2D from '@plane2d/core';
import {ServerSocket} from 'src/server/services/websocket';
import type {BufferInputData} from 'src/shared/types';

export class Player {
  private static readonly instances = new Map<string, Player>();
  public static readonly MAX_QUEUE_SIZE = 20;
  public readonly username: string;
  public id: string;
  public lastProcessedInput = 0;
  public uiid?: number; // Unsigned integer id
  public audioId?: string;
  public body?: Box2D.b2Body;
  public roomId?: string;
  public socket?: ServerSocket;
  private active = false;
  private alive = true;
  private inputQueue: BufferInputData[] = [];
  // private meetingsRemaining = 0;
  // private spy = false;
  // private jobs: Job[];

  /**
   * Private constructor to prevent instances from being created outside of static methods
   * @param socket Reference to the socket object
   * @param id Id of the room, if any
   */
  private constructor(id: string, username: string) {
    this.id = id;
    this.username = username;
  }

  /**
   * Creates a new player instance.
   */
  public static create(id: string, username: string): Player {
    const player = new Player(id, username);
    Player.instances.set(player.id, player);
    return player;
  }

  /**
   * Gets a player instance by its ID from the instances hashmap.
   */
  public static getById(id: string): Player | undefined {
    return Player.instances.get(id);
  }

  /**
   * Deletes a player by its ID from the instances hashmap.
   * @returns True if the delete operation completed successfully.
   */
  public static deleteById(id: string): boolean {
    return Player.instances.delete(id);
  }

  /**
   * Returns whether the player is currently active. Players are considered active if they
   * have joined a room and have an active websocket connection.
   */
  public get isActive(): boolean {
    return this.socket !== undefined && this.active;
  }

  public get isAlive(): boolean {
    return this.alive;
  }

  public activate(socket: ServerSocket): void {
    this.socket = socket;
    this.active = true;
  }

  public deactivate(): void {
    this.socket = undefined;
    this.active = false;
  }

  public enqueueInput(input: BufferInputData): void {
    this.inputQueue.push(input);
    if (this.inputQueue.length > Player.MAX_QUEUE_SIZE) {
      this.inputQueue.shift(); // Drop the previously queued input
    }
  }

  public dequeueInput(): BufferInputData | undefined {
    return this.inputQueue.shift();
  }

  public processInputs(): void {
    // POTENTIALLY HANDLE PLAYER INPUTS HERE
  }

  public joinRoom(roomId: string): void {
    this.roomId = roomId;
    // this.active = true;
    // this.socket.join(roomId);
  }

  public leaveRoom(audioIds: string[]): void {
    // this.socket.emit('connectAudioIds', audioIds);
    // this.socket.leave(this.roomId!);
    this.active = false;
    this.roomId = undefined;
    this.uiid = undefined;
    this.inputQueue = []; // Drop all input when leaving room
  }

  public kill(audioIds: string[]): void {
    this.alive = false;
    this.socket.emit('connectAudioIds', audioIds);
  }

  public revive(audioIds: string[]): void {
    this.alive = true;
    this.socket.emit('connectAudioIds', audioIds);
  }
}
