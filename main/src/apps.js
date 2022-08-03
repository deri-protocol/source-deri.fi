
const microApps = [
  {
    name: 'bet-it',
    displayName : 'BET it',
    entry: process.env.REACT_APP_BET_IT,
    activeRule: '#/bet-it',
    container: '#subapp-viewport'
  },
  {
    name: 'deri-lite',
    displayName : 'deri.lite',
    entry: process.env.REACT_APP_DERI_LITE,
    activeRule: '#/deri-lite',
    container: '#subapp-viewport'
  },
  {
    name: 'dip-hunter',
    displayName : 'Dip Hunter',
    entry: process.env.REACT_APP_DIP_HUNTER,
    activeRule: '#/dip-hunter',
    container: '#subapp-viewport'
  },
  // {
  //   name: 'liquidity-mining',
  //   displayName : 'liquidity mining',
  //   entry: process.env.REACT_APP_LIQUIDITY_MINING,
  //   activeRule: '#/liquidity-mining',
  //   container: '#subapp-viewport'
  // },
  {
    name: 'sub-app-demo',
    displayName : 'sub app demo',
    entry: process.env.REACT_APP_SUB_APP_DEMO,
    activeRule: '#/sub-app-demo',
    container: '#subapp-viewport',
    env: 'development'
  }
]



export default process.env.NODE_ENV === 'production' ? microApps.filter(app => app.env !== 'development') : microApps;
