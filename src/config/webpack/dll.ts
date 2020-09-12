import path from 'path';
import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import {BUILD_FOLDER_PATH, PUBLIC_PATH, TEMPLATE_HTML_PATH, vendors} from 'src/config/constants';

/**
 * Webpack configuration for common vendor bundle, using DllPlugin for long-term
 * bundle caching of vendor files. Only needs to be rebuilt when updating dependencies.
 */
export const config: webpack.Configuration = {
  mode: 'development',
  context: process.cwd(), // Use current working directory
  devtool: 'source-map',
  entry: {
    vendor: vendors,
    app: ['webpack-hot-middleware/client'],
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
        test: /\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: PUBLIC_PATH,
            },
          },
          'css-loader',
        ],
      },
    ],
  },
  plugins: [
    new webpack.DllPlugin({name: '[name]', path: path.join(BUILD_FOLDER_PATH, '[name].json')}),
    new MiniCssExtractPlugin({filename: '[name].css', chunkFilename: '[id].css'}),
    new HtmlWebpackPlugin({template: TEMPLATE_HTML_PATH, filename: 'index.html'}),
  ],
};
