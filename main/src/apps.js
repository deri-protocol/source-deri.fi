import store from './store/store'

const microApps = [
  {
    name: 'sub-app-demo',
    entry: process.env.REACT_APP_SUB_APP_DEMO,
    activeRule: '/#/sub-app-demo',
    container: '#subapp-viewport',
    env : 'development'
  }
]

const apps = microApps.map(item => {
  return {
    ...item,
    props: {
      routerBase: item.activeRule,
      getGlobalState: store.getGlobalState,
    }
  }
})

export default apps
