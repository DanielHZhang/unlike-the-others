import jose from 'jose';
import geckos, {iceServers} from '@geckos.io/server';
import {createFastifyPlugin} from 'src/server/plugins';
import {Player} from 'src/server/store';
import {GECKOS_LABEL, IS_PRODUCTION_ENV} from 'src/shared/constants';
import {udpConnectionHandler} from 'src/server/services/webrtc';
import {verifyJwt} from 'src/server/config/keys';

export const webrtcPlugin = createFastifyPlugin('geckos-webrtc', (fastify) => {
  // TODO: Add custom ice servers for production
  const io = geckos({
    iceServers: IS_PRODUCTION_ENV ? iceServers : undefined,
    label: GECKOS_LABEL,
    authorization: async (auth, request) => {
      try {
        if (!auth) {
          throw new jose.errors.JWTMalformed();
        }

        const claims = verifyJwt('access', auth);
        const playerId = claims.guestId || claims.userId;
        const player = Player.getById(playerId);

        if (!player) {
          return false;
        }

        return Promise.resolve({id: player.id});
      } catch (error) {
        return false;
      }
    },
  });

  io.addServer(fastify.server); // Use the port of the HTTP Server
  io.onConnection(udpConnectionHandler(fastify));
});
