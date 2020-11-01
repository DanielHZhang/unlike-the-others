import Box2d from '@supersede/box2d';
import type * as PIXI from 'pixi.js';
import {Rectangle} from 'src/client/game/debug';
import {snapshotModel} from 'src/shared/buffer-schema';
import {Movement, WORLD_SCALE} from 'src/shared/constants';
import {PhysicsEngine} from 'src/shared/physics-engine';
import type {BufferSnapshotData, InputData} from 'src/shared/types';

// Create 10 players and manage their state

export class EntityManager {
  private engine: PhysicsEngine;
  private playerBody: Box2d.b2Body;
  private pendingInputs: InputData[] = [];
  private sequenceNumber = 0;
  public mainPlayer: {body: Box2d.b2Body; sprite: Rectangle};

  public constructor(engine: PhysicsEngine, stage: PIXI.Container) {
    this.engine = engine;

    // Create physics entities
    this.playerBody = this.engine.createPlayer();
    const playerRect = new Rectangle(0, 0, 100, 100);
    this.playerBody.SetUserData(playerRect);
    // stage.addChild(playerRect);
    this.mainPlayer = {body: this.playerBody, sprite: playerRect};
  }

  public enqueueInput(input: Partial<InputData>): void {
    input.seqNumber = this.sequenceNumber++;
    this.pendingInputs.push(input as InputData);
  }

  public emit(): void {
    // const inputData: BufferInputData = {
    //   s: this.currentInput.seqNumber,
    //   h: this.currentInput.horizontal,
    //   v: this.currentInput.vertical,
    // };
    // connection.emitRaw(inputModel.toBuffer(inputData));
  }

  public DEBUG_processInput(input: InputData): void {
    // this.playerBody.SetPositionXY(playerPosition.x, playerPosition.y);

    // Re-apply input to player
    const vector = new Box2d.b2Vec2();
    const movementUnit = 90 / WORLD_SCALE;
    if (input.horizontal === Movement.Right) {
      vector.Set(movementUnit, 0);
    } else if (input.horizontal === Movement.Left) {
      vector.Set(-movementUnit, 0);
    }
    if (input.vertical === Movement.Down) {
      vector.y = movementUnit;
    } else if (input.vertical === Movement.Up) {
      vector.y = -movementUnit;
    }
    this.playerBody.SetLinearVelocity(vector);
    // console.log('playerbody:', this.playerBody.GetPosition().x, this.playerBody.GetPosition().y);
  }

  public receiveNetwork(data: ArrayBuffer): void {
    const snapshot = snapshotModel.fromBuffer(data) as BufferSnapshotData;
    // console.log('Data from update:', snapshot);

    let i = 0;

    // Set authoritative position received by the server
    const playerPosition = snapshot.players[0];
    this.playerBody.SetPositionXY(playerPosition.x, playerPosition.y);

    // Remove all inputs that have already been processed by the server
    while (i < this.pendingInputs.length) {
      const input = this.pendingInputs[i];
      if (input.seqNumber <= snapshot.seq) {
        this.pendingInputs.splice(i, 1); // Remove input from array
      } else {
        // Re-apply input to player
        const vector = new Box2d.b2Vec2();
        const movementUnit = 90 / WORLD_SCALE;
        if (input.horizontal === Movement.Right) {
          vector.Set(movementUnit, 0);
        } else if (input.horizontal === Movement.Left) {
          vector.Set(-movementUnit, 0);
        }
        if (input.vertical === Movement.Down) {
          vector.y = movementUnit;
        } else if (input.vertical === Movement.Up) {
          vector.y = -movementUnit;
        }
        this.playerBody.SetLinearVelocity(vector);
        i++;
      }
    }
  }
}
