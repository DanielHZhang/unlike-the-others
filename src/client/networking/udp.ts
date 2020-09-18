import geckos from '@geckos.io/client';
import {StorageKeys} from 'src/client/config/constants';
import {ActionInput, GECKOS_LABEL, PORT} from 'src/shared/constants';

export const channel = geckos({
  authorization: localStorage.getItem(StorageKeys.Jwt) || '',
  label: GECKOS_LABEL,
  port: PORT,
});

/**
 * Array schema: [Uint32, Uint32, Uint32]
 *               [Up/down pressed, left/right pressed, action type]
 */
// export function emitMovement() {
//   const buffer = new ArrayBuffer(12); // 1 byte = 8 bits
//   const inputType = new Uint8Array(buffer, 0, 1);
//   const upDownSlot = new Uint8Array(buffer, 1, 1);
//   const leftRightSlot = new Uint8Array(buffer, 2, 1);
//   const actionSlot = new Uint8Array(buffer, 3, 1);
//   inputType[0] = InputType.Movement;
//   upDownSlot[0] = 1;
//   leftRightSlot[0] = 1;
// }

class BufferMaker {
  public buffer: ArrayBuffer;
  public slots: Uint8Array[];

  // implied that the emitted buffer is still retained in memory
  constructor() {
    this.buffer = new ArrayBuffer(3);
    const slots = ['vertical', 'horizontal', 'actionType'];
    this.slots = slots.map((_, index) => new Uint8Array(this.buffer, index, 1));
  }

  up() {
    this.slots[0][0] = 1;
  }

  down() {
    this.slots[0][0] = 2;
  }

  left() {
    this.slots[1][0] = 1;
  }

  right() {
    this.slots[1][0] = 2;
  }

  action(type: ActionInput) {
    this.slots[2][0] = type;
  }

  isEmpty() {
    return !this.slots.some((uint) => uint[0] !== 0);
  }

  emit() {
    channel.raw.emit(this.buffer);
    this.slots.forEach((uint) => uint.fill(0)); // Reset all slots to 0
  }
}

export const bufferChannel = new BufferMaker();
