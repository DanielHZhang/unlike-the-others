import http from 'http';
import path from 'path';
import express from 'express';
import webpack from 'webpack';
import {json, urlencoded} from 'body-parser';
import {log} from 'src/server/utils/logs';
import {buildWebpackDll} from 'src/server/utils/rebuild';
import {makeDevMiddleware, makeHotMiddleware} from 'src/server/middleware';
import {
  ASSETS_FOLDER_PATH,
  BUILD_FOLDER_PATH,
  IS_PRODUCTION_ENV,
  TCP_PORT,
} from 'src/config/constants';
import {TcpServer} from 'src/server/sockets/tcp';
import {UdpServer} from 'src/server/sockets/udp';

export async function main() {
  const app = express();

  // Configure hot reloading for dev environments
  if (!IS_PRODUCTION_ENV) {
    try {
      await buildWebpackDll();
    } catch (error) {
      log('error', `Building the webpack dll failed. ${error}`);
      process.exit(0);
    }
    log('info', 'Building client...');
    const devConfig = require('src/config/webpack/dev').config;
    const compiler = webpack(devConfig);
    app.use(makeDevMiddleware(compiler, devConfig.output.publicPath));
    app.use(makeHotMiddleware(compiler));
  }

  // Apply express middlewares
  const indexFile = path.join(BUILD_FOLDER_PATH, 'index.html');
  app.use('/static', express.static(BUILD_FOLDER_PATH));
  app.use('/assets', express.static(ASSETS_FOLDER_PATH));
  app.use(json({limit: '10mb'}));
  app.use(urlencoded({extended: true, limit: '10mb'}));
  app.use((_, res) => res.sendFile(indexFile));

  // Create server and socket handlers
  const server = http.createServer(app);
  new TcpServer(server);
  new UdpServer(server);
  server.listen(TCP_PORT);
}
