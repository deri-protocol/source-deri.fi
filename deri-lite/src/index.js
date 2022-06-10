import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter } from 'react-router-dom'
import App from './App';
import './assets/deri.less';
import { Provider } from 'mobx-react';
import { UseWalletProvider } from 'use-wallet'
import Wallet from './model/Wallet';
import Trading from './model/Trading';
import { DeriEnv } from './lib/web3js/index';
import version from './model/Version';
import intl from './model/Intl';
import chainlist from './chainlist.json'
import loading from './model/Loading';
import type from './model/Type';
function getDeriLiteRootContainer(container) {
  return container ? container.querySelector('#deri-lite-root') : document.querySelector('#deri-lite-root');
}


const wallet = new Wallet();
const trading = new Trading()
const useWalletOptions = {
  connectors: {
    injected: {
      // chainId: supportChainIds,
      rpc: chainlist
    },
    walletconnect: {
      // chainId: supportChainIds,
      rpc: chainlist
    },
    walletlink: {
      chainId: 56,
      url: 'https://mainnet.eth.aragon.network/',
    },
  },
  autoConnect: true
}
if (process.env.NODE_ENV === 'production') {
  DeriEnv.set('prod')
}
// DeriEnv.set('testnet')
DeriEnv.set('prod')
function render(props) {
  const { container } = props;
  ReactDOM.render(
    <React.StrictMode>
      <HashRouter basename='/deri-lite'>
        <UseWalletProvider {...useWalletOptions}>
          <Provider wallet={wallet} type={type} trading={trading} version={version} intl={intl} loading={loading}>
            <App {...props} />
          </Provider>
        </UseWalletProvider>
      </HashRouter>
    </React.StrictMode>,
    getDeriLiteRootContainer(container)
  );
}
function storeTest(props) {
  props.onGlobalStateChange((value, prev) => console.log(`[onGlobalStateChange - ${props.name}]:`, value, prev), true);
  props.setGlobalState({
    ignore: props.name,
    user: {
      name: props.name,
    },
  });
}

if (!window.__POWERED_BY_QIANKUN__) {
  render({});
}

export async function bootstrap() {
  console.log('react app bootstraped');
}

export async function mount(props) {
  console.log('props from main framework', props);
  storeTest(props);
  render(props);
}

export async function unmount(props) {
  const { container } = props;
  const root = ReactDOM.createRoot(getDeriLiteRootContainer(container))
  root.unmount(getDeriLiteRootContainer(container));
}



