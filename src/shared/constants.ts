/** Boolean indicating whether the program is running in a production or development environment */
export const IS_PRODUCTION_ENV = process.env.NODE_ENV === 'production';

/** Base URL of the website */
export const ROOT_URL = IS_PRODUCTION_ENV ? '' : 'http://localhost:8080/';

/** Port to connect to the TCP server */
export const PORT = 8080;

/** How often the physics simulation should be incremented per second */
export const FIXED_TIMESTEP = 1 / 60;

/** How many iterations per increment the velocity solver should take (more iterations = higher fidelity) */
export const VELOCITY_ITERATIONS = 8;

/** How many iterations per increment the position solver should take (more iterations = higher fidelity) */
export const POSITION_ITERATIONS = 3;

/** Conversion between metres and pixels (e.g. 1 metre = x pixels) */
export const WORLD_SCALE = 30;

/** Maximum number of steps the physics engine will take in order to avoid the spiral of death. */
export const MAX_STEPS = 5;
