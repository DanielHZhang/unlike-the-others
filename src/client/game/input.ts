import Box2d from '@supersede/box2d';
import {connection} from 'src/client/network';
import {inputModel} from 'src/shared/buffer-schema';
import {Movement, WORLD_SCALE} from 'src/shared/constants';
import type {BufferInputData, BufferSnapshotData} from 'src/shared/types';

export class NetworkInputManager {
  public pendingInputs: BufferInputData[] = [];
  private input: BufferInputData = {
    s: 1,
    h: -1,
    v: -1,
  };

  public dequeue(snapshot: BufferSnapshotData, playerBody: Box2d.b2Body): void {
    let i = 0;

    // Set authoritative position received by the server
    const playerPosition = snapshot.players[0];
    playerBody.SetPositionXY(playerPosition.x, playerPosition.y);

    // Remove all inputs that have already been processed by the server
    while (i < this.pendingInputs.length) {
      const input = this.pendingInputs[i];
      if (input.s <= snapshot.seq) {
        this.pendingInputs.splice(i, 1); // Remove input from array
      } else {
        // Re-apply input to player
        const vector = new Box2d.b2Vec2();
        const movementUnit = 90 / WORLD_SCALE;
        if (input.h === Movement.Right) {
          vector.Set(movementUnit, 0);
        } else if (input.h === Movement.Left) {
          vector.Set(-movementUnit, 0);
        }
        if (input.v === Movement.Down) {
          vector.y = movementUnit;
        } else if (input.v === Movement.Up) {
          vector.y = -movementUnit;
        }
        playerBody.SetLinearVelocity(vector);
        i++;
      }
    }
  }

  public reset() {
    this.input.h = -1;
    this.input.v = -1;
  }

  public setMovement(movementType: 'left' | 'right' | 'up' | 'down'): void {
    switch (movementType) {
      case 'up': {
        this.input.v = Movement.Up;
        return;
      }
      case 'down': {
        this.input.v = Movement.Down;
        return;
      }
      case 'left': {
        this.input.h = Movement.Left;
        return;
      }
      case 'right': {
        this.input.h = Movement.Right;
        return;
      }
    }
  }

  public emit(): void {
    this.pendingInputs.push({...this.input});
    // Only emit if h or v have been assigned values
    if (this.input.h > -1 || this.input.v > -1) {
      // connection.raw.emit(inputModel.toBuffer(this.input));
      this.input.s++;
      this.reset();
    }
  }
}
