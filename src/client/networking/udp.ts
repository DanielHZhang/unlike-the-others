import geckos from '@geckos.io/client';
import {StorageKeys} from 'src/client/config/constants';
import {ActionInput, GECKOS_LABEL, PORT} from 'src/shared/constants';

export const channel = geckos({
  authorization: localStorage.getItem(StorageKeys.Jwt) || '',
  label: GECKOS_LABEL,
  port: PORT,
});

window.addEventListener('beforeunload', () => {
  channel.close(); // Close the channel on page navigation or reload
});

class BufferEncoder {
  public buffer = new ArrayBuffer(7);
  public slots: [Uint32Array, Uint8Array, Uint8Array, Uint8Array];
  public sequenceNumber = 0;

  // implied that the emitted buffer is still retained in memory
  constructor() {
    this.slots = [
      new Uint32Array(this.buffer, 0, 1), // Input sequence number
      new Uint8Array(this.buffer, 4, 1), // Up/down pressed
      new Uint8Array(this.buffer, 5, 1), // Left/right pressed
      new Uint8Array(this.buffer, 6, 1), // Action type
    ];
    this.slots[0][0] = this.sequenceNumber; // Set initial sequence number to 0
  }

  up() {
    this.slots[1][0] = 1;
  }

  down() {
    this.slots[1][0] = 2;
  }

  left() {
    this.slots[2][0] = 1;
  }

  right() {
    this.slots[2][0] = 2;
  }

  action(type: ActionInput) {
    this.slots[2][0] = type;
  }

  isEmpty() {
    // Ignore first slot due to sequence number constantly changing
    for (let i = 1; i < this.slots.length; i++) {
      if (this.slots[i][0] !== 0) {
        return false;
      }
    }
    return true;
  }

  emit() {
    channel.raw.emit(this.buffer);
    this.slots.forEach((uint) => uint.fill(0)); // Reset all slots to 0
    this.slots[0][0] = ++this.sequenceNumber;
  }
}

export const bufferChannel = new BufferEncoder();
