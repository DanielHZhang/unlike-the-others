import {FastifyPluginCallback} from 'fastify';
import {verifyJwt} from 'src/server/config/keys';
import {prisma} from 'src/server/prisma';
import {GameRoom, Player} from 'src/server/store';

export const roomRoutes: FastifyPluginCallback = (fastify, options, next) => {
  // TODO: require user to have account to create room, but can join room without account
  fastify.route({
    url: '/create',
    method: 'POST',
    handler: async (req, reply) => {
      try {
        const jwt = req.headers.authorization;
        if (!jwt) {
          throw 401;
        }
        const claims = verifyJwt('access', jwt);
        const playerId = claims.guestId || claims.userId;
        const room = GameRoom.create(playerId);

        fastify.log.info(`Client ${playerId} created room ${room.id}`);

        return room.id;
      } catch (error) {
        console.error(error);
        return null;
      }
    },
  });

  fastify.route({
    url: '/:id/join',
    method: 'POST',
    handler: async (req, reply) => {
      try {
        const {id: roomId} = req.params as {id: string};
        const jwt = req.headers.authorization;
        if (!jwt) {
          throw 401;
        }
        if (!roomId || typeof roomId !== 'string') {
          throw 400;
        }

        const room = GameRoom.getById(roomId);
        if (!room) {
          throw new Error(`No room matches id: ${roomId}`);
        }

        const claims = verifyJwt('access', jwt);
        const playerId = claims.guestId || claims.userId;
        const playerIndex = room.players.findIndex((player) => player.id === playerId);

        if (playerIndex >= 0) {
          // Player connected previously
        } else {
          // No possible way for player instance to exist
          if (room.isFullCapacity()) {
            throw new Error('Room has reached full capacity.');
          }
          const player = Player.create(playerId);
          room.addPlayer(player);
          fastify.log.info(`Client ${player.id} joined room ${room.id}`);
        }

        return {success: true};
      } catch (error) {
        console.error(error);
        return error;
      }
    },
  });

  next();
};
