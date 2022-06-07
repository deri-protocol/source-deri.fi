import {registerMicroApps,start,setDefaultMountApp} from 'qiankun'
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import apps from './apps';

const render = () => {
  ReactDOM.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
    ,document.getElementById('root')
  );
}


const loader = loading => render({ loading });

render({ loading: true });

const microApps = apps.map((app => ({
  ...app,
  loader,
})))

registerMicroApps(microApps, {
  beforeLoad: app => {
    console.log('before load app.name=====>>>>>', app.name)
  },
  beforeMount: [
    app => {
      console.log('[LifeCycle] before mount %c%s', 'color: green;', app.name)
    }
  ],
  afterMount: [
    app => {
      console.log('[LifeCycle] after mount %c%s', 'color: green;', app.name)
    }
  ],
  afterUnmount: [
    app => {
      console.log('[LifeCycle] after unmount %c%s', 'color: green;', app.name)
    }
  ]
})

if(apps && apps.length > 0){
  setDefaultMountApp(apps[0].activeRule)
}
start();

