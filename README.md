# Introduction
  - the source code of deri.fi, the front-end website for Deri community-developed DAPPs
  - this is micro frend-end project
  - it include main、common、 sub-app-demo
  - main is micro frend-end source，it based on [qiankun](https://github.com/umijs/qiankun) framework
  - common is share for all apps,it include navigator、chain-selector、wallet-connector
  - sub-app-demo is demo app

# Developer guide
  ## add a app
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
        render(props);
      }

      export async function unmount(props) {
        const { container } = props;
        const root = ReactDOM.createRoot(getSubRootContainer(container))
        root.unmount();
      }
      ```
    - put code of cra generator into render function ,as follows
      ``` javascript
      function render(props) {
        const { container,name ='' } = props;
        const root = ReactDOM.createRoot(getSubRootContainer(container))
        root.render(
          <React.StrictMode>
            <HashRouter basename={name}>
              <App {...props} />
            </HashRouter>
          </React.StrictMode>
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
        //if you use webpack >= 5 ,you should add below code
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
        //if you want use @deri/eco-common node_modules ,you should include it in load path
        return rewireBabelLoader.include(
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
    - yarn -- install all apps
    - npm start  -- start all apps
    - npm run build -- build all apps
  
**_NOTE_** if you use common node_module,should use npm link
    - cd common && npm link
    - copy current dir
    - cd your_app && npm link common_dir

## Communication between apps
  Every app's props has actions prop,actions has onGlobalStateChange 、getGlobalState、setGlobalState api
  - setGlobalState is change state api
  - getGlobalState is get state api
  - onGlobalStateChange is listener for state
  
**_NOTE:_** demo code above is react 18.1.0
