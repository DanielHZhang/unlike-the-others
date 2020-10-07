import {ServerChannel} from '@geckos.io/server';
import {FastifyInstance} from 'fastify';
import {GameRoom, Player} from 'src/server/store';
import {inputModel} from 'src/shared/buffer-schema';

export const udpConnectionHandler = (fastify: FastifyInstance) => (
  channel: ServerChannel
): void => {
  let room: GameRoom;
  const playerId = channel.userData.id as string;
  const player = Player.getById(playerId)!;
  player.channel = channel;
  fastify.log.info(`UDP client connected: ${player.id}`);

  channel.onDisconnect((reason) => {
    fastify.log.info(`UDP client ${reason}: ${player.id}`);
    player.channel = undefined; // Remove reference to this channel
  });

  channel.onRaw((buffer) => {
    if (!room) {
      room = GameRoom.getById(player.roomId)!;
    }
    // DOES NOT HANDLE ANY ERROR
    const input = inputModel.fromBuffer(buffer as ArrayBuffer);
    player.enqueueInput(input);
  });
};
