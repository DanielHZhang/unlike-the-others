import WebSocket from 'ws';
import {FastifyInstance} from 'fastify';
import {IncomingMessage} from 'http';
import {GameRoom, Player} from 'src/server/store';
import {ServerSocket} from 'src/server/services/websocket';
import {AudioChannel} from 'src/server/config/constants';
import {verifyJwt} from 'src/server/config/keys';
import {JwtClaims} from 'src/shared/types';

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
export const websocketConnectionHandler = (fastify: FastifyInstance) => (
  raw: WebSocket,
  msg: IncomingMessage,
  claims: Required<JwtClaims>
): void => {
  if (msg.aborted || msg.destroyed) {
    return;
  }

  // Ensure player or room exists (/room/:id/join called)
  const foundPlayer = Player.getById(claims.id);
  if (!foundPlayer || !foundPlayer.roomId || !GameRoom.getById(foundPlayer.roomId)) {
    return raw.close();
  }

  const socket = new ServerSocket(raw);
  fastify.websocket.clients.push(socket);
  fastify.log.info(`Socket client authenticated: ${foundPlayer.id}`);

  /**
   * Handle socket disconnect.
   */
  socket.on('close', (code, reason) => {
    const room = GameRoom.getById(socket.player.roomId);
    if (!room) {
      throw new Error(`No room found with id: ${socket.player.roomId}`);
    }

    // Deactivate player if match has already started to allow for reconnects.
    // If still in pre-game lobby, remove the player completely.
    if (room.isMatchStarted) {
      socket.player.active = false;
    } else {
      room.removePlayer(socket.player);
      Player.deleteById(socket.player.id);
      if (room.isEmpty()) {
        room.endGame(); // TODO: account for endLobby
        GameRoom.deleteById(room.id);
      }
    }

    fastify.log.info(`Websocket ${socket.player.id} closed, code: ${code}, reason: ${reason}`);
  });

  /**
   * Handle new audioId
   */
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

  /**
   * Handle chat message.
   */
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
