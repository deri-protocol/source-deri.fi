const { name } = require('./package');
const webpack = require('webpack')
const path = require("path");
const fs = require("fs");
const rewireBabelLoader = require("react-app-rewire-babel-loader");
const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);
module.exports = {
  webpack: config => {
    config.output.library = `${name}-[name]`;
    config.output.libraryTarget = 'umd';
    config.output.chunkLoadingGlobal = `webpackJsonp_${name}`;
    config.output.publicPath = `${process.env.PUBLIC_URL}`
    config.resolve.fallback = {
      os: false,
      // os: require.resolve(`os-browserify/browser`),
      https: "agent-base",
      // https: require.resolve(`https-browserify`),
      http: false,
      // http: require.resolve(`stream-http`),
      stream: false,
      // stream: require.resolve(`stream-browserify`),
      util: false,
      // util: require.resolve(`util/`),
      url: false,
      // url: require.resolve(`url/`),
      assert: false,
      // assert: require.resolve(`assert/`),
      crypto: false,
      // crypto: require.resolve(`crypto-browserify`),
    }
    config.plugins = config.plugins.concat(new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer']
    })
    )
    return process.env.REACT_APP_DEBUG ? 
        rewireBabelLoader.include(
          config,
          resolveApp("../common/src")
        )
      : 
        rewireBabelLoader.include(
          config,
          resolveApp("node_modules/@deri/eco-common/src")
        );
  },
  devServer: (configFunction) => {
    return (proxy, allowedHost) => {
      const config = configFunction(proxy, allowedHost);
      config.historyApiFallback = true;
      config.open = false;
      config.hot = true;
      // config.watchContentBase = false;
      config.liveReload = true;
      config.headers = {
        'Access-Control-Allow-Origin': '*',
      };
      return config;
    }
  }
}