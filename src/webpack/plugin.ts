import date from 'dayjs';
import middie from 'middie';
import webpack from 'webpack';
import WebpackDevMiddleware from 'webpack-dev-middleware';
import WebpackHotMiddleware from 'webpack-hot-middleware';
import {createFastifyPlugin} from 'src/server/plugins';

export const webpackHmrPlugin = createFastifyPlugin('webpackHmr', async (fastify) => {
  // Wait for fastify's middleware compat to finish registering
  await fastify.register(middie);

  // fastify.log.info('Building client...');
  const {config} = await import('src/webpack/dev');
  const {publicPath} = config.output!;
  const compiler = webpack(config);

  // Set up webpack-dev-middleware
  const startTime = date();
  const devMiddleware = WebpackDevMiddleware(compiler, {
    logLevel: 'error',
    publicPath,
  });
  devMiddleware.waitUntilValid(() => {
    const endTime = date();
    const duration = date(endTime.diff(startTime)).format('s.SSS');
    fastify.log.info(`Webpack compilation finished in ${duration} seconds.`);
  });
  fastify.use(devMiddleware);

  // Set up webpack-hot-middleware
  const hotMiddleware = WebpackHotMiddleware(compiler, {log: () => null}); // Remove output
  fastify.use(hotMiddleware);

  // Shut down dev middleware on close
  fastify.addHook('onClose', (_, next) => devMiddleware.close(next));
});
