import React,{useState,useEffect} from 'react';
import { formatAddress, getNetworkList, getDefaultNw, storeChain } from '../../utils/utils';
import './account.less'
import { observer, inject } from 'mobx-react';
import { useRouteMatch } from 'react-router-dom';
import arrowIcon from '../../assets/img/symbol-arrow.svg'
import useConfig from '../../hooks/useConfig';
import { DeriEnv } from '../../lib/web3js/shared';


function Account({wallet,lang}){
  const [btnText,setBtnText] = useState(lang['connect-wallet'])
  const [networkList, setNetworkList] = useState([])
  const isIndex = useRouteMatch('/index')
  const isRoot = useRouteMatch({path: '/',exact : true})
  const isMining = useRouteMatch({path: '/mining',exact : true});
  const isTeam = useRouteMatch('/team')
  const isRetired = useRouteMatch('/retired')
  const isOptionsLite = useRouteMatch('/options/lite')
  const isAddpool = useRouteMatch('/addpool')
  const isOptionsPro = useRouteMatch('/options/pro') 
  const isDownload = useRouteMatch('/logo')
  const isInfo = useRouteMatch('/info')
  const config = useConfig();

  const isOptions = isOptionsLite || isOptionsPro
  const notConnectWalletPage  = isIndex || isMining || isTeam || isRoot || isRetired || isDownload || isInfo
  


  const setAccountText = (detail) => {
    //如果用户选择的网络正确
    if(wallet.isConnected()){
      if(wallet.isSupportChain(isOptions)) {
        //{detail.formatBalance} {detail.symbol}
        setBtnText(<span> <span className='address'>{formatAddress(detail.account)}</span></span>)
      } else {
        setBtnText(<span className='no-supported'>{lang['unsupported-chain-id']}{detail.chainId}!</span>)
      }
    } else {
      setBtnText(lang['connect-wallet'])
    } 
  }


  useEffect(() => {
    const init = async () => {
      const detail = await wallet.connect()
      if(detail){
        setAccountText(detail)
      }
    }
    if(!notConnectWalletPage){
      init();
    }
    return () => {}
  }, [window.location.href])

  useEffect(() => {
    setAccountText(wallet.detail)
    return () => {
    };
  }, [wallet.detail.account,wallet.detail.formatBalance,lang]);


  useEffect(() => {
    const networkList = getNetworkList(DeriEnv.get());
    const defaultNw = getDefaultNw(DeriEnv.get());
    wallet.setDefaultNw(defaultNw)
    if(!wallet.isConnected()){
      storeChain(defaultNw)
    }
    setNetworkList(networkList)
  }, [wallet])

  


  return !notConnectWalletPage && (
    <div className="connect">
      <div className="network-text-logo">
        <i className={wallet.isConnected() ? wallet.detail.symbol : wallet.defaultNw.symbol}></i>
        <span className="logo-text">{wallet.isConnected() ? wallet.detail.name || lang['select-network'] : wallet.defaultNw.name}</span>
        <span className='arrow'><img src={arrowIcon} alt='selector' /></span>
        <div className='network-list'>
            {networkList.map((network,index) => (
            <div key={index} className={`network-item ${wallet.detail.code && network.code === wallet.detail.code ? 'selected' : network.isDefault ? 'selected' : ''}`} onClick={() => wallet.switchNetwork(network)}>
              <span className={`logo ${network.symbol}`}></span><span>{network.name}</span>
            </div>)
          )}
        </div>
      </div>
      <div className="bg-btn">
        <button className="nav-btn connect-btn" onClick={wallet.connect}>
          {btnText}
        </button>

      </div>
    </div>
  )
}

export default inject('wallet')(observer(Account))