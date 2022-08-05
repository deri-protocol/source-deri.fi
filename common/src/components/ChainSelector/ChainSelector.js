import React, { useState, useEffect ,useCallback} from 'react'
import { isStartScroll, switchChain, hasParent,isMobile,random, eqInNumber } from '../../utils/utils';
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
  const [chain, setChain] = useState()

  const nwSelectClass = classNames('network-select',{
    expand : isShow,
    shrink : isShow === false
  })

  const onSelect = useCallback(async (chain) => {
    if(wallet.isConnected()){
      switchChain(chain,() =>  setChain(chain))
      setIsShow(false)
    } else {
      await wallet.connect();
      switchChain(chain,() => setChain(chain))
      setIsShow(false)
    }
  },[wallet])

  const handler = useCallback(() => {
    let offset = collect ? 138 : 202
    if(isStartScroll(offset)) {
      setIsScroll(true)
    } else {
      setIsScroll(false)
    }
  },[collect])

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

  useEffect(() => {
    if(chains && chains.length > 0){
      if(wallet.isConnected()) {
        const find = chains.find(chain => eqInNumber(chain.chainId,wallet.chainId ))
        if(find){
          setChain(find)
        } else {
          setChain(chains[0])        
        }
      } else if(wallet.status === 'disconnected' || wallet.status === 'error'){
        setChain(chains[0])
      }
    }
  }, [chains,wallet]);

  return (
    <div className={nwSelectClass}  >
      <div className='nw-wrapper' id={id} onClick={() => setIsShow(!isShow)}>
        {!isShow && chain && <div className='nw-item'  >
          <Icon token={isMobile() ? chain.icon  :  `${chain.icon}-LIGHT`} width='20'/>
          <div className='name'>{chain.name}</div>
          <Icon  width='16' token={'arrow-down'} className='arrow'/>
        </div>}
        {chains.map((chain,index) => {
          const itemClass = classNames('nw-item',{
            display : isShow === true,
            hidden : !isShow
          })
          return (
            <div className={itemClass} onClick={e => onSelect(chain)} key={index}>
              <Icon token={isMobile() ? chain.icon  :  `${chain.icon}-LIGHT`} width='20'/>
              <div className='name'>{chain.name}</div>
              {index === 0 && <Icon  width='16' token={'arrow-down'} className='arrow'/>}
            </div>
          )
        })}
      </div>
    </div>
  )
}
export default ChainSelector;