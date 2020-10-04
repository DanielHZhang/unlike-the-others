import path from 'path';

/** Path in the local file system to the folder containing the assets of the game. */
export const ASSETS_FOLDER_PATH = path.join(process.cwd(), 'assets');

/** Path in the local file system to the folder containing local development files. */
export const LOCAL_FOLDER_PATH = path.join(process.cwd(), '.local');

/** Number of seconds before running server shutdown on SIGTERM. */
export const SHUTDOWN_WAIT_TIME = 10;

/** Semantic versioning of fastify required by plugins. */
export const FASTIFY_SEM_VER = '>=3.0.0';

/** Defines which channel the player is in. */
export enum AudioChannel {
  Lobby,
  Voting,
  Silent,
}

/** Defines the keys used for cookies. */
export enum CookieKeys {
  RefreshToken = 'access',
  Csrf = '_csrf',
}
