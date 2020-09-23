import path from 'path';

/** Path in the local file system to the folder containing the assets of the game */
export const ASSETS_FOLDER_PATH = path.join(process.cwd(), 'assets');

/** Maximum number of players allowed in a single room */
export const MAX_ROOM_SIZE = 15;

/** Defines which channel the player is in */
export enum AudioChannel {
  Lobby,
  Voting,
  Silent,
}
