import http from 'http';
import path from 'path';
import express from 'express';
import webpack from 'webpack';
import {json, urlencoded} from 'body-parser';
import {log} from 'src/server/utils/logs';
import {buildWebpackDll} from 'src/server/utils/rebuild';
import {makeDevMiddleware, makeHotMiddleware} from 'src/server/middleware';
import {ASSETS_FOLDER_PATH, BUILD_FOLDER_PATH} from 'src/server/config/constants';
import {IS_PRODUCTION_ENV, PORT} from 'src/shared/constants';
import {tcpHandler} from 'src/server/sockets/tcp';
import {udpHandler} from 'src/server/sockets/udp';

export async function main() {
  const app = express();
  const server = http.createServer(app);
  const indexFile = path.join(BUILD_FOLDER_PATH, 'index.html');

  // Configure hot reloading for dev environments
  if (!IS_PRODUCTION_ENV) {
    try {
      await buildWebpackDll();
    } catch (error) {
      log('error', `Building the webpack dll failed. ${error}`);
      process.exit(0);
    }
    log('info', 'Building client...');
    const {config} = await import('src/webpack/dev');
    const compiler = webpack(config);
    app.use(makeDevMiddleware(compiler, config.output!.publicPath!));
    app.use(makeHotMiddleware(compiler));
  }

  // Apply express middlewares
  app.use('/static', express.static(BUILD_FOLDER_PATH));
  app.use('/assets', express.static(ASSETS_FOLDER_PATH));
  app.use(json({limit: '10mb'}));
  app.use(urlencoded({extended: true, limit: '10mb'}));
  app.use((_, res) => res.sendFile(indexFile));

  // Create socket handlers
  tcpHandler(server);
  udpHandler(server);
  server.listen(PORT);
}
