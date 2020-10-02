import pino from 'pino';
import fastify from 'fastify';
import serveStatic from 'fastify-static';
import cookie from 'fastify-cookie';
import {csrf, webrtc, websocket} from 'src/server/plugins';
import {apiRoutes} from 'src/server/routes';
import {prisma} from 'src/server/prisma';
import {ASSETS_FOLDER_PATH, SHUTDOWN_WAIT_TIME} from 'src/server/config/constants';
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
        import('src/webpack/plugin'),
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
    app.register(serveStatic, {
      root: BUILD_FOLDER_PATH,
      prefix: '/static',
    });
    app.register(serveStatic, {
      root: ASSETS_FOLDER_PATH,
      prefix: '/assets',
      decorateReply: false,
    });

    // Add route and socket handlers
    app.register(cookie);
    app.register(csrf);
    app.register(websocket);
    app.register(webrtc);
    app.register(apiRoutes, {prefix: '/api'});
    app.get('*', (_, reply) => {
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
          app.websocketServer.clients.forEach((client) => client.close());
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
