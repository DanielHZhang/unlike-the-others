import Box2d from '@supersede/box2d';
import type * as PIXI from 'pixi.js';
import {Rectangle} from 'src/client/game/debug';
import {PlayerEntity} from 'src/client/game/entities/player';
import {snapshotModel} from 'src/shared/buffer-schema';
import {Movement, WORLD_SCALE} from 'src/shared/constants';
import {PhysicsEngine} from 'src/shared/physics-engine';
import type {BufferSnapshotData, InputData} from 'src/shared/types';

// Create 10 players and manage their state

export class EntityManager {
  public player: PlayerEntity;
  protected otherPlayers: PlayerEntity[] = [];
  protected engine: PhysicsEngine;
  protected pendingInputs: InputData[] = [];
  protected sequenceNumber = 0;

  public constructor(engine: PhysicsEngine, stage: PIXI.Container) {
    this.engine = engine;
    this.player = new PlayerEntity(this.engine.createPlayerBody());
  }

  public enqueueInput(input: Partial<InputData>): void {
    // DEBUG:
    this.applyVelocity(input as InputData);
    return;

    input.sequenceNumber = this.sequenceNumber++;
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

  public receiveNetwork(data: ArrayBuffer): void {
    const snapshot = snapshotModel.fromBuffer(data) as BufferSnapshotData;
    // console.log('Data from update:', snapshot);

    let i = 0;

    // Set authoritative position received by the server
    const playerPosition = snapshot.players[0];
    this.player.body.SetPositionXY(playerPosition.x, playerPosition.y);

    // Remove all inputs that have already been processed by the server
    while (i < this.pendingInputs.length) {
      const input = this.pendingInputs[i];
      if (input.sequenceNumber <= snapshot.seq) {
        this.pendingInputs.splice(i, 1); // Remove input from array
      } else {
        this.applyVelocity(input);
        i++;
      }
    }
  }

  private applyVelocity(input: InputData) {
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
    this.player.body.SetLinearVelocity(vector);
  }
}
