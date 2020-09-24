import Box2d from '@supersede/box2d';
import {channel} from 'src/client/networking/udp';
import {inputModel} from 'src/shared/buffer-schema';
import {Movement, WORLD_SCALE} from 'src/shared/constants';
import {BufferInputData, BufferSnapshotData} from 'src/shared/types';

export const InputHandler = new (class {
  public pendingInputs: BufferInputData[] = [];
  private input: BufferInputData = {
    s: 1,
    h: 0,
    v: 0,
  };

  public enqueue() {
    this.pendingInputs.push({...this.input});
  }

  public dequeue(snapshot: BufferSnapshotData, playerBody: Box2d.b2Body) {
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
    this.input.h = 0;
    this.input.v = 0;
  }

  public right() {
    this.input.h = Movement.Right;
  }

  public left() {
    this.input.h = Movement.Left;
  }

  public up() {
    this.input.v = Movement.Up;
  }

  public down() {
    this.input.v = Movement.Down;
  }

  public emit() {
    // Only emit if h or v have non-zero values
    if (this.input.h > 0 || this.input.v > 0) {
      channel.raw.emit(inputModel.toBuffer(this.input));
      this.input.s++;
      this.reset();
    }
  }
})();
