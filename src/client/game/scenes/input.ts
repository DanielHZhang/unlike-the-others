import {channel} from 'src/client/networking/udp';
import {inputModel} from 'src/shared/buffer-schema';
import {Movement} from 'src/shared/constants';
import {BufferInputData} from 'src/shared/types';

export const InputHandler = new (class {
  private input: BufferInputData = {
    seq: 1,
    h: 0,
    v: 0,
  };

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
      const buffer = inputModel.toBuffer(this.input);
      channel.emit('input', buffer);
      this.input.seq++;
      this.reset();
    }
  }
})();
