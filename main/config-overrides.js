const { name } = require('./package');
const path = require("path");
const fs = require("fs");

const rewireBabelLoader = require("react-app-rewire-babel-loader");
const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);
 
  module.exports = {
    webpack: config => {
      config.resolve.fallback =  {
        os: false,
        https: false,
        http: false,
        stream: false,
        util: false,
        url: false,
        assert: false,
        crypto: false,
      }
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
        config.liveReload = true;
        config.headers = {
          'Access-Control-Allow-Origin': '*',
        };
        return config;
      }
    }
  }