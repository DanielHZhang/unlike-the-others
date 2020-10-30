import {FastifyPluginCallback} from 'fastify';
import {GameRoom, Player} from 'src/server/store';

export const roomRoutes: FastifyPluginCallback = (fastify, options, next) => {
  // TODO: require user to have account to create room, but can join room without account
  fastify.route({
    url: '/create',
    method: 'POST',
    config: {
      protected: true,
    },
    handler: async (req, reply) => {
      const playerId = req.claims.id;
      const room = GameRoom.create(playerId);
      fastify.log.info(`Client ${playerId} created room ${room.id}`);
      return {id: room.id};
    },
  });

  fastify.route({
    url: '/:id/join',
    method: 'PUT',
    config: {
      protected: true,
    },
    schema: {
      params: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            minLength: 1,
            maxLength: 40,
          },
        },
      },
    },
    handler: async (req, reply) => {
      const {id: roomId} = req.params as {id: string};
      const room = GameRoom.getById(roomId);

      if (!room) {
        reply.status(404);
        throw new Error('There is no active game with that code!');
      }
      if (room.isMatchStarted) {
        reply.status(400);
        throw new Error('This match has already started!');
      }

      const {id, isGuest, username, hashtag} = req.claims;
      const derivedUsername = isGuest ? `${username}#${hashtag}` : username;
      if (room.hasPlayerWithId(id)) {
        // Player connected previously
        // TODO: might need to do some stuff here?
      } else {
        // Player has not connected previously
        if (room.isFullCapacity()) {
          reply.status(400);
          throw new Error('Room has reached full capacity!');
        }
        const player = Player.create(id, derivedUsername);
        room.addPlayer(player);
        fastify.log.info(`Client ${player.id} joined room ${room.id}`);
      }

      return {success: true};
    },
  });

  next();
};
