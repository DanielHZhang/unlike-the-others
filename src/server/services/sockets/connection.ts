import jose from 'jose';
import WebSocket from 'ws';
import {FastifyInstance} from 'fastify';
import {IncomingMessage} from 'http';
import {GameRoom, Player} from 'src/server/store';
import {Socket} from 'src/server/services/sockets';
import {AudioChannel} from 'src/server/config/constants';
import {verifyJwt} from 'src/server/config/keys';

/**
 * Handles onConnection event for WebSockets.
 */
export const connectionHandler = (fastify: FastifyInstance) => (
  raw: WebSocket,
  msg: IncomingMessage
) => {
  if (msg.aborted || msg.destroyed) {
    return;
  }
  const socket = new Socket(raw);
  fastify.websocket.clients.push(socket);

  console.log('HEADERS:', msg.headers);

  let player: Player;

  /** Handle socket disconnect */
  socket.on('close', (code, reason) => {
    const room = GameRoom.getById(player.roomId);
    if (!room) {
      throw new Error(`No room found with id: ${player.roomId}`);
    }

    room.removePlayer(player);
    if (room.isEmpty()) {
      room.endGame(); // TODO: account for endLobby
      GameRoom.delete(room.id);
    }

    fastify.log.info(`Client ${player.id} left room ${room.id}`);
    fastify.log.info(`Websocket ${player.id} closed, code: ${code}, reason: ${reason}`);
  });

  socket.on('authenticate', (jwt) => {
    try {
      if (!jwt || typeof jwt !== 'string') {
        throw new jose.errors.JWTMalformed();
      }

      const claims = verifyJwt('access', jwt);
      const playerId = claims.guestId || claims.userId!;
      const foundPlayer = Player.getById(playerId) || Player.create();

      // TODO: Handle player reconnecting after being removed from map by inactivity with socket.io
      // attempt to dispose of entire socket instead of just the player object
      const playerExists = Player.getById(claims.userId);
      // Player doesn't exist in map, create it with the userId contained in the JWT
      player = playerExists || Player.create(socket, claims.userId);
      socket.emit('authenticateResponse');
    } catch (error) {
      // Client does not have a valid JWT
      player = Player.create(socket);
      const newJwt = JWT.sign({userId: player.id}, getJwk());
      socket.emit('authenticateResponse', newJwt);
    }
    log('info', `TCP client connected: ${player.id}`);
  });

  socket.on('registerAudioId', (audioId) => {
    if (typeof audioId !== 'string') {
      throw new Error();
    }
    const room = GameRoom.getById(player.roomId);
    if (room) {
      player.audioId = audioId;
      const audioIds = room.getAudioIdsInChannel(AudioChannel.Lobby);
      socket.emit('connectAudioIds', audioIds);
    }
    fastify.log.info(`Client ${player.id} registered with audioId ${audioId}`);
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
};
