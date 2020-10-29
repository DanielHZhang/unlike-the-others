import geckos, {iceServers} from '@geckos.io/server';
import {createFastifyPlugin} from 'src/server/plugins';
import {Player} from 'src/server/store';
import {GECKOS_LABEL, IS_PRODUCTION_ENV} from 'src/shared/constants';
import {webrtcConnectionHandler} from 'src/server/services/webrtc';
import {verifyJwt} from 'src/server/config/keys';

export const webrtcPlugin = createFastifyPlugin('geckos-webrtc', (fastify) => {
  // TODO: Add custom ice servers for production
  const io = geckos({
    iceServers: IS_PRODUCTION_ENV ? iceServers : undefined,
    label: GECKOS_LABEL,
    authorization: async (auth, request) => {
      try {
        if (!auth) {
          return false;
        }
        const claims = verifyJwt('access', auth);
        const player = Player.getById(claims.id);
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
  io.onConnection(webrtcConnectionHandler(fastify));
});
