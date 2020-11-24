import {Model, uint8, uint32, float32, Schema} from 'superbuffer';

/**
 * Player movement input.
 */
export const inputModel = Model.fromSchemaDefinition({
  sequenceNumber: uint32,
  movement: uint8,
});

/**
 * Individual player world state.
 */
const playerSchema = new Schema({
  id: uint8,
  x: float32,
  y: float32,
});

/**
 * Snapshot of entire world state.
 */
export const snapshotModel = Model.fromSchemaDefinition({
  sequenceNumber: uint32,
  tick: uint32,
  players: [playerSchema],
});
