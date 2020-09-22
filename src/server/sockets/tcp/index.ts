import http from 'http';
import SocketIo from 'socket.io';
import {JWT, errors} from 'jose';
import {log} from 'src/server/utils/logs';
import {GameRoom} from 'src/server/store';
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
        const playerExists = Player.getById(claims.userId);
        // Player doesn't exist in map, create it with the userId contained in the JWT
        player = playerExists || Player.create(socket, claims.userId);
        socket.emit('authenticateResponse');
      } catch (error) {
        // Client does not have a valid JWT
        player = Player.create(socket);
        const newJwt = JWT.sign({userId: player.id}, getJWK());
        socket.emit('authenticateResponse', newJwt);
      }
      log('info', `TCP client connected: ${player.id}`);
    });

    socket.on('disconnecting', () => {
      const room = GameRoom.getById(player.roomId);
      if (room) {
        room.removePlayer(player);
        if (room.isEmpty()) {
          room.endGame(); // TODO: account for endLobby
          GameRoom.delete(room.id);
        }
      }
      log('info', `TCP Client disconnecting: ${player.id}`);
    });

    socket.on('createRoom', () => {
      const room = GameRoom.create();
      log('info', `Client ${player.id} created room ${room.id}`);
      socket.emit('createRoomResponse', send(200, room.id));
    });

    socket.on('joinRoom', (roomId: string) => {
      const room = GameRoom.getById(roomId);
      if (!room || !room.hasCapacity()) {
        throw new Error(`No room found with id: ${roomId}, or room has reached full capacity`);
      }
      room.addPlayer(player);
      // TODO: change to startLobby
      room.startGame();
      log('info', `Client ${player.id} joined room ${room.id}`);
      socket.emit('joinRoomResponse', send(200, roomId));
    });

    socket.on('leaveRoom', (roomId: string) => {
      const room = GameRoom.getById(roomId);
      if (!room) {
        throw new Error(`No room found with id: ${roomId}`);
      }
      room.removePlayer(player);
      if (room.isEmpty()) {
        room.endGame(); // TODO: change to endLobby
        GameRoom.delete(room.id);
      }
      log('info', `Client ${player.id} left room ${room.id}`);
      socket.emit('leaveRoomResponse', send(200, roomId));
    });

    socket.on('registerAudioId', (audioId: string) => {
      log('info', `Registering client ${player.id} with audioId ${audioId}`);
      const room = GameRoom.getById(player.roomId);
      if (room) {
        player.audioId = audioId;
        const audioIds = room.getAudioIdsInChannel(AudioChannel.Lobby);
        socket.emit('connectAudioIds', audioIds);
      }
    });

    socket.on('chatMessage', (message) => {
      const room = GameRoom.getById(player.roomId);
      if (!room) {
        throw new Error();
      }
      socket.to(room.id).emit('chatMessageResponse', message);
    });

    socket.on('startGame', () => {
      const room = GameRoom.getById(player.roomId);
      if (!room) {
        throw new Error();
      }
      room.startGame();
    });

    socket.on('endGame', () => {
      const room = GameRoom.getById(player.roomId);
      if (!room) {
        throw new Error();
      }
      room.endGame();
    });

    socket.on('startVoting', () => {
      const room = GameRoom.getById(player.roomId);
      if (!room) {
        throw new Error();
      }
      room.startVoting();
    });

    socket.on('endVoting', () => {
      const room = GameRoom.getById(player.roomId);
      if (!room) {
        throw new Error();
      }
      room.endVoting();
    });
  });
}
