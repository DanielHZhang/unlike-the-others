import pino from 'pino';
import fastify from 'fastify';
import fastifyStatic from 'fastify-static';
import fastifyCookie from 'fastify-cookie';
import fastifyWebsocket from 'fastify-websocket';
import {routes} from 'src/server/routes';
import {prisma} from 'src/server/prisma';
import {ASSETS_FOLDER_PATH} from 'src/server/config/constants';
import {IS_PRODUCTION_ENV, PORT} from 'src/shared/constants';
import {BUILD_FOLDER_PATH} from 'src/webpack/constants';

export async function main() {
  const app = fastify({
    disableRequestLogging: true,
    logger: pino({
      prettyPrint: {
        colorize: true,
        translateTime: 'SYS:yyyy-mm-dd hh:MM:ss TT Z', // Use system time
      },
    }),
    ignoreTrailingSlash: true,
  });

  try {
    // Configure hot reloading for dev environments
    if (!IS_PRODUCTION_ENV) {
      // Require dev imports asyncronously to avoid bloating production bundle
      const [{buildWebpackDll}, {webpackHmrPlugin}] = await Promise.all([
        import('src/webpack/rebuild'),
        import('src/webpack/middleware'),
      ]);
      try {
        await buildWebpackDll(app.log);
      } catch (error) {
        app.log.error(`Building the webpack dll failed. ${error}`);
        process.exit(1);
      }
      app.register(webpackHmrPlugin);
    }

    // Serve static files
    app.register(fastifyStatic, {
      root: BUILD_FOLDER_PATH,
      prefix: '/static',
    });
    app.register(fastifyStatic, {
      root: ASSETS_FOLDER_PATH,
      prefix: '/assets',
      decorateReply: false,
    });

    // Add route and socket handlers
    app.register(fastifyCookie);
    app.register(fastifyWebsocket, {
      handle: (connection) => {
        connection.pipe(connection);
      },
      options: {
        maxPayload: 1024 * 1024, // Max messages of 1 Mb
        // path: '/ws',
      },
    });
    app.register(routes);
    // app.register(websockets);
    // udpHandler(app.server);

    app.listen(PORT, (error, address) => {
      if (error) {
        throw error;
      }
    });
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
