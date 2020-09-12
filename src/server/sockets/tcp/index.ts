import http from 'http';
import SocketIo from 'socket.io';
import {log} from 'src/server/utils/logs';
import {PlayerService, RoomService, AudioChannel} from 'src/server/store';

function send<T = string>(status: number, payload: T) {
  return {status, payload};
}

export class TcpServer {
  private io: SocketIo.Server;

  constructor(server: http.Server) {
    this.io = SocketIo(server);

    this.io.on('connection', (socket: SocketIo.Socket) => {
      const clientId = socket.client.id;
      log('info', `Client connected: ${clientId}`);
      const player = PlayerService.create(clientId);

      socket.on('disconnecting', () => {
        const roomIds = Object.keys(socket.rooms);
        roomIds.forEach((id) => RoomService.deleteIfEmpty(id));
      });

      socket.on('createRoom', () => {
        const room = RoomService.create(player);
        socket.join(room.id);
        log('info', `Client ${clientId} created room ${room.id}`);
        socket.emit('createRoomResponse', send(200, room.id));
      });

      socket.on('joinRoom', (roomId: string) => {
        const room = RoomService.getFromId(roomId);
        room.addPlayer(player);
        player.joinRoom(room.id);
        // const audioIds = room.getAudioIdsInChannel(AudioChannel.Lobby);
        // socket.emit('connectAudioIds', audioIds);
        // log('info', `Client ${clientId} joined room ${room.id}`);
      });

      socket.on('leaveRoom', (roomId: string) => {
        const room = RoomService.getFromId(roomId);
        room.removePlayer(player);
        player.leaveRoom(room.id);
        const audioIds = room.getAudioIdsInChannel(AudioChannel.Silent);
        socket.emit('connectAudioIds', audioIds);
        log('info', `Client ${clientId} joined room ${room.id}`);
      });

      socket.on('registerAudioId', (audioId: string) => {
        // player.audioId = audioId;
        // const room = RoomService.getFromId(player.roomId);
        // socket.emit('connectAudioIds', audioIds);
      });

      socket.on('disconnect', () => {
        log('info', `Client disconnected: ${clientId}`);
        const player = PlayerService.getFromSocketId(clientId);
        // player!.audioId = undefined;
      });
    });
  }
}
