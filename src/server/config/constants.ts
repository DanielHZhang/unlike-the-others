import path from 'path';
import {IS_PRODUCTION_ENV} from 'src/shared/constants';
import type {CookieSerializeOptions} from 'fastify-cookie';

/** Path in the local file system to the folder containing the assets of the game. */
export const ASSETS_FOLDER_PATH = path.join(process.cwd(), 'assets');

/** Path in the local file system to the folder containing local development files. */
export const LOCAL_FOLDER_PATH = path.join(process.cwd(), '.local');

/** Number of seconds before running server shutdown on SIGTERM. */
export const SHUTDOWN_WAIT_TIME = 10;

/** Semantic versioning of fastify required by plugins. */
export const FASTIFY_SEM_VER = '>=3.0.0';

/** Cookie options for refresh tokens */
export const REFRESH_COOKIE_OPTIONS: CookieSerializeOptions = {
  httpOnly: true,
  path: '/',
  sameSite: 'lax',
  secure: IS_PRODUCTION_ENV,
};

/** Defines which channel the player is in. */
export enum AudioChannel {
  Lobby,
  Voting,
  Silent,
}

/** Defines the keys used for cookies. */
export enum CookieKeys {
  Refresh = 'refresh',
}
