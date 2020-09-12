import SocketIo from 'socket.io';
import {GameRoom, AudioChannel} from 'src/server/store/room';
import {log} from 'src/server/utils/logs';

export class Player {
  private position: {
    x: number;
    y: number;
  };
  // private jobs: Job[];
  private spy: boolean;
  private meetingsRemaining: number;
  public alive: boolean;
  public id: string;
  public audioId?: string;
  public room?: GameRoom;
  public socket: SocketIo.Socket;

  constructor(socket: SocketIo.Socket) {
    this.socket = socket;
    this.id = socket.client.id;
    this.audioId = undefined;
    this.position = {
      x: 0,
      y: 0,
    };
    this.alive = true;
    this.spy = false;
    this.meetingsRemaining = 0;
  }

  joinRoom(room: GameRoom) {
    this.room = room;
  }

  leaveRoom() {
    this.room = undefined;
  }

  kill() {
    this.alive = false;
    const audioIds = this.room.getAudioIdsInChannel(AudioChannel.Lobby);
    this.socket.emit('connectAudioIds', audioIds);
    log('info', `Kill player ${this.id}`);
  }

  revive() {
    this.alive = true;
    let audioIds = this.room.getAudioIdsInChannel(AudioChannel.Silent);
    if (this.room.isGameStarted && this.room.isVoting) {
      audioIds = this.room.getAudioIdsInChannel(AudioChannel.Voting);
    } else {
      audioIds = this.room.getAudioIdsInChannel(AudioChannel.Lobby);
    }
    this.socket.emit('connectAudioIds', audioIds);
    log('info', `Revive player ${this.id}`);
  }
}

export const PlayerService = new (class {
  private players = new Map<string, Player>();

  create(socket: SocketIo.Socket) {
    const player = new Player(socket);
    this.players.set(player.id, player);
    return player;
  }

  getFromId(id: string) {
    return this.players.get(id);
  }
})();
