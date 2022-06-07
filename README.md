# Introduction
  - the source code of deri.fi, the front-end website for Deri community-developed DAPPs
  - this is micro frend-end project
  - it include main、common、 sub-app-demo
  - main is micro frend-end source，it based on [qiankun](https://github.com/umijs/qiankun) framework
  - common is share for all apps,it include navigator、chain-selector、wallet-connector
  - sub-app-demo is demo app

# Developer guide
  - fork current repo
  - create app，for example : npx [create-react-app](https://github.com/facebook/create-react-app) `app-name`
  - edit index.js，refer to sub-app-demo's index.js
    - create qiankun lifecycle point bootstrap、mount、render、unmount function, as follows
      ``` javascript
      export async function bootstrap() {
        console.log('app bootstraped');
      }

      export async function mount(props) {
        console.log('props from main framework', props);
        storeTest(props);
        render(props);
      }

      export async function unmount(props) {
        const { container } = props;
        const root = ReactDOM.createRoot(getSubRootContainer(container))
        root.unmount(getSubRootContainer(container));
      }
      ```
    - put code of cra generator into render function ,as follows
      ``` javascript
      function render(props) {
        const { container } = props;
        ReactDOM.render(
          <React.StrictMode>
            <HashRouter basename='/sub-app-demo'>
              <App store={{...props}} />
            </HashRouter>
          </React.StrictMode>

          ,getSubRootContainer(container)
        );
      }

      // this line is for compatibility with start alone
      if (!window.__POWERED_BY_QIANKUN__) {
        render({});
      }
      ```
  - create public-path.js with follow，and was imported in index.js
    ``` javascript
    if (window.__POWERED_BY_QIANKUN__) {
      __webpack_public_path__ = window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__;
    }
    ```
  - create config-overrides.js for customize cra's webpack config ,as follows
    ``` javascript
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
          config.liveReload = true;
          config.headers = {
            'Access-Control-Allow-Origin': '*',
          };
          return config;
        }
      }
    }
    ```
  - create .env file, add some config
    ``` env
    PORT=[dev_server_port]
    PUBLIC_URL=http://localhost:[dev_server_port]/
    ```
  - open apps.js in main/src,add app config in microApp, code segment as follows
    ``` javascript
    {
      name: 'sub-app-demo', // app's name
      entry: process.env.REACT_APP_SUB_APP_DEMO, // app's dev server 
      activeRule: '/#/sub-app-demo', // current active router
      container: '#subapp-viewport',// app root element selector
    }
    ```
  - open .env.development file ,add relative env variable ,as follows
    ``` 
    REACT_APP_SUB_APP_DEMO=http://localhost:3002 //new app dev server url
    ```
  - setup 
    - yarn install in root of app
    - npm start
