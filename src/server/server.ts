import pino from 'pino';
import fastify from 'fastify';
import fastifyStatic from 'fastify-static';
import fastifyCookie from 'fastify-cookie';
import fastifyWebsocket from 'fastify-websocket';
import {apiRoutes} from 'src/server/routes';
import {prisma} from 'src/server/prisma';
import {ASSETS_FOLDER_PATH, SHUTDOWN_WAIT_TIME} from 'src/server/config/constants';
import {IS_PRODUCTION_ENV, PORT} from 'src/shared/constants';
import {BUILD_FOLDER_PATH} from 'src/webpack/constants';
import {websocketHandler} from 'src/server/sockets/tcp';
import {webrtcHandler} from 'src/server/sockets/udp';
import {fastifyCsrf} from 'src/server/plugins';

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
    app.register(fastifyCsrf);
    // app.register(fastifyWebsocket, {
    //   // handle: (connection) => {
    //   //   connection.pipe(connection);
    //   // },
    //   options: {
    //     maxPayload: 1024 * 1024, // Max messages of 1 Mb
    //     path: '/sock',
    //   },
    // });
    app.register(websocketHandler);
    app.register(webrtcHandler);
    app.register(apiRoutes, {prefix: '/api'});
    app.get('*', (req, reply) => {
      reply.sendFile('index.html', BUILD_FOLDER_PATH);
    });

    app.listen(PORT, (error, address) => {
      if (error) {
        throw error;
      }
    });

    if (IS_PRODUCTION_ENV) {
      process.on('SIGTERM', () => {
        app.log.info('Received SIGTERM, waiting 10s for k8s iptables update.');
        // See: https://blog.laputa.io/graceful-shutdown-in-kubernetes-85f1c8d586da
        setTimeout(async () => {
          // Close all websocket connections
          // app.websocketServer?.clients.forEach((client) => client.close());
          await prisma.$disconnect();
          await app.close();
          process.exit(0);
        }, SHUTDOWN_WAIT_TIME * 1000);
      });
    }
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

main();
