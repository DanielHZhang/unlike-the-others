import {BufferSchema, Model, uint8, uint32, float32} from '@geckos.io/typed-array-buffer-schema';
import {BufferInputData, BufferPlayerData, BufferSnapshotData} from 'src/shared/types';

type TypedArray = typeof uint8 | [Record<string, TypedArray>];

const playerSchema: Record<keyof BufferPlayerData, TypedArray> = {
  uiid: uint8,
  x: float32,
  y: float32,
  seq: uint32,
};

const inputSchema: Record<keyof BufferInputData, TypedArray> = {
  seq: uint32,
  h: uint8,
  v: uint8,
};

const snapshotSchema: Record<keyof BufferSnapshotData, TypedArray> = {
  tick: uint32,
  players: [playerSchema],
};

export const playerModel = new Model(BufferSchema.schema('player', playerSchema));
export const inputModel = new Model(BufferSchema.schema('input', inputSchema));
export const snapshotModel = new Model(BufferSchema.schema('snapshot', snapshotSchema));
