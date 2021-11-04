import WebSocket from 'ws';
import {FastifyInstance} from 'fastify';
import {IncomingMessage} from 'http';
import {GameRoom, Player} from 'src/server/store';
import {ServerSocket} from 'src/server/services/websocket';
import {AudioChannel} from 'src/server/config/constants';
import {JwtClaims} from 'src/shared/types';
import {inputModel} from 'src/shared/game';

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

  const socket = new ServerSocket(raw);
  fastify.websocket.clients.push(socket);

  // Player should exist, otherwise websocket would be destroyed before upgrade.
  const player = Player.getById(claims.id)!;
  fastify.log.info(`Websocket client '${player.userId}' connected.`);
  const room = GameRoom.getById(player.roomId)!;
  // TODO: check if room lobby has already been started
  room.startLobby();

  /**
   * Handle client websocket disconnect.
   */
  socket.on('close', (code, reason) => {
    fastify.log.info(`Websocket client ${player.userId} closed. Code: ${code} Reason: ${reason}`);

    const room = GameRoom.getById(player.roomId);
    if (!room) {
      throw new Error(`No room with id '${player.roomId}' found!`);
    }

    // Deactivate player if match has already started to allow for reconnects.
    // If still in pre-game lobby, remove the player completely.
    if (room.isMatchStarted) {
      player.deactivate();
    } else {
      Player.deleteById(player.userId);
      room.removePlayer(player);
      if (room.isEmpty()) {
        room.endGame(); // TODO: account for endLobby
        GameRoom.deleteById(room.id);
      }
    }
  });

  /**
   * Handle player movement input buffer to be processed.
   */
  socket.on(inputModel.schema.id, (data: ArrayBuffer) => {
    const input = inputModel.fromBuffer(data);
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
    fastify.log.info(`Client ${player.userId} registered with audioId ${audioId}`);
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
