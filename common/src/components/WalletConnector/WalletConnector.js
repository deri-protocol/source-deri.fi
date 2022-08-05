import { useCallback,useState,useEffect } from 'react';
import { useWallet } from 'use-wallet';
import Button from '../Button/Button';
import { formatAddress ,hasParent} from '../../utils/utils';
import classNames from 'classnames';
import './walletConnector.scss'

export default function WalletConnector({lang,bgColor = '#FFAB00',actions}){
  const [bntColor, setBntColor] = useState('#FFAB00');
  const [expand, setExpand] = useState();
  const [btnLabel, setBtnLabel] = useState('')
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
    actions && actions.setGlobalState({wallet : wallet})
    if(wallet.isConnected()){
      if(wallet.chainId === 56 || wallet.chainId === 42161 ){
        setBtnLabel(formatAddress(wallet.account))
      } else {
        setBtnLabel(`Unsupported Chain ID ${wallet.chainId}`)
      }
    } else {
      setBtnLabel('connect-wallet')
    }
  }, [wallet]);

  useEffect(() => {
    if(wallet.status === 'disconnected'){
      window.setTimeout(() => {
        wallet.connect();  
      },1000)
    }
  }, [location.hash]);
  
  return(
    <div className={walletClass}>
      <Button className='wallet-btn'  bgColor={bntColor} icon={'injected'} borderSize='2' defaultBorderColor='#fff' fontSize={16} fontColor='#FFF' width={200} height={48}  outline={false} radius={15} label={btnLabel} onClick={connect}></Button> 
    </div>
  )
}