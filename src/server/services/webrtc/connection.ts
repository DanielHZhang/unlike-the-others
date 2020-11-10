// import {ServerChannel} from '@geckos.io/server';
import {FastifyInstance} from 'fastify';
import {GameRoom, Player} from 'src/server/store';
import {inputModel} from 'src/shared/game';

export const webrtcConnectionHandler = (fastify: FastifyInstance) => (
  channel: ServerChannel
): void => {
  type ChannelUserData = {
    id: string;
  };
  const {id}: ChannelUserData = channel.userData;
  const player = Player.getById(id);
  const room = GameRoom.getById(player?.roomId);

  // Do not allow the connection if the player or room could not be found.
  if (!player || !room) {
    return channel.close();
  }

  player.channel = channel;

  fastify.log.info(`WebRTC client '${player.userId}' connected.`);

  /**
   * Handle client webRTC disconnect.
   */
  channel.onDisconnect((reason) => {
    fastify.log.info(`WebRTC client '${player.userId}' ${reason}`);
    player.channel = undefined; // Remove reference to this channel
  });

  /**
   * Handle receiving raw byte data from the client.
   */
  channel.onRaw((buffer) => {
    if (typeof buffer === 'string') {
      return; // Do not handle raw string data
    }
    if (buffer.byteLength > 1000000) {
      // TODO: Should not handle byte length over set maximum
    }
    // TODO: Handle error from .fromBuffer parsing
    const input = inputModel.fromBuffer(buffer as ArrayBuffer);
    player.enqueueInput(input);
  });
};
