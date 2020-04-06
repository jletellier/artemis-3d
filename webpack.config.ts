import * as path from 'path';

/* eslint-disable-next-line import/no-extraneous-dependencies */
import * as webpack from 'webpack';

const config: webpack.Configuration = {
  mode: 'development',
  entry: {
    app: './src/client/index.ts',
  },
  devtool: 'inline-source-map',
  devServer: {
    contentBase: './dist',
    host: '0.0.0.0',
    proxy: {
      '/api/*': {
        target: 'http://localhost:5000',
        ws: true,
      },
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|jpe?g|gif|woff|ttf|eot)$/i,
        use: [
          {
            loader: 'file-loader',
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
};

export default config;
