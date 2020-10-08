import date from 'dayjs';
import middie from 'middie';
import webpack from 'webpack';
import WebpackDevMiddleware from 'webpack-dev-middleware';
import WebpackHotMiddleware from 'webpack-hot-middleware';
import {createFastifyPlugin} from 'src/server/plugins';

export const webpackHmrPlugin = createFastifyPlugin('webpackHmr', async (fastify) => {
  // Wait for fastify's middleware compat to finish registering
  await fastify.register(middie);

  const {config} = await import('src/webpack/dev');
  const {publicPath} = config.output!;
  const compiler = webpack(config);

  // Set up webpack-dev-middleware
  const devMiddleware = WebpackDevMiddleware(compiler, {
    logLevel: 'error',
    publicPath,
  });
  fastify.use(devMiddleware);

  // Set up webpack-hot-middleware
  const hotMiddleware = WebpackHotMiddleware(compiler, {
    log: (original: string) => {
      const isBuilding = original.includes('building');
      if (isBuilding) {
        // Original message is "webpack building..."
        process.stdout.write('Webpack building hot update ...\r');
      } else {
        // Original message is "webpack built {hash} in {time}ms"
        const message = original.split(' ');
        const hash = message[2];
        const milliseconds = parseInt(message[4].slice(0, -2), 10);
        const seconds = date.duration(milliseconds).asSeconds();
        fastify.log.info(`Webpack built ${hash} in ${seconds} seconds.`);
      }
    },
  });
  fastify.use(hotMiddleware);

  // Shut down dev middleware on close
  fastify.addHook('onClose', (_, next) => devMiddleware.close(next));
});
