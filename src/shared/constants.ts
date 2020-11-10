/** Boolean indicating whether the program is running in a production or development environment. */
export const IS_PRODUCTION_ENV = process.env.NODE_ENV === 'production';

/** Host domain of the website. */
export const HOST = IS_PRODUCTION_ENV ? '' : 'localhost:8080';

/** Base url of the website. */
export const BASE_URL = `http${IS_PRODUCTION_ENV ? 's' : ''}://${HOST}`;

/** Port to connect to the TCP server. */
export const PORT = 8080;

/** Label of the Geckos.io channel. */
export const GECKOS_LABEL = 'udp';

/** Conversion between metres and pixels (e.g. 1 metre = x pixels). */
export const WORLD_SCALE = 30;

/** Maximum number of characters for player usernames. */
export const MAX_USERNAME_LENGTH = 20;

/** Maximum number of characters for player usernames. */
export const MIN_USERNAME_LENGTH = 4;

/** Regex to test for a string that only contains alphanumeric (including accented) characters. */
export const USERNAME_VALIDATION_REGEX = new RegExp('^[A-Za-zÀ-ÖØ-öø-ÿ0-9]+$', 'i');

/** Maximum number of characters for account emails. */
export const MAX_EMAIL_LENGTH = 50;

/** Maximum number of characters for account passwords. */
export const MAX_PASSWORD_LENGTH = 50;

/** Minimum number of characters for account passwords. */
export const MIN_PASSWORD_LENGTH = 8;

/** Linear velocity to be applied to the player body. */
export const MOVEMENT_MAGNITUDE = 150 / WORLD_SCALE;

/** Enum for direction of movement. */
export enum Movement {
  Up,
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

export enum BufferEventType {
  Movement,
  Snapshot,
  Action,
}
