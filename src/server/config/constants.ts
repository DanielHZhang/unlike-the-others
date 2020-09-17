import path from 'path';

/** Path in the local file system to which the vendor files will be emitted */
export const BUILD_FOLDER_PATH = path.join(process.cwd(), '.build');

/** Path in the local file system to the folder containing the assets of the game */
export const ASSETS_FOLDER_PATH = path.join(process.cwd(), 'assets');

/** URL path to which vendor files can be accessed from */
export const PUBLIC_PATH = '/static/';

/** Path in the local file system to the client-side React root */
export const APP_ENTRY_PATH = path.join(process.cwd(), 'src', 'client', 'index.tsx');

/** Path in the local file system to the vendor.dll.json file */
export const VENDOR_JSON_PATH = path.join(BUILD_FOLDER_PATH, 'vendor.json');

/** Path in the local file system to the template.html file */
export const TEMPLATE_HTML_PATH = path.join(process.cwd(), 'src', 'client', 'template.html');

/** Packages that are required in all routes to be bundled in the DLL */
export const vendors = [
  'react',
  'react-dom',
  'react-router-dom',
  'recoil',
  'phaser',
  '@geckos.io/client',
  'socket.io-client',
];

/** Defines which channel the player is in */
export enum AudioChannel {
  Lobby,
  Voting,
  Silent,
}

/** Maximum number of players allowed in a single room */
export const MAX_ROOM_SIZE = 15;
