import React from 'react'
import ReactDOM from 'react-dom/client'
import {UseWalletProvider} from 'use-wallet'
import './app.scss';
import { Constants } from '@deri/eco-common';
import Navigation from './components/Navigation/Navigation';
import Loading from './components/Loading/Loading';


function App(props) {
  return (
    <UseWalletProvider {...Constants.USE_WALLET_OPTIONS}>
      <div className="app">
        <Navigation collect={true} {...props}/>
        {props.loading && <Loading className={props.loading}/>}
        <main id="subapp-viewport">
        </main>
      </div>
    </UseWalletProvider>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'))
const render = (props) => {
  root.render(
    <React.StrictMode>
      <App {...props}/>
    </React.StrictMode>
  );
}
export default render;
