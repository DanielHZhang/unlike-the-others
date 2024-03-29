// Shared/agnostic types

export type AnyFunction = (...args: any[]) => any;

export type Keybindings = {
  up: string;
  left: string;
  down: string;
  right: string;
  sprint: string;
  kill: string;
  vent: string;
  report: string;
  use: string;
};

export type InputData = {
  sequenceNumber: number;
  horizontal: number;
  vertical: number;
};

// Client-side types

export type AccessTokenData = {accessToken: string; claims: JwtClaims};

// export type InputData = {
//   sequenceNumber: number;
//   verticalMovement: number;
//   horizontalMovement: number;
//   actionType: number;
//   // /** Type of input */
//   // t: PlayerInput;
//   // /** Timestamp */
//   // ts: number;
// };

export type PlayerData = {
  id: number; // Temp game id of the player
  x: number; // X position
  y: number; // Y position
};

export type SnapshotData = {
  sequenceNumber: number; // Sequence number
  tick: number; // Tick number
  players: PlayerData[]; // Players data array
};

// Server-side types

export type JwtClaims = {
  id: string;
  isGuest: boolean;
  username: string;
  hashtag?: string | undefined;
  iat?: number;
};

export type FastifyReplyError = {
  error: string;
  message: string;
  statusCode: string;
};

export type SocketResponse<T = string> = {
  status: number;
  payload: T;
};

export type UdpMessage = {
  seqNum: number;
  entityId: number;
  pressTime: number;
};
