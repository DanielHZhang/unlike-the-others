import jose from 'jose';
import WebSocket from 'ws';
import {FastifyInstance} from 'fastify';
import {IncomingMessage} from 'http';
import {GameRoom, Player} from 'src/server/store';
import {Socket} from 'src/server/services/sockets';
import {AudioChannel} from 'src/server/config/constants';
import {verifyJwt} from 'src/server/config/keys';

const isPayloadValid = <T extends Record<string, any>>(value: any, schema: T): value is T => {
  if (typeof value !== 'object') {
    return false;
  }
  const keys = new Set(Object.keys(schema));
  for (const key of keys) {
    if (!(key in value) || typeof value[key] !== typeof schema[key]) {
      return false;
    }
  }
  return true;
};

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

  /** Handle JWT authentication */
  socket.on('authenticate', (data) => {
    if (!isPayloadValid(data, {jwt: '', roomId: ''})) {
      throw new jose.errors.JWTMalformed();
    }

    const claims = verifyJwt('access', data.jwt);
    const playerId = claims.guestId || claims.userId;
    const foundPlayer = Player.getById(playerId);

    if (!foundPlayer || !foundPlayer.roomId) {
      return socket.emit('authenticate-reply', 'No room exists', 404);
    }

    socket.player = foundPlayer;
    fastify.log.info(`Socket client authenticated: ${foundPlayer.id}`);

    // socket.emit('authenticateResponse');

    // PROBABLY NOT NEEDED:
    // // If the client
    // // Terminate connection of any other sockets with same player id
    // const {clients} = fastify.websocket;
    // for (let i = 0; i < clients.length; i++) {
    //   const client = clients[i];
    //   if (client.player.id === foundPlayer.id) {
    //     client.dispose();
    //     clients.splice(i, 1);
    //     break;
    //   }
    // }
  });

  /** Handle socket disconnect */
  socket.on('close', (code, reason) => {
    const room = GameRoom.getById(socket.player.roomId);
    if (!room) {
      throw new Error(`No room found with id: ${socket.player.roomId}`);
    }

    room.removePlayer(socket.player);
    if (room.isEmpty()) {
      room.endGame(); // TODO: account for endLobby
      GameRoom.delete(room.id);
    }

    fastify.log.info(`Client ${socket.player.id} left room ${room.id}`);
    fastify.log.info(`Websocket ${socket.player.id} closed, code: ${code}, reason: ${reason}`);
  });

  socket.on('registerAudioId', (audioId) => {
    if (typeof audioId !== 'string') {
      throw new Error();
    }
    const room = GameRoom.getById(socket.player.roomId);
    if (room) {
      socket.player.audioId = audioId;
      const audioIds = room.getAudioIdsInChannel(AudioChannel.Lobby);
      socket.emit('connectAudioIds', audioIds);
    }
    fastify.log.info(`Client ${socket.player.id} registered with audioId ${audioId}`);
  });

  socket.on('chatMessage', (message) => {
    const room = GameRoom.getById(socket.player.roomId);
    if (!room) {
      throw new Error();
    }
    socket.to(room.id).emit('chatMessageResponse', message);
  });

  socket.on('startGame', () => {
    const room = GameRoom.getById(socket.player.roomId);
    if (!room) {
      throw new Error();
    }
    room.startGame();
  });

  socket.on('endGame', () => {
    const room = GameRoom.getById(socket.player.roomId);
    if (!room) {
      throw new Error();
    }
    room.endGame();
  });

  socket.on('startVoting', () => {
    const room = GameRoom.getById(socket.player.roomId);
    if (!room) {
      throw new Error();
    }
    room.startVoting();
  });

  socket.on('endVoting', () => {
    const room = GameRoom.getById(socket.player.roomId);
    if (!room) {
      throw new Error();
    }
    room.endVoting();
  });
};
