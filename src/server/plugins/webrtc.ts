import fp from 'fastify-plugin';
import {FastifyPluginCallback} from 'fastify';
import {FASTIFY_SEM_VER} from 'src/server/config/constants';

const plugin: FastifyPluginCallback = (fastify, options, next) => {
  next();
};

export const webrtc = fp(plugin, {
  fastify: FASTIFY_SEM_VER,
  name: 'fastify-geckos-webrtc',
});
