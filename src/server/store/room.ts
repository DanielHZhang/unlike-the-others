import {log} from 'src/server/utils/logs';
import {Player} from 'src/server/store/player';
import {nanoid} from 'src/server/utils/crypto';

export type Voting = {
  timeRemaining: number;
  ballots: Ballot[];
};

export type Ballot = {
  voter: string;
  candidate: string | null;
};

export type Job = {
  id: string;
  complete: boolean;
};

type Settings = {
  mapType: 'lol' | 'we' | 'have' | 'no' | 'maps';
  numSpies: number;
  discussionTime: number;
  killCooldown: number;
  emergencyCooldown: number;
  walkingSpeed: number;
  visionRadiusCivilian: number;
  visionRadiusSpy: number;
  numRegularJobs: number;
  numEasyJobs: number;
  numDifficultJobs: number;
};

export enum AudioChannel {
  Lobby,
  Voting,
  Silent,
}

export class GameRoom {
  public static activeRooms: Map<string, GameRoom>;
  public players: Map<string, Player>;
  public id: string;
  public isGameStarted: boolean;
  public isVoting: boolean;
  private host?: Player;
  private settings: Settings;
  private jobs: Job[];
  private voting: Voting;

  constructor(roomId: string) {
    this.id = roomId;
    this.isGameStarted = false;
    this.isVoting = false;
    this.players = new Map();
    this.host = undefined;
    this.jobs = [];
    this.voting = {
      timeRemaining: 0,
      ballots: [],
    };
    this.settings = {
      mapType: 'lol',
      numSpies: 2,
      discussionTime: 120,
      killCooldown: 30,
      emergencyCooldown: 30,
      walkingSpeed: 1,
      visionRadiusCivilian: 1,
      visionRadiusSpy: 1.5,
      numRegularJobs: 2,
      numEasyJobs: 3,
      numDifficultJobs: 1,
    };
  }

  addPlayer(player: Player) {
    if (!this.host) {
      this.host = player;
    }
    this.players.set(player.id, player);
  }

  removePlayer(player: Player) {
    if (this.players.has(player.id)) {
      this.players.delete(player.id);
    }
    if (this.host === player && this.players.size > 0) {
      this.host = this.players.values().next().value;
    }
  }

  getAudioIdsInChannel(channel: AudioChannel) {
    const players = Array.from(this.players.values());
    if (channel === AudioChannel.Silent) {
      return [];
    } else if (channel === AudioChannel.Lobby) {
      // Check if in lobby
      if (!this.isGameStarted) {
        return players.map((p) => p.audioId);
      }
      // If in game, then add people who are dead
      return players.filter((p) => p.alive === false).map((p) => p.audioId);
    } else if (channel === AudioChannel.Voting) {
      return players.filter((p) => p.alive === true).map((p) => p.audioId);
    } else {
      throw 'Invalid AudioChannel passed';
    }
  }

  socketEmitToPlayers(event: string, message: any, filter?: (args0: Player) => boolean) {
    let players = Array.from(this.players.values());
    const filtered = filter ? players.filter(filter) : players;
    filtered.forEach((p) => {
      p.socket.emit(event, message);
    });
  }

  modifySettings() {}

  startGame() {
    this.isGameStarted = true;
    const audioIds = this.getAudioIdsInChannel(AudioChannel.Silent);
    this.socketEmitToPlayers('connectAudioIds', audioIds);
    log('info', `Start game for room ${this.id}`);
  }

  endGame() {
    this.isGameStarted = false;
    const audioIds = this.getAudioIdsInChannel(AudioChannel.Lobby);
    this.socketEmitToPlayers('connectAudioIds', audioIds);
    log('info', `End game for room ${this.id}`);
  }

  startVoting() {
    this.isVoting = true;
    const audioIds = this.getAudioIdsInChannel(AudioChannel.Voting);
    this.socketEmitToPlayers('connectAudioIds', audioIds, (p) => p.alive);
    log('info', `Start voting for room ${this.id}`);
  }

  endVoting() {
    this.isVoting = false;
    const audioIds = this.getAudioIdsInChannel(AudioChannel.Silent);
    this.socketEmitToPlayers('connectAudioIds', audioIds, (p) => p.alive);
    log('info', `End voting for room ${this.id}`);
  }
}

export const RoomService = new (class {
  private rooms = new Map<string, GameRoom>();

  create() {
    const roomId = nanoid();
    const newRoom = new GameRoom(roomId);
    this.rooms.set(roomId, newRoom);
    return newRoom;
  }

  getFromId(id: string) {
    return this.rooms.get(id);
  }

  /**
   * Does not delete rooms that still contain players and skips if room id is not found.
   * @param id
   */
  deleteIfEmpty(id: string) {
    const roomToDelete = this.rooms.get(id);
    if (!roomToDelete) {
      return;
    }
    if (roomToDelete.players.size <= 1) {
      this.rooms.delete(id);
    }
  }
})();
