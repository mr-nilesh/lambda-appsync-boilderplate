// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const slsw = require('serverless-webpack');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const nodeExternals = require('webpack-node-externals');
// const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
// const { NormalModuleReplacementPlugin } = require('webpack');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
module.exports = {
  context: __dirname,
  mode: slsw.lib.webpack.isLocal ? 'development' : 'production',
  entry: slsw.lib.entries,
  watch: true,
  devtool: slsw.lib.webpack.isLocal
    ? 'eval-cheap-module-source-map'
    : 'source-map',
  resolve: {
    extensions: ['.mjs', '.json', '.ts'],
    symlinks: false,
    cacheWithContext: false,
    plugins: [new TsconfigPathsPlugin()]
  },
  // optimization: {
  //   usedExports: false
  // },
  output: {
    libraryTarget: 'commonjs',
    path: path.join(__dirname, '.webpack'),
    filename: '[name].js'
  },
  target: 'node',
  externals: [nodeExternals()],
  module: {
    rules: [
      // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
      {
        test: /\.(tsx?)$/,
        loader: 'ts-loader',
        exclude: [
          [
            path.resolve(__dirname, 'node_modules'),
            path.resolve(__dirname, '.serverless'),
            path.resolve(__dirname, '.webpack')
          ]
        ],
        options: {
          transpileOnly: true
          // experimentalWatchApi: true
        }
      }
    ]
  },
  plugins: [
    // new CopyWebpackPlugin({
    //   patterns: [{
    //     from: 'src/templates/emailReminder.html',
    //     to: 'src/templates/emailReminder.html'
    //   }, {
    //     from: 'src/templates/emailSecondReminder.html',
    //     to: 'src/templates/emailSecondReminder.html'
    //   }, {
    //     from: 'src/templates/voteReminder.html',
    //     to: 'src/templates/voteReminder.html'
    //   }]
    // })
  ]
};