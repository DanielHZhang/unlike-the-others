import {BufferSchema, Model, uint8, uint32, float32} from '@geckos.io/typed-array-buffer-schema';
import type {BufferInputData, BufferPlayerData, BufferSnapshotData} from 'src/shared/types';

type TypedArray = typeof uint8 | [ReturnType<typeof BufferSchema['schema']>];

const player: Record<keyof BufferPlayerData, TypedArray> = {
  uiid: uint8,
  x: float32,
  y: float32,
};
const playerSchema = BufferSchema.schema('player', player);

const input: Record<keyof BufferInputData, TypedArray> = {
  s: uint32,
  h: uint8,
  v: uint8,
};
const inputSchema = BufferSchema.schema('input', input);

const snapshot: Record<keyof BufferSnapshotData, TypedArray> = {
  seq: uint32,
  tick: uint32,
  players: [playerSchema],
};
const snapshotSchema = BufferSchema.schema('snapshot', snapshot);

export const playerModel = new Model(playerSchema);
export const inputModel = new Model(inputSchema);
export const snapshotModel = new Model(snapshotSchema);
