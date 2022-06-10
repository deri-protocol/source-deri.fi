import { useCallback,useState,useEffect } from 'react';
import { useWallet } from 'use-wallet';
import Button from '../Button/Button';
import { formatAddress ,hasParent} from '../../utils/utils';
import classNames from 'classnames';
import './walletConnector.scss'

export default function WalletConnector({lang,bgColor = '#FFAB00',actions}){
  const [bntColor, setBntColor] = useState('#FFAB00');
  const [expand, setExpand] = useState();
  const wallet = useWallet()
  const walletClass = classNames('wallet-view',{
    expand : expand,
    shrink : expand === false,
    connected : wallet.isConnected()
  })
  const connect = useCallback((e) => {
    e.stopPropagation();
    if(!wallet.isConnected()){
      wallet.connect();
    } else {
      setExpand(!expand)
    }
  },[wallet,expand])

  useEffect(() => {
    if(wallet.isConnected()) {
      setBntColor('#FFAB00')
    } else {
      setBntColor(bgColor)
    }
  }, [bgColor,wallet]);

  const onBodyClick = (e) => {
    const parent = document.querySelector('.wallet-view');
    if(!hasParent(parent,e.target) && expand ){
      setExpand(false)
    }
  }

  useEffect(() => {
    document.addEventListener('click',onBodyClick)
    return () => {
      document.removeEventListener('click',onBodyClick)
    }
  }, [expand]);

  useEffect(() => {
    if(!wallet.isConnected()) {
      // wallet.connect();
    }
    actions && actions.setGlobalState({wallet : wallet})
  }, [wallet]);
  
  return(
    <div className={walletClass}>
      <Button className='wallet-btn'  bgColor={bntColor} icon={'injected'} borderSize='2' defaultBorderColor='#fff' fontSize={16} fontColor='#FFF' width={200} height={48}  outline={false} radius={15} label={wallet.isConnected() ? formatAddress(wallet.account) : 'connect-wallet'} onClick={connect}></Button> 
    </div>
  )
}