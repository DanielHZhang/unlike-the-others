import path from 'path';

/** Boolean indicating whether the program is running in a production or development environment */
export const IS_PRODUCTION_ENV = process.env.NODE_ENV === 'production';

/** Base URL of the website */
export const ROOT_URL = IS_PRODUCTION_ENV ? '' : 'http://localhost:8080/';

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

/** Port to connect to the TCP server */
export const PORT = 8080;

/** Defines which channel the player is in */
export enum AudioChannel {
  Lobby,
  Voting,
  Silent,
}

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
