import webpack from 'webpack';
import WebpackDevMiddleware from 'webpack-dev-middleware';
import WebpackHotMiddleware from 'webpack-hot-middleware';
import {log} from 'src/server/utils/logs';
import {ROOT_URL} from 'src/config/constants';

export function makeDevMiddleware(compiler: webpack.Compiler, publicPath: string) {
  const devMiddleware = WebpackDevMiddleware(compiler, {
    logLevel: 'error',
    publicPath,
  });
  devMiddleware.waitUntilValid(() => {
    log('success', `Ready on ${ROOT_URL}`);
    // const {NODE_ENV, PRISMA_ENDPOINT} = process.env;
    // log('info', `Connected to ${NODE_ENV} database at ${PRISMA_ENDPOINT}`);
  });
  return devMiddleware;
}

export function makeHotMiddleware(compiler: webpack.Compiler) {
  return WebpackHotMiddleware(compiler, {log: () => null}); // Remove output
}
