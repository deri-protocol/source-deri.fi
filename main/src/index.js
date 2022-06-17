import {registerMicroApps,start,setDefaultMountApp} from 'qiankun'
import React from 'react';
import ReactDOM from 'react-dom/client';
import render from './App';
import actions from './state/actions'
import apps from './apps';
import './index.css';




const loader = loading => render({actions, loading });

const microApps = apps.map(item => {
  return {
    ...item,
    props : {
      actions
    },
    loader 
  }
})

render({ actions,loading: true});

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
start({
  prefetch : false
});

