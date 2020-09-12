import {nanoid} from 'nanoid';
import {GameStatus} from 'src/config/types';
import {Player} from 'src/server/store/player';

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
  private host: Player;
  private status: GameStatus;
  private settings: Settings;
  private jobs: Job[];
  private voting: Voting;

  constructor(roomId: string, host: Player) {
    this.id = roomId;
    this.status = GameStatus.Lobby;
    this.players = new Map();
    this.host = host;
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
    this.players.set(player.id, player);
  }

  removePlayer(player: Player) {
    this.players.delete(player.id);
  }

  getAudioIdsInChannel(channel: AudioChannel) {
    const players = Array.from(this.players.values());
    if (channel === AudioChannel.Silent) {
      return [];
    } else if (channel === AudioChannel.Lobby) {
      // Check if in lobby
      if (this.status === GameStatus.Lobby) {
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

  modifySettings() {}

  startGame() {}

  endGame() {}

  startVoting() {}

  endVoting() {}
}

export const RoomService = new (class {
  private rooms = new Map<string, GameRoom>();

  create(host: Player) {
    const roomId = nanoid(20);
    const newRoom = new GameRoom(roomId, host);
    this.rooms.set(roomId, newRoom);
    return newRoom;
  }

  getFromId(id: string) {
    return this.rooms.get(id);
  }

  getFromPlayer(player: Player) {
    const roomId = player.roomId;
    return this.rooms.get(roomId);
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
    if (roomToDelete.players.length === 1) {
      this.rooms.delete(id);
    }
  }
})();
