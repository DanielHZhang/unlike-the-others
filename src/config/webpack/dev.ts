import path from 'path';
import webpack from 'webpack';
import {TsconfigPathsPlugin} from 'tsconfig-paths-webpack-plugin';
import {ProgressWebpackPlugin} from '@supersede/progress-webpack-plugin';
import {
  APP_ENTRY_PATH,
  BUILD_FOLDER_PATH,
  PUBLIC_PATH,
  VENDOR_JSON_PATH,
} from 'src/config/constants';

export const config: webpack.Configuration = {
  mode: 'development',
  target: 'web',
  entry: {
    app: ['webpack-hot-middleware/client', 'webpack/hot/only-dev-server', APP_ENTRY_PATH],
  },
  output: {
    filename: '[name].bundle.js',
    chunkFilename: '[name].bundle.js',
    path: BUILD_FOLDER_PATH,
    publicPath: PUBLIC_PATH,
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.(j|t)sx?$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(gif|png|woff|woff2|eot|ttf|svg|jpg)$/,
        use: {
          loader: 'url-loader',
          options: {
            fallback: 'file-loader',
            limit: 50000,
            name: '[name].[ext]',
          },
        },
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    plugins: [new TsconfigPathsPlugin({configFile: path.join(process.cwd(), 'tsconfig.json')})],
  },
  plugins: [
    new ProgressWebpackPlugin(),
    new webpack.DllReferencePlugin({context: process.cwd(), manifest: require(VENDOR_JSON_PATH)}),
    new webpack.EnvironmentPlugin(['NODE_ENV']),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/), // Ignore moment locale modules
    // new BundleAnalyzerPlugin(),
  ],
};
