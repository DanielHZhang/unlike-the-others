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
    schema: {
      params: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
          },
        },
      },
    },
    handler: async (req, reply) => {
      try {
        const {id: roomId} = req.params as {id: string};
        const jwt = req.headers.authorization;
        if (!jwt) {
          throw 401;
        }

        const room = GameRoom.getById(roomId);
        if (!room) {
          throw new Error(`Unable to find room with id: ${roomId}`);
        }
        if (room.isMatchStarted) {
          throw new Error('Match has already started.');
        }

        const claims = verifyJwt('access', jwt);
        const playerId = claims.guestId || claims.userId;

        if (room.hasPlayerWithId(playerId)) {
          // Player connected previously
          // TODO: might need to do some stuff here?
        } else {
          // Player has not connected previously
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
