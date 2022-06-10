import React, { useState, useEffect } from 'react'
import { inject, observer } from "mobx-react"
import symbolArrowIcon from '../../assets/img/arrow-down.svg'
import arrowDownIcon from '../../assets/img/arrow-up.svg'
import classNames from 'classnames';

function SymbolSelector({ trading, loading, type, wallet }) {
  const [dropdown, setDropdown] = useState(false);
  const [symbolList, setSymbolList] = useState([])
  const selectClass = classNames('dropdown-menu', { 'show': dropdown })
  const onDropdown = (event) => {
    event.preventDefault();
    setDropdown(!dropdown)
  }
  const onSelect = select => {
    const selected = trading.symbolInfos.find(config => config.pool === select.pool && select.symbol === config.symbol)
    if (selected) {
      loading.loading();
      trading.pause();
      trading.setSymbols(selected)
      trading.loadBySymboInfo(wallet, selected, () => {
        loading.loaded();
      },type.isOption)
      setDropdown(false)
    }
  }

  useEffect(() => {
    const onClick = (event) => {
      if (document.querySelector('.btn-group') && !document.querySelector('.btn-group').contains(event.target)) {
        setDropdown(false)
      }
    }
    document.body.addEventListener('click', onClick)
    return () => {
      document.body.removeEventListener('click', onClick)
    }
  }, [])

  useEffect(() => {
    if (trading.symbolInfos.length) {
      let current = type.current
      if (type.current === "future") {
        current = "futures"
      }
      let list = trading.symbolInfos.filter(config => config.category === current)
      setSymbolList(list)
    }

  }, [trading, trading.symbolInfos, type])

  return (
    <div className='btn-group check-baseToken-btn'>
      <button
        type='button'
        onClick={onDropdown}
        className='btn chec'>
        <SymbolDisplay spec={trading.symbolInfo} type={type} />
        <span className='check-base-down'>{dropdown ? <img src={arrowDownIcon} alt='' /> : <img src={symbolArrowIcon} alt='' />}</span>
      </button>
      <div className={selectClass}>
        {
          symbolList.map((config, index) => {
            return (
              <div className='dropdown-item' key={index} onClick={(e) => onSelect(config)}>
                <SymbolDisplay spec={config} type={type} />
              </div>
            )
          })
        }
      </div>
    </div>
  )
}

function SubMenu({ symbol, trading, onSelect, index, version, type }) {
  const [curPos, setCurPos] = useState(0)
  const subClassName = classNames('sub-menu', { 'show': index === curPos })

  const switchSubMen = (index) => {
    curPos === index ? setCurPos(-1) : setCurPos(index)
  }
  return (
    <div className='dropdown-item-wrapper' key={index}>
      <div className='catalog' onClick={() => switchSubMen(index)}>{symbol}<span className='sub-memu-icon'>{curPos === index ? <img src={arrowDownIcon} alt='' /> : <img src={symbolArrowIcon} alt='' />}</span></div>
      <div className={subClassName} key={index} >
        {Array.isArray(trading.optionsConfigs[symbol]) && trading.optionsConfigs[symbol].map((config, index) => (
          <div className='dropdown-item' key={index} onClick={() => onSelect(config)}><SymbolDisplay spec={config} version={version} type={type} /></div>
        ))}
      </div>
    </div>
  )
}

function SymbolDisplay({ version, spec, type }) {
  if (type.isOption) {
    return (
      `${(spec && spec.symbol) || 'BTCUSD-100000-C'}`
    )
  } else {
    return (
      `${(spec && spec.symbol) || 'BTCUSD'}`
    )
  }

}
export default inject('trading', 'version', 'loading', 'type', "wallet")(observer(SymbolSelector))