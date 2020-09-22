import path from 'path';
import webpack from 'webpack';
import {TsconfigPathsPlugin} from 'tsconfig-paths-webpack-plugin';
import {APP_ENTRY_PATH, BUILD_FOLDER_PATH, PUBLIC_PATH, vendors} from 'src/server/config/constants';

export const config: webpack.Configuration = {
  mode: 'production',
  target: 'web',
  entry: {
    vendor: vendors,
    app: [APP_ENTRY_PATH],
  },
  output: {
    filename: '[name].bundle.js',
    library: '[name]',
    path: BUILD_FOLDER_PATH,
    publicPath: PUBLIC_PATH,
  },
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
  plugins: [new webpack.EnvironmentPlugin(['NODE_ENV'])],
};
