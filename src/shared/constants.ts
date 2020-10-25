/** Boolean indicating whether the program is running in a production or development environment */
export const IS_PRODUCTION_ENV = process.env.NODE_ENV === 'production';

/** Base URL of the website */
export const ROOT_URL = IS_PRODUCTION_ENV ? '' : 'localhost:8080';

/** Port to connect to the TCP server */
export const PORT = 8080;

/** Label of the Geckos.io channel */
export const GECKOS_LABEL = 'udp';

/** Number of ticks per second the simulation should be updated */
export const TICK_RATE = 60;

/** Time allotted for a single physics simulation step */
export const FIXED_TIMESTEP = 1 / TICK_RATE;

/** Number of iterations per increment the velocity solver should take (more iterations = higher fidelity) */
export const VELOCITY_ITERATIONS = 8;

/** Number iterations per increment the position solver should take (more iterations = higher fidelity) */
export const POSITION_ITERATIONS = 3;

/** Conversion between metres and pixels (e.g. 1 metre = x pixels) */
export const WORLD_SCALE = 30;

/** Maximum number of steps the physics engine will take in order to avoid the spiral of death. */
export const MAX_STEPS = 5;

/** Maximum number of characters for player usernames. */
export const MAX_USERNAME_LENGTH = 20;

/** Maximum number of characters for player usernames. */
export const MIN_USERNAME_LENGTH = 4;

/** Maximum number of characters for account emails. */
export const MAX_EMAIL_LENGTH = 50;

/** Maximum number of characters for account passwords. */
export const MAX_PASSWORD_LENGTH = 50;

/** Minimum number of characters for account passwords. */
export const MIN_PASSWORD_LENGTH = 8;

export enum Movement {
  Up = 1,
  Down,
  Left,
  Right,
}

export enum ActionInput {
  Kill,
  Report,
  Sabotage,
  CallMeeting,
}
