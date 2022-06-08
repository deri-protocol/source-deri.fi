import React, { useState, useEffect } from 'react'
import { inject, observer } from "mobx-react"
import symbolArrowIcon from '../../assets/img/arrow-down.svg'
import arrowDownIcon from '../../assets/img/arrow-up.svg'
import classNames from 'classnames';

function SymbolSelector({trading,version,loading,type}) {
  const [dropdown, setDropdown] = useState(false);  
  const selectClass = classNames('dropdown-menu',{'show' : dropdown})


  const onDropdown = (event) => {
    event.preventDefault();
    setDropdown(!dropdown)    
  }

  //切换交易标的
  const onSelect = selected => {
    // const selected = trading.configs.find(config => config.pool === select.pool && select.symbolId === config.symbolId )
    if(selected){
      loading.loading();
      trading.pause();
      // trading.setConfig(selected)
      trading.onSymbolChange(selected,() => loading.loaded(),type.isOption);
      setDropdown(false)
    } 
  }

  useEffect(() => {
    const onClick = (event) => {
      if(document.querySelector('.btn-group') && !document.querySelector('.btn-group').contains(event.target)){
        setDropdown(false)
      }
    }
    document.body.addEventListener('click',onClick)
    return () => {
      document.body.removeEventListener('click',onClick)
    }
  }, [])

  return (
    <div className='btn-group check-baseToken-btn'>
      <button
        type='button'            
        onClick={onDropdown}
        className='btn chec'>
        <SymbolDisplay spec={trading.config} version={version} type={type} />
        <span className='check-base-down'>{dropdown ? <img src={arrowDownIcon} alt=''/> : <img src={symbolArrowIcon} alt=''/>}</span>
      </button>
        <div className={selectClass}>
          {type.isFuture 
            ? 
            trading.configs.map((config,index) => {
              return (
                <div className='dropdown-item' key={index} onClick={(e) => onSelect(config)}>              
                  <SymbolDisplay spec={config} version={version} type={type}/>
                </div>
              )
            })
          :
          Object.keys(trading.optionsConfigs).map((symbol,index) => {
            return <SubMenu key={index} index={index} symbol={symbol} trading={trading} onSelect={onSelect} version={version} type={type}/>
          })
          }         
      </div>
    </div>
  )
}

function SubMenu({symbol,trading,onSelect,index,version,type}){
  const [curPos, setCurPos] = useState(0)
  const subClassName = classNames('sub-menu',{'show' : index === curPos})

  const switchSubMen = (index) => {
    curPos === index ? setCurPos(-1) : setCurPos(index)
  }
  return (
    <div className='dropdown-item-wrapper' key={index}>
      <div className='catalog' onClick={() => switchSubMen(index)}>{symbol}<span className='sub-memu-icon'>{curPos === index ? <img src={arrowDownIcon} alt=''/> : <img src={symbolArrowIcon} alt=''/>}</span></div>
      <div className={subClassName} key={index} >
        {Array.isArray(trading.optionsConfigs[symbol]) && trading.optionsConfigs[symbol].map((config,index) => (
          <div className='dropdown-item'  key ={index} onClick={() => onSelect(config)}><SymbolDisplay spec={config} version={version} type={type}/></div>
        ))}              
      </div>
    </div>
  )
}

function SymbolDisplay({version,spec,type}){
  if(type.isOption){
    return (
        `${(spec && spec.symbol) || 'BTCUSD-70000-C'}`
      )
  }else{
    return (
      (version.isV1 || version.isV2Lite || version.isOpen) ? `${(spec && spec.symbol) || 'BTCUSD'} / ${ (spec && spec.bTokenSymbol ) || 'BUSD'} ` : `${(spec && spec.symbol) || 'BTCUSD'} `  
    )
  }
  
}
export default inject('trading','version','loading','type')(observer(SymbolSelector))