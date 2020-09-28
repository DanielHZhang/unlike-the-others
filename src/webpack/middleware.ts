import fp from 'fastify-plugin';
import middie from 'middie';
import webpack from 'webpack';
import WebpackDevMiddleware from 'webpack-dev-middleware';
import WebpackHotMiddleware from 'webpack-hot-middleware';
import {ROOT_URL} from 'src/shared/constants';

export const webpackHmrPlugin = fp(async (instance) => {
  if (instance.hasDecorator('webpack')) {
    throw new Error('Webpack HMR plugin has already been registered.');
  }
  const {config} = await import('src/webpack/dev');
  const compiler = webpack(config);

  // Set up webpack-dev-middleware
  const devMiddleware = WebpackDevMiddleware(compiler, {
    logLevel: 'error',
    publicPath: config.output!.publicPath,
  });
  devMiddleware.waitUntilValid(() => {
    instance.log.info(`Ready on ${ROOT_URL}`);
  });
  await instance.register(middie);
  instance.use(devMiddleware);

  // Set up webpack-hot-middleware
  const hotMiddleware = WebpackHotMiddleware(compiler, {log: () => null}); // Remove output
  instance.use(hotMiddleware);

  // Shut down dev middleware on close
  instance.addHook('onClose', (instance, next) => {
    devMiddleware.close(next);
  });
  instance.decorate('webpack-hmr', Symbol.for('webpack-hmr'));
});
