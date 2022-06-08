import React, { useState ,useEffect, version} from 'react'
import { getTradeHistory,DeriEnv ,bg} from "../../lib/web3js/indexV2";
import dateFormat from 'date-format'
import NumberFormat from 'react-number-format';
import useInterval from '../../hooks/useInterval';
import config from '../../config.json'
import classNames from 'classnames';
import rightArrow from '../../assets/img/play-button.png'
import DeriNumberFormat from '../../utils/DeriNumberFormat';
import { inject, observer } from 'mobx-react';

const chainConfig = config[DeriEnv.get()]['chainInfo'];
function History({wallet ,trading,lang,type}){
  const [history, setHistory] = useState([]);  

  async function loadHistory (){
    if(wallet.isConnected() && trading.configs && trading.config && trading.contract){
      const all = trading.history
      const his = all.map(item => {
        item.directionText = lang['long-buy']
        if(item.direction === 'SHORT') {
          item.directionText = lang['short-sell']
        } else if (item.direction.toLowerCase() === 'liquidation'){
          item.directionText = lang['liquidation']
        }
        // item.volume = type.isOption ? bg(item.volume).times(bg(trading.contract.multiplier)).toString() : item.volume
        const find = trading.config
        if(find){
          item.symbol = item.symbol ? item.symbol : find.symbol
          item.baseTokenText = item.baseToken ?  ` ${item.symbol} / ${item.baseToken}` : item.symbol
        }
        return item;
      })
      setHistory(his)
    }
  }

  useEffect(() => {
    loadHistory();
    return () => {};
  }, [wallet.detail,trading.configs,trading.config,trading.history]);
  
  return (
    <div className='history-info' v-show='historyShow'>
      {history.map((his,index) => {
        return (
          <div className='history-box' key={index}>
          <div className='direction-bToken-price'>
            <span className='direction'>
              <span className={`${his.direction}`}> { his.directionText }</span>
              <span className='basetoken'>{ his.baseTokenText }</span>  
              <HistoryLine wallet={wallet} his={his}/>    
            </span>
            <span className='history-text time'>{dateFormat.asString('yyyy-MM-dd hh:mm:ss',new Date(parseInt(his.time)))}</span>
          </div>
          <div className='time-price-volume'>
            <div className='history-price'>
              <div className='history-title'> {type.isOption ? lang['volume-notional-price'] : lang['volume-price']}</div>
              <div className='history-text'><DeriNumberFormat value={his.volume} thousandSeparator={true} allowZero={true} /> @ <DeriNumberFormat value={ his.price } decimalScale={4} displayType='text'/></div>
            </div>
          <div className='notional'>
              <div className='history-title'> {type.isOption?lang['contract-value']: lang['notional']}</div>
              <div className='history-text'><DeriNumberFormat value={ his.notional} decimalScale={4}/></div>
            </div>
          <div className='history-fee'>
            <div className='history-title pc'>{lang['transaction-fee']}</div>
              <div className='history-title mobile'>{lang['transaction-fee']}</div>
              <div className='history-text'><DeriNumberFormat value={ his.transactionFee } decimalScale={4}/></div>            
            </div>
          </div>        
        </div>
        )
      })}
      {+history.length === 0 ? <div className='no-data'>{lang['no-data']}</div> : ''}
    </div>
  )
}

function HistoryLine({wallet,his}){
  const [isHover, setIsHover] = useState(false);
  const mouseOver = () => {
    setIsHover(true)
  }
  const mouseOut = () => {
    setIsHover(false)
  }
  const clazz = classNames('view',{hover : isHover})
  return (
    <span className={clazz} onMouseOut={mouseOut}>
      <span className='view-space' onMouseOver={mouseOver} >
        <a target='_blank' rel='noreferrer' href={`${chainConfig[wallet.detail.chainId]['viewUrl']}tx/${his.transactionHash}`}>View at {chainConfig[wallet.detail.chainId]['viewUrl']}</a>
      </span>              
      <span className='right-arrow' onMouseOver={mouseOver}><img alt='' src={rightArrow}/></span>                          
      <span className='view-arrow' onMouseOver={mouseOver} onMouseOut={mouseOut}  >
        <a target='_blank' rel='noreferrer' href={`${chainConfig[wallet.detail.chainId]['viewUrl']}tx/${his.transactionHash}`}>
          <img rel='noreferrer' alt='' src="data:image/svg+xml;base64,DQo8c3ZnIGZpbGw9Im5vbmUiIGhlaWdodD0iMTAiIHdpZHRoPSIxMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4NCiAgICA8cGF0aCBkPSJNOC42NzYuNjQyYS42NS42NSAwIDAwLS4wNzIuMDA2SDQuNzkzYS42NS42NSAwIDAwLS41Ny45NzUuNjUuNjUgMCAwMC41Ny4zMjJINy4xMkwuNDM4IDguNjE0YS42NDcuNjQ3IDAgMDAuMjg2IDEuMDk2LjY1LjY1IDAgMDAuNjMyLS4xNzlMOC4wNCAyLjg2MXYyLjMyNGEuNjQ4LjY0OCAwIDAwLjk3Ny41Ny42NDguNjQ4IDAgMDAuMzIyLS41N1YxLjM4YS42NDcuNjQ3IDAgMDAtLjY2Mi0uNzM3eiIgZmlsbD0iI0FBQUFBQSIvPg0KPC9zdmc+DQoNCg=="/>
        </a>
      </span>
    </span> 
  )
}

export default inject('wallet','trading','type')(observer(History))
