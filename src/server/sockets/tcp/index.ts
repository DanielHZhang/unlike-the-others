import jose from 'jose';
import WebSocket from 'ws';
import {FastifyInstance} from 'fastify';
import {IncomingMessage} from 'http';
import {GameRoom, Player} from 'src/server/store';

export const socketConnection = (fastify: FastifyInstance) => (
  raw: WebSocket,
  msg: IncomingMessage
) => {
  console.log('msg aborted', msg.aborted, 'destroyed', msg.destroyed);
  if (msg.aborted || msg.destroyed) {
    return;
  }

  const socket = new Socket(raw);
  let player: Player;

  // Handle socket disconnect
  socket.on('close', (code, reason) => {
    const room = GameRoom.getById(player.roomId);
    if (room) {
      room.removePlayer(player);
      if (room.isEmpty()) {
        room.endGame(); // TODO: account for endLobby
        GameRoom.delete(room.id);
      }
    }
    fastify.log.info(`Websocket client closed: ${player.id}`);
  });

  socket.on('authenticate', (jwt) => {
    try {
      if (!jwt || typeof jwt !== 'string') {
        throw new jose.errors.JWTMalformed();
      }

      const claims = JWT.verify(jwt, getJwk());
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

  // socket.on('');
};

// ws.on('connection', (connection) => {
//   const socket = new Socket(connection);
//   let player: Player;

//   socket.on('createRoom', () => {
//     const room = GameRoom.create();
//     log('info', `Client ${player.id} created room ${room.id}`);
//     socket.emit('createRoomResponse', send(200, room.id));
//   });

//   socket.on('joinRoom', (roomId: string) => {
//     const room = GameRoom.getById(roomId);
//     if (!room || !room.hasCapacity()) {
//       throw new Error(`No room found with id: ${roomId}, or room has reached full capacity`);
//     }
//     room.addPlayer(player);
//     // TODO: change to startLobby
//     room.startGame();
//     log('info', `Client ${player.id} joined room ${room.id}`);
//     socket.emit('joinRoomResponse', send(200, roomId));
//   });

//   socket.on('leaveRoom', (roomId: string) => {
//     const room = GameRoom.getById(roomId);
//     if (!room) {
//       throw new Error(`No room found with id: ${roomId}`);
//     }
//     room.removePlayer(player);
//     if (room.isEmpty()) {
//       room.endGame(); // TODO: change to endLobby
//       GameRoom.delete(room.id);
//     }
//     log('info', `Client ${player.id} left room ${room.id}`);
//     socket.emit('leaveRoomResponse', send(200, roomId));
//   });

//   socket.on('registerAudioId', (audioId: string) => {
//     log('info', `Registering client ${player.id} with audioId ${audioId}`);
//     const room = GameRoom.getById(player.roomId);
//     if (room) {
//       player.audioId = audioId;
//       const audioIds = room.getAudioIdsInChannel(AudioChannel.Lobby);
//       socket.emit('connectAudioIds', audioIds);
//     }
//   });

//   socket.on('chatMessage', (message) => {
//     const room = GameRoom.getById(player.roomId);
//     if (!room) {
//       throw new Error();
//     }
//     socket.to(room.id).emit('chatMessageResponse', message);
//   });

//   socket.on('startGame', () => {
//     const room = GameRoom.getById(player.roomId);
//     if (!room) {
//       throw new Error();
//     }
//     room.startGame();
//   });

//   socket.on('endGame', () => {
//     const room = GameRoom.getById(player.roomId);
//     if (!room) {
//       throw new Error();
//     }
//     room.endGame();
//   });

//   socket.on('startVoting', () => {
//     const room = GameRoom.getById(player.roomId);
//     if (!room) {
//       throw new Error();
//     }
//     room.startVoting();
//   });

//   socket.on('endVoting', () => {
//     const room = GameRoom.getById(player.roomId);
//     if (!room) {
//       throw new Error();
//     }
//     room.endVoting();
//   });
// });

// import fp from 'fastify-plugin';
// import WebSocket from 'ws';
// import {FastifyInstance, FastifyPluginCallback} from 'fastify';
// import {JWT, errors} from 'jose';
// import {GameRoom} from 'src/server/store';
// import {AudioChannel} from 'src/server/config/constants';
// import {JwtClaims, SocketMessage} from 'src/shared/types';
// import {Player} from 'src/server/store/player';

// // TODO: CHECK  maxPayload: 1024 * 1024, // Max messages of 1 Mb

// const DECORATOR_KEY: Partial<keyof FastifyInstance> = 'websocketServer';

// const handler: FastifyPluginCallback = (fastify, options, next) => {

//   const ws = new WebSocket.Server({server: fastify.server, path: '/sock'});

//   fastify.decorate('websocketServer', ws);

//   fastify.addHook('onClose', (fastify, done) => {
//     ws.close(done);
//   });

//   ws.on('connection', (connection) => {
//     const socket = new Socket(connection);
//     let player: Player;

//     socket.on('authenticate', (jwt) => {
//       try {
//         if (!jwt) {
//           throw new errors.JWTMalformed();
//         }
//         const claims = JWT.verify(jwt, getJwk()) as JwtClaims;
//         // TODO: Handle player reconnecting after being removed from map by inactivity with socket.io
//         // attempt to dispose of entire socket instead of just the player object
//         const playerExists = Player.getById(claims.userId);
//         // Player doesn't exist in map, create it with the userId contained in the JWT
//         player = playerExists || Player.create(socket, claims.userId);
//         socket.emit('authenticateResponse');
//       } catch (error) {
//         // Client does not have a valid JWT
//         player = Player.create(socket);
//         const newJwt = JWT.sign({userId: player.id}, getJwk());
//         socket.emit('authenticateResponse', newJwt);
//       }
//       log('info', `TCP client connected: ${player.id}`);
//     });

//     // Handle socket disconnect
//     socket.on('close', (reason) => {
//       const room = GameRoom.getById(player.roomId);
//       if (room) {
//         room.removePlayer(player);
//         if (room.isEmpty()) {
//           room.endGame(); // TODO: account for endLobby
//           GameRoom.delete(room.id);
//         }
//       }
//       fastify.log.info(`TCP Client disconnecting: ${player.id}`);
//     });

//     socket.on('createRoom', () => {
//       const room = GameRoom.create();
//       log('info', `Client ${player.id} created room ${room.id}`);
//       socket.emit('createRoomResponse', send(200, room.id));
//     });

//     socket.on('joinRoom', (roomId: string) => {
//       const room = GameRoom.getById(roomId);
//       if (!room || !room.hasCapacity()) {
//         throw new Error(`No room found with id: ${roomId}, or room has reached full capacity`);
//       }
//       room.addPlayer(player);
//       // TODO: change to startLobby
//       room.startGame();
//       log('info', `Client ${player.id} joined room ${room.id}`);
//       socket.emit('joinRoomResponse', send(200, roomId));
//     });

//     socket.on('leaveRoom', (roomId: string) => {
//       const room = GameRoom.getById(roomId);
//       if (!room) {
//         throw new Error(`No room found with id: ${roomId}`);
//       }
//       room.removePlayer(player);
//       if (room.isEmpty()) {
//         room.endGame(); // TODO: change to endLobby
//         GameRoom.delete(room.id);
//       }
//       log('info', `Client ${player.id} left room ${room.id}`);
//       socket.emit('leaveRoomResponse', send(200, roomId));
//     });

//     socket.on('registerAudioId', (audioId: string) => {
//       log('info', `Registering client ${player.id} with audioId ${audioId}`);
//       const room = GameRoom.getById(player.roomId);
//       if (room) {
//         player.audioId = audioId;
//         const audioIds = room.getAudioIdsInChannel(AudioChannel.Lobby);
//         socket.emit('connectAudioIds', audioIds);
//       }
//     });

//     socket.on('chatMessage', (message) => {
//       const room = GameRoom.getById(player.roomId);
//       if (!room) {
//         throw new Error();
//       }
//       socket.to(room.id).emit('chatMessageResponse', message);
//     });

//     socket.on('startGame', () => {
//       const room = GameRoom.getById(player.roomId);
//       if (!room) {
//         throw new Error();
//       }
//       room.startGame();
//     });

//     socket.on('endGame', () => {
//       const room = GameRoom.getById(player.roomId);
//       if (!room) {
//         throw new Error();
//       }
//       room.endGame();
//     });

//     socket.on('startVoting', () => {
//       const room = GameRoom.getById(player.roomId);
//       if (!room) {
//         throw new Error();
//       }
//       room.startVoting();
//     });

//     socket.on('endVoting', () => {
//       const room = GameRoom.getById(player.roomId);
//       if (!room) {
//         throw new Error();
//       }
//       room.endVoting();
//     });
//   });

//   next();
// };

// export const websocketHandler = fp(handler);
