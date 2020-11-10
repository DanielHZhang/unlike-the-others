import fp, {PluginMetadata} from 'fastify-plugin';
import {FastifyPluginAsync, FastifyPluginOptions} from 'fastify';
import {FASTIFY_SEM_VER} from 'src/server/config/constants';

export function createFastifyPlugin<T extends FastifyPluginOptions>(
  name: string,
  callback: (...args: Parameters<FastifyPluginAsync<T>>) => void,
  pluginOptions?: Partial<PluginMetadata>
): FastifyPluginAsync<T> {
  const decoratorKey = Symbol.for(name);
  const plugin: FastifyPluginAsync<T> = async (fastify, options) => {
    if (fastify.hasDecorator(decoratorKey)) {
      throw new Error(`Fastify plugin "${name}" has already been registered.`);
    }
    fastify.decorate(decoratorKey, true);
    return Promise.resolve(callback(fastify, options));
  };
  return fp(plugin, {
    fastify: FASTIFY_SEM_VER,
    name: `fastify-${name}`,
    ...pluginOptions,
  });
}

export * from './auth';
// export * from './webrtc';
export * from './websocket';
