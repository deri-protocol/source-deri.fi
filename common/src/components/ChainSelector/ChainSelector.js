import React, { useState, useEffect ,useCallback} from 'react'
import { isStartScroll, switchChain, hasParent,isMobile } from '../../utils/utils';
import Icon from '../Icon/Icon';
import { useWallet } from 'use-wallet';
import useChain from '../../hooks/useChain';
import classNames from 'classnames';
import './chainSelector.scss'

function ChainSelector({collect,id=""}){
  const [isScroll, setIsScroll] = useState(false);
  const [isShow, setIsShow] = useState()
  const wallet = useWallet()
  const chains = useChain();

  const nwSelectClass = classNames('network-select',{
    expand : isShow,
    shrink : isShow === false
  })

  const onSelect = useCallback(async (chain) => {
    if(wallet.isConnected()){
      switchChain(chain,() => setIsShow(false))
    } else {
      await wallet.connect();
      switchChain(chain,() => setIsShow(false))
    }
  },[])

  const handler = useCallback(() => {
    let offset = collect ? 138 : 202
    if(isStartScroll(offset)) {
      setIsScroll(true)
    } else {
      setIsScroll(false)
    }
  },[])

  const onBodyClick = useCallback((e) => {
    const parent = document.querySelector(`#${id}`);
    if(!hasParent(parent,e.target) && isShow){
      setIsShow(false)
    }
  })

  useEffect(() => {
    document.addEventListener('scroll', handler, false);
    document.addEventListener('click',onBodyClick)
    return () => {
      document.removeEventListener('scroll',handler)
      document.removeEventListener('click',onBodyClick)
    }
  }, [isShow]);

  return (
    <div className={nwSelectClass}>
      <div className='nw-wrapper' id={id}>
        {chains.map((chain,index) => {
          const itemClass = classNames('nw-item',{
            hidden : !isShow
          })
          return index === 0 
            ?
              (<div className='nw-item' onClick={() => setIsShow(!isShow)} key={chain.chainId}>
                <Icon token={isMobile() ? chain.icon  :  `${chain.icon}-LIGHT`} width='20'/>
                <div className='name'>{chain.name}</div>
                <Icon  width='16' token={'arrow-down'} className='arrow'/>
              </div>)
          : 
            (<div className={itemClass} onClick={e => onSelect(chain)} key={chain.chainId}>
              <Icon token={isMobile() ? chain.icon  :  `${chain.icon}-LIGHT`} width='20'/>
              <div className='name'>{chain.name}</div>
            </div>)
        })}
      </div>
    </div>
  )
}
export default ChainSelector;