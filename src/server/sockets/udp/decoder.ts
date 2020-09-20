import {InputData} from 'src/shared/types';

class BufferDecoder {
  bufferToMessage(buffer: ArrayBuffer): InputData {
    return {
      sequenceNumber: new Uint32Array(buffer, 0, 1)[0],
      verticalMovement: new Uint8Array(buffer, 4, 1)[0],
      horizontalMovement: new Uint8Array(buffer, 5, 1)[0],
      actionType: new Uint8Array(buffer, 6, 1)[0],
    };
  }
}

export const bufferDecode = new BufferDecoder();
