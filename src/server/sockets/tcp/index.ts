import fp from 'fastify-plugin';
import WebSocket from 'ws';
import {FastifyPluginCallback} from 'fastify';
import {JWT, errors} from 'jose';
import {GameRoom} from 'src/server/store';
import {AudioChannel} from 'src/server/config/constants';
import {JwtClaims, SocketMessage} from 'src/shared/types';
import {Player} from 'src/server/store/player';

class Socket {
  private listeners: Record<string, Function[]> = {};
  public connection: WebSocket;

  public constructor(socket: WebSocket) {
    this.connection = socket;
    socket.onmessage = (event) => {
      if (typeof event === 'string') {
        const json = JSON.parse(event);
        if (!Array.isArray(json) || json.length > 2 || typeof json[0] !== 'string') {
          throw new Error('Improperly formatted socket message.');
        }
        this.dispatch(json[0], json[1]);
      }
    };
  }

  public on(eventName: string, callback: (data: any) => any) {
    if (this.listeners[eventName]) {
      this.listeners[eventName].push(callback);
    } else {
      this.listeners[eventName] = [callback];
    }
  }

  public emit(eventName: string, data?: unknown, status = 200) {
    const stringified = JSON.stringify([eventName, status, data]);
    this.connection.send(stringified);
  }

  private dispatch(eventName: string, data: any) {
    const handlers = this.listeners[eventName];
    if (handlers) {
      handlers.forEach((handler) => handler(data));
    }
  }
}

// TODO: CHECK  maxPayload: 1024 * 1024, // Max messages of 1 Mb

const handler: FastifyPluginCallback = (fastify, options, next) => {
  const ws = new WebSocket.Server({server: fastify.server, path: '/sock'});

  fastify.decorate('websocketServer', ws);

  fastify.addHook('onClose', (fastify, done) => {
    ws.close(done);
  });

  ws.on('connection', (connection) => {
    const socket = new Socket(connection);
    let player: Player;

    socket.on('authenticate', (jwt) => {
      try {
        if (!jwt) {
          throw new errors.JWTMalformed();
        }
        const claims = JWT.verify(jwt, getJwk()) as JwtClaims;
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

    // Handle socket disconnect
    socket.on('close', (reason) => {
      const room = GameRoom.getById(player.roomId);
      if (room) {
        room.removePlayer(player);
        if (room.isEmpty()) {
          room.endGame(); // TODO: account for endLobby
          GameRoom.delete(room.id);
        }
      }
      fastify.log.info(`TCP Client disconnecting: ${player.id}`);
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

  next();
};

export const websocketHandler = fp(handler);
