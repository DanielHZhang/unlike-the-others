import path from 'path';

/** Path in the local file system to the folder containing the assets of the game. */
export const ASSETS_FOLDER_PATH = path.join(process.cwd(), 'assets');

/** Maximum number of players allowed in a single room. */
export const MAX_ROOM_SIZE = 15;

/** Number of seconds before running server shutdown on SIGTERM. */
export const SHUTDOWN_WAIT_TIME = 10;

/** Defines which channel the player is in. */
export enum AudioChannel {
  Lobby,
  Voting,
  Silent,
}
