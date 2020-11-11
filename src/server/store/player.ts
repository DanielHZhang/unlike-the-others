import Box2D from '@plane2d/core';
import {ServerSocket} from 'src/server/services/websocket';
import {Movement, MOVEMENT_MAGNITUDE, WORLD_SCALE} from 'src/shared/constants';
import type {BufferInputData} from 'src/shared/types';

type PlayerOptions = {
  body: Box2D.b2Body;
  id: number;
  roomId: string;
  userId: string;
  username: string;
};

export class Player {
  private static readonly instances = new Map<string, Player>();
  public static readonly MAX_QUEUE_SIZE = 20;
  public readonly username: string;

  /**
   * Id assigned to the player per game.
   */
  public id: number;

  /**
   * Corresponds with the id field in the JWT claims.
   */
  public userId: string;
  public lastProcessedInput = 0;
  public audioId?: string;
  public body: Box2D.b2Body;
  public roomId: string;
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
   * @param userId Id of the room, if any
   */
  private constructor(options: PlayerOptions) {
    this.id = options.id;
    this.userId = options.userId;
    this.username = options.username;
    this.body = options.body;
    this.body.SetUserData(this); // Set circular reference
    this.roomId = options.roomId;
  }

  /**
   * Creates a new player instance.
   */
  public static create(options: PlayerOptions): Player {
    const player = new Player(options);
    Player.instances.set(player.userId, player);
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

  /**
   * Enqueue inputs to be processed in a single world step update.
   */
  public enqueueInput(input: BufferInputData): void {
    this.inputQueue.push(input);
    if (this.inputQueue.length > Player.MAX_QUEUE_SIZE) {
      this.inputQueue.shift(); // Drop the previously queued input
    }
  }

  public dequeueInput(): BufferInputData | undefined {
    return this.inputQueue.shift();
  }

  public applyLinearImpulse(horizontal: Movement, vertical: Movement): void {
    const vector = {x: 0, y: 0};
    if (horizontal === Movement.Right) {
      vector.x = MOVEMENT_MAGNITUDE;
    } else if (horizontal === Movement.Left) {
      vector.x = -MOVEMENT_MAGNITUDE;
    }
    if (vertical === Movement.Down) {
      vector.y = MOVEMENT_MAGNITUDE;
    } else if (vertical === Movement.Up) {
      vector.y = -MOVEMENT_MAGNITUDE;
    }
    this.body.SetLinearVelocity(vector);
  }

  // public joinRoom(roomId: string): void {
  //   this.roomId = roomId;
  //   // this.active = true;
  //   // this.socket.join(roomId);
  // }

  // public leaveRoom(audioIds: string[]): void {
  //   // this.socket.emit('connectAudioIds', audioIds);
  //   // this.socket.leave(this.roomId!);
  //   this.active = false;
  //   // this.roomId = undefined;
  //   // this.id = undefined;
  //   this.inputQueue = []; // Drop all input when leaving room
  // }

  public kill(audioIds: string[]): void {
    this.alive = false;
    this.socket.emit('connectAudioIds', audioIds);
  }

  public revive(audioIds: string[]): void {
    this.alive = true;
    this.socket.emit('connectAudioIds', audioIds);
  }
}
