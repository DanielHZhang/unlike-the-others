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
      const player = PlayerService.create(socket);

      socket.on('disconnecting', () => {
        if (player.room) {
          player.room.removePlayer(player);
          RoomService.deleteIfEmpty(player.room.id);
        }
        log('info', `Client disconnecting: ${clientId}`);
      });

      socket.on('createRoom', () => {
        const room = RoomService.create();
        log('info', `Client ${clientId} created room ${room.id}`);
        socket.emit('createRoomResponse', send(200, room.id));
      });

      socket.on('joinRoom', (roomId: string) => {
        const room = RoomService.getFromId(roomId);
        room.addPlayer(player);
        player.joinRoom(room);
        socket.join(roomId);

        log('info', `Client ${clientId} joined room ${room.id}`);
        socket.emit('joinRoomResponse', send(200, roomId));
      });

      socket.on('leaveRoom', (roomId: string) => {
        const room = RoomService.getFromId(roomId);
        if (room === undefined) {
          return;
        }
        room.removePlayer(player);
        player.leaveRoom();
        const audioIds = room.getAudioIdsInChannel(AudioChannel.Silent);
        socket.emit('connectAudioIds', audioIds);
        log('info', `Client ${clientId} left room ${room.id}`);
      });

      socket.on('registerAudioId', (audioId: string) => {
        log('info', `Registering client ${clientId} with audioId ${audioId}`);
        player.audioId = audioId;
        const audioIds = player.room.getAudioIdsInChannel(AudioChannel.Lobby);
        socket.emit('connectAudioIds', audioIds);
      });

      socket.on('disconnect', () => {
        log('info', `Client disconnected: ${clientId}`);
      });

      socket.on('chatMessage', (message) => {
        socket.to(player.room?.id!).emit('chatMessageResponse', message);
      });

      socket.on('startGame', () => player.room.startGame());

      socket.on('endGame', () => player.room.endGame());

      socket.on('startVoting', () => player.room.startVoting());

      socket.on('endVoting', () => player.room.endVoting());

      socket.on('TEMP_killSelf', () => {
        player.kill();
      });

      socket.on('TEMP_reviveSelf', () => {
        player.revive();
      });
    });
  }
}
