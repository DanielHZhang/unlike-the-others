import http from 'http';
import SocketIo from 'socket.io';
import {log} from 'src/server/utils/logs';
import {GameService} from 'src/server/store';
import {AudioChannel} from 'src/server/config/constants';

let io: SocketIo.Server;

function send<T = string>(status: number, payload: T) {
  return {status, payload};
}

export function tcpHandler(server: http.Server) {
  if (io) {
    throw new Error('Attempted to re-instantiate the TCP server singleton.');
  }
  io = SocketIo(server);

  io.on('connection', (socket: SocketIo.Socket) => {
    const clientId = socket.client.id;
    log('info', `Client connected: ${clientId}`);
    const player = GameService.player.create(socket);

    socket.on('disconnecting', () => {
      GameService.room.getById(player.roomId)?.removePlayer(player);
      GameService.room.deleteIfEmpty(player.roomId);
      log('info', `Client disconnecting: ${clientId}`);
    });

    socket.on('createRoom', () => {
      const room = GameService.room.create();
      log('info', `Client ${clientId} created room ${room.id}`);
      socket.emit('createRoomResponse', send(200, room.id));
    });

    socket.on('joinRoom', (roomId: string) => {
      const room = GameService.room.getById(roomId);
      if (!room) {
        throw new Error(`No room found with id: ${roomId}`);
      }
      room.addPlayer(player);
      log('info', `Client ${clientId} joined room ${room.id}`);
      socket.emit('joinRoomResponse', send(200, roomId));
    });

    socket.on('leaveRoom', (roomId: string) => {
      const room = GameService.room.getById(roomId);
      if (!room) {
        throw new Error(`No room found with id: ${roomId}`);
      }
      room.removePlayer(player);
      log('info', `Client ${clientId} left room ${room.id}`);
      socket.emit('leaveRoomResponse', send(200, roomId));
    });

    socket.on('registerAudioId', (audioId: string) => {
      log('info', `Registering client ${clientId} with audioId ${audioId}`);
      const room = GameService.room.getById(player.roomId);
      if (room) {
        player.audioId = audioId;
        const audioIds = room.getAudioIdsInChannel(AudioChannel.Lobby);
        socket.emit('connectAudioIds', audioIds);
      }
    });

    socket.on('chatMessage', (message) => {
      const room = GameService.room.getById(player.roomId);
      if (!room) {
        throw new Error();
      }
      socket.to(room.id).emit('chatMessageResponse', message);
    });

    socket.on('startGame', () => {
      const room = GameService.room.getById(player.roomId);
      if (!room) {
        throw new Error();
      }
      room.startGame();
    });

    socket.on('endGame', () => {
      const room = GameService.room.getById(player.roomId);
      if (!room) {
        throw new Error();
      }
      room.endGame();
    });

    socket.on('startVoting', () => {
      const room = GameService.room.getById(player.roomId);
      if (!room) {
        throw new Error();
      }
      room.startVoting();
    });

    socket.on('endVoting', () => {
      const room = GameService.room.getById(player.roomId);
      if (!room) {
        throw new Error();
      }
      room.endVoting();
    });
  });
}
