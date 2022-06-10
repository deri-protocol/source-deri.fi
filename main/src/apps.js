
const microApps = [
  {
    name: 'bet-it',
    displayName : 'BET it',
    entry: process.env.REACT_APP_BET_IT,
    activeRule: '#/bet-it',
    container: '#subapp-viewport'
  },{
    name: 'sub-app-demo',
    displayName : 'sub app deom',
    entry: process.env.REACT_APP_SUB_APP_DEMO,
    activeRule: '#/sub-app-demo',
    container: '#subapp-viewport',
    env: 'development'
  }
]



export default process.env.NODE_ENV === 'production' ? microApps.filter(app => app.env !== 'development') : microApps;
