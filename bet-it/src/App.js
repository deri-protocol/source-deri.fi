import logo from './logo.svg';
import './App.css';
import Header from './components/Header/Header';
import BetIt from './pages/BetIt';
import { inject, observer } from 'mobx-react';
import { useWallet } from "use-wallet";
import PageRouter from './pages/PageRouter';
import { useLocation } from 'react-router-dom'
import { DeriEnv } from './web3';


function App({intl,actions}) {
  const location = useLocation();
  const curRouterClass = location.pathname.split('/')[1]
  const wallet = useWallet()
  useEffect(()=>{
    wallet.connect()
  },[])
  return (
    <div className={`App ${curRouterClass}`}>
      <PageRouter intl={intl} actions={actions}></PageRouter>
    </div>
  );
}

export default inject("intl")(observer(App));
