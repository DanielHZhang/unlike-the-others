import http from 'http';
import SocketIo from 'socket.io';
import {JWT, errors} from 'jose';
import {log} from 'src/server/utils/logs';
import {GameService} from 'src/server/store';
import {AudioChannel} from 'src/server/config/constants';
import {getJWK} from 'src/server/config/jwk';
import {JwtClaims} from 'src/shared/types';
import {Player} from 'src/server/store/player';

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
    log('info', `TCP socket connected: ${socket.client.id}`);
    let player: Player;

    // TODO: naive authentication, should be replaced wtih full user account later
    socket.on('authenticate', (jwt?: string | null) => {
      try {
        if (!jwt) {
          throw new errors.JWTMalformed();
        }
        const claims = JWT.verify(jwt, getJWK()) as JwtClaims;
        // TODO: Handle player reconnecting after being removed from map by inactivity with socket.io
        // attempt to dispose of entire socket instead of just the player object
        const playerExists = GameService.player.getById(claims.userId);
        // Player doesn't exist in map, create it with the userId contained in the JWT
        player = playerExists || GameService.player.create(socket, claims.userId);
        socket.emit('authenticateResponse');
      } catch (error) {
        // Client does not have a valid JWT
        player = GameService.player.create(socket);
        const newJwt = JWT.sign({userId: player.id}, getJWK());
        socket.emit('authenticateResponse', newJwt);
      }
    });

    socket.on('disconnecting', () => {
      GameService.room.getById(player.roomId)?.removePlayer(player);
      GameService.room.deleteIfEmpty(player.roomId);
      log('info', `TCP Client disconnecting: ${player.id}`);
    });

    socket.on('createRoom', () => {
      const room = GameService.room.create();
      log('info', `Client ${player.id} created room ${room.id}`);
      socket.emit('createRoomResponse', send(200, room.id));
    });

    socket.on('joinRoom', (roomId: string) => {
      const room = GameService.room.getById(roomId);
      if (!room) {
        throw new Error(`No room found with id: ${roomId}`);
      }
      room.addPlayer(player);
      log('info', `Client ${player.id} joined room ${room.id}`);
      socket.emit('joinRoomResponse', send(200, roomId));
    });

    socket.on('leaveRoom', (roomId: string) => {
      const room = GameService.room.getById(roomId);
      if (!room) {
        throw new Error(`No room found with id: ${roomId}`);
      }
      room.removePlayer(player);
      log('info', `Client ${player.id} left room ${room.id}`);
      socket.emit('leaveRoomResponse', send(200, roomId));
    });

    socket.on('registerAudioId', (audioId: string) => {
      log('info', `Registering client ${player.id} with audioId ${audioId}`);
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
