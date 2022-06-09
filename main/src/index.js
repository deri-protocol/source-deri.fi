import {registerMicroApps,start,setDefaultMountApp} from 'qiankun'
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import actions from './state/actions'
import apps from './apps';

const render = (props) => {
  const root = ReactDOM.createRoot(document.getElementById('root'))
  root.render(
    <React.StrictMode>
      <App {...props}/>
    </React.StrictMode>
  );
}

const microApps = apps.map(item => {
  return {
    ...item,
    props : {
      actions
    } 
  }
})

render({ actions });

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

const current = apps.find(app => app.activeRule === window.location.hash)
if(current) {
  setDefaultMountApp(current.activeRule)
} else if(apps && apps.length > 0){
  setDefaultMountApp(apps[0].activeRule)
}
start();

