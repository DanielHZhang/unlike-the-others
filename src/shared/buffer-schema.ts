import {BufferSchema, Model, uint8, uint32, float32} from '@supersede/buffer-schema';
import type {BufferInputData, BufferPlayerData, BufferSnapshotData} from 'src/shared/types';

type TypedArray = typeof uint8 | [ReturnType<typeof BufferSchema['schema']>];

/**
 * Player movement input.
 */
const input: Record<keyof BufferInputData, TypedArray> = {
  s: uint32,
  h: uint8,
  v: uint8,
};
export const inputSchema = BufferSchema.schema('input', input);
export const inputModel = new Model(inputSchema);
export const INPUT_SCHEMA_ID = BufferSchema.getIdFromSchema(inputSchema);

/**
 * Individual player world state.
 */
const player: Record<keyof BufferPlayerData, TypedArray> = {
  uiid: uint8,
  x: float32,
  y: float32,
};
export const playerSchema = BufferSchema.schema('player', player);
export const playerModel = new Model(playerSchema);

/**
 * Snapshot of entire world state.
 */
const snapshot: Record<keyof BufferSnapshotData, TypedArray> = {
  s: uint32,
  t: uint32,
  p: [playerSchema],
};
export const snapshotSchema = BufferSchema.schema('snapshot', snapshot);
export const snapshotModel = new Model(snapshotSchema);
