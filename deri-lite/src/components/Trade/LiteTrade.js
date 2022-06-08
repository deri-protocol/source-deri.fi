import { useState ,useEffect} from 'react'
import Position from './Position';
import History from './History';
import classNames from 'classnames';
import ContractInfo from '../ContractInfo/ContractInfo';
import Trade from './Trade';
import { inject, observer } from 'mobx-react';

function LiteTrade({wallet,trading,isPro,lang,loading,version,type}){
  const [curTab, setCurTab] = useState('trade');
  const switchTab = current => setCurTab(current);
  const tradeClassName = classNames('trade-position',curTab)

  useEffect(() => {
    loading.loading()
    trading.init(wallet,() => {
      loading.loaded();
    })
    return () => { trading.clean()} ;
  }, [wallet.detail.account,version.current])

  return (
      <div className={tradeClassName}>
        <div className='header-top'>
          <div className='header'>
            <span className='trade'  onClick={() => switchTab('trade')}>
              {lang['trade']}
            </span>
            {!isPro && <>
            <span
              className='pc position' onClick={() => switchTab('position')}>
              {lang['my-position']}
            </span>
            <span
              className='mobile position' onClick={() => switchTab('position')}>
              {lang['my-position']}
            </span>
            <span className='history' onClick={() => switchTab('history')}>
              {lang['history']}
            </span>
            </>}
          </div>
        </div>
        <Trade lang={lang} />
        <Position lang={lang} />
        <History wallet ={wallet} spec={trading.config} specs={trading.configs} lang={lang} />
        <ContractInfo lang={lang}/>   
    </div> 
  )
}

export default inject('wallet','trading','loading','version','type')(observer(LiteTrade))