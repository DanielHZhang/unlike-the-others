import Box2D from '@plane2d/core';
import {connection} from 'src/client/network';
import {inputModel} from 'src/shared/buffer-schema';
import {Movement, WORLD_SCALE} from 'src/shared/constants';
import type {BufferInputData, BufferSnapshotData, Direction} from 'src/shared/types';

export class NetworkInputManager {
  public dequeue(snapshot: BufferSnapshotData, playerBody: Box2D.b2Body): void {
    let i = 0;

    // Set authoritative position received by the server
    const playerPosition = snapshot.p[0];
    playerBody.SetPositionXY(playerPosition.x, playerPosition.y);

    // Remove all inputs that have already been processed by the server
    while (i < this.pendingInputs.length) {
      const input = this.pendingInputs[i];
      if (input.s <= snapshot.s) {
        this.pendingInputs.splice(i, 1); // Remove input from array
      } else {
        // Re-apply input to player
        const vector = new Box2D.b2Vec2();
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
}
