const { name } = require('./package');
  module.exports = {
    webpack: config => {
      config.output.library = `${name}-[name]`;
      config.output.libraryTarget = 'umd';
      config.output.chunkLoadingGlobal = `webpackJsonp_${name}`;   
      config.output.publicPath = `${process.env.PUBLIC_URL}`
      return config;
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