import fp from 'fastify-plugin';
import middie from 'middie';
import webpack from 'webpack';
import WebpackDevMiddleware from 'webpack-dev-middleware';
import WebpackHotMiddleware from 'webpack-hot-middleware';
import {ROOT_URL} from 'src/shared/constants';
import {FASTIFY_SEM_VER} from 'src/server/config/constants';
import {createFastifyPlugin} from 'src/server/plugins';

const decoratorKey = 'webpackHmr';

export const samePlugin = createFastifyPlugin('webpackHmr', async (fastify, options) => {

});

export const webpackHmrPlugin = fp(
  async (fastify) => {
    if (fastify.hasDecorator(decoratorKey)) {
      throw new Error('Webpack HMR plugin has already been registered.');
    }
    fastify.log.info('Building client...');
    const {config} = await import('src/webpack/dev');
    const compiler = webpack(config);

    // Set up webpack-dev-middleware
    const devMiddleware = WebpackDevMiddleware(compiler, {
      logLevel: 'error',
      publicPath: config.output!.publicPath,
    });
    devMiddleware.waitUntilValid(() => {
      fastify.log.info(`Ready on http://${ROOT_URL}\nConnected to db: ${process.env.DB_ENDPOINT}`);
    });
    await fastify.register(middie);
    fastify.use(devMiddleware);

    // Set up webpack-hot-middleware
    const hotMiddleware = WebpackHotMiddleware(compiler, {log: () => null}); // Remove output
    fastify.use(hotMiddleware);

    // Shut down dev middleware on close
    fastify.addHook('onClose', (_, next) => devMiddleware.close(next));
    fastify.decorate(decoratorKey, Symbol.for(decoratorKey));
  },
  {
    fastify: FASTIFY_SEM_VER,
    name: 'fastify-webpack-hmr',
  }
);
