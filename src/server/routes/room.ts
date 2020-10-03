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
        // const user = await prisma.user.findOne({where: {id: claims.userId}});
        // if (!user) {
        //   throw 401;
        // }
        const player = Player.create();
        const room = GameRoom.create();
        room.addPlayer()
        fastify.log.info(`Client ${player.id} created room ${room.id}`);

        return room.id;
      } catch (error) {
        console.error(error);
        return null;
      }
    },
  });

  fastify.route({
    url: '/join',
    method: 'PUT',
    handler: async (req, reply) => {
      if (typeof roomId !== 'string') {
        throw new Error();
      }
      const room = GameRoom.getById(roomId);
      if (!room || !room.hasCapacity()) {
        throw new Error(`No room found with id: ${roomId}, or room has reached full capacity`);
      }
      room.addPlayer(player);
      // TODO: change to startLobby
      room.startGame();
      fastify.log.info(`Client ${player.id} joined room ${room.id}`);
      socket.emit('joinRoomResponse', roomId);
    },
  });

  fastify.route({
    url: '/:id/leave',
    method: 'DELETE',
    handler: async (req, reply) => {
      if (typeof roomId !== 'string') {
        throw new Error();
      }
      const room = GameRoom.getById(roomId);
      if (!room) {
        throw new Error(`No room found with id: ${roomId}`);
      }
      room.removePlayer(player);
      if (room.isEmpty()) {
        room.endGame(); // TODO: change to endLobby
        GameRoom.delete(room.id);
      }
      fastify.log.info(`Client ${player.id} left room ${room.id}`);
      socket.emit('leaveRoomResponse', roomId);
    },
  });


  next();
};
