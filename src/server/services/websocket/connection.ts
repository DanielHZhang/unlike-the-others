import WebSocket from 'ws';
import {FastifyInstance} from 'fastify';
import {IncomingMessage} from 'http';
import {GameRoom, Player} from 'src/server/store';
import {bufferEventName, ServerSocket} from 'src/server/services/websocket';
import {AudioChannel} from 'src/server/config/constants';
import {BufferInputData, JwtClaims} from 'src/shared/types';
import {BufferEventType} from 'src/shared/constants';
import {INPUT_SCHEMA_ID} from 'src/shared/buffer-schema';

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

  // Player should exist, otherwise websocket would be destroyed before upgrade.
  const player = Player.getById(claims.id)!;
  // Ensure player or room exists (/room/:id/join called)
  // if (!player || !player.roomId || !GameRoom.getById(player.roomId)) {
  //   const code = 4000;
  //   fastify.log.info(`Websocket closed before initialization. Code: ${code}`);
  //   return raw.close(code, 'There is no active game with that code!');
  // }

  const socket = new ServerSocket(raw);
  fastify.websocket.clients.push(socket);
  fastify.log.info(`Websocket client '${player.id}' connected.`);

  /**
   * Handle client websocket disconnect.
   */
  socket.on('close', (code, reason) => {
    fastify.log.info(`Websocket client ${player.id} closed. Code: ${code} Reason: ${reason}`);

    const room = GameRoom.getById(player.roomId);
    if (!room) {
      throw new Error(`No room with id '${player.roomId}' found!`);
    }

    // Deactivate player if match has already started to allow for reconnects.
    // If still in pre-game lobby, remove the player completely.
    if (room.isMatchStarted) {
      player.deactivate();
    } else {
      Player.deleteById(player.id);
      room.removePlayer(player);
      if (room.isEmpty()) {
        room.endGame(); // TODO: account for endLobby
        GameRoom.deleteById(room.id);
      }
    }
  });

  /**
   * Handle player movement input data buffer.
   */
  socket.on(INPUT_SCHEMA_ID, (input: BufferInputData) => {
    player.enqueueInput(input);
  });

  /**
   * Handle new audioId
   */
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

  /**
   * Handle chat message.
   */
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
