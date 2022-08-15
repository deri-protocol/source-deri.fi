import logo from './logo.svg';
import './App.css';
import { inject, observer } from 'mobx-react';
import { useEffect } from 'react'
import { useWallet } from "use-wallet";
import PageRouter from './pages/PageRouter';
import { useLocation } from 'react-router-dom'
import TransactionState from './components/TransactionState/TransactionState'

function App({ intl, actions }) {
  const location = useLocation();
  const curRouterClass = location.pathname.split('/')[1]
  const wallet = useWallet()
  useEffect(() => {
    wallet.connect()
    actions && actions.onGlobalStateChange((state) => {
      if (state.wallet.isConnected()) {
        wallet.connect()
      }
    })
  }, [])
  return (
    <div className={`App ${curRouterClass}`}>
      <TransactionState />
      <PageRouter intl={intl} actions={actions}></PageRouter>
    </div>
  );
}

export default inject("intl")(observer(App));
