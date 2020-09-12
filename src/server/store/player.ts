export class Player {
  private position: {
    x: number;
    y: number;
  };
  // private jobs: Job[];
  alive: boolean;
  private spy: boolean;
  private meetingsRemaining: number;
  id: string;
  socketId: string;
  public audioId?: string;
  public roomId?: string;

  constructor(socketId: string) {
    this.id = socketId;
    this.socketId = socketId;
    this.audioId = undefined;
    this.position = {
      x: 0,
      y: 0,
    };
    this.alive = true;
    this.spy = false;
    this.meetingsRemaining = 0;
  }

  joinRoom(roomId: string) {
    this.roomId = roomId;
  }

  leaveRoom(roomId: string) {
    this.roomId = undefined;
  }
}

export const PlayerService = new (class {
  private players = new Map<string, Player>();
  private socketIdToPlayerId = new Map<string, string>();

  create(socketId: string) {
    const player = new Player(socketId);
    this.players.set(socketId, player);
    this.socketIdToPlayerId.set(socketId, player.id);
    return player;
  }

  getFromId(id: string) {
    return this.players.get(id);
  }

  getFromSocketId(socketId: string) {
    const playerId = this.socketIdToPlayerId.get(socketId);
    return this.getFromId(playerId);
  }
})();
