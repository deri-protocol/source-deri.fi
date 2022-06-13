import React, { useState ,useEffect} from 'react'
import { withdrawMargin } from "../../../lib/web3js/index";
import Button from '../../Button/Button';
import DeriNumberFormat from '../../../utils/DeriNumberFormat';
import { bg } from '../../../utils/utils';
import useDisableScroll from '../../../hooks/useDisableScroll';
import ApiProxy from '../../../model/ApiProxy'

export default function WithdrawMagin({wallet,spec =  {},position,onClose,afterWithdraw,availableBalance,nested,lang}){
  const [available, setAvailable] = useState('');
  const [decimal, setDecimal] = useState('');
  const [amount,setAmount] = useState('');
  const [pending, setPending] = useState(false);
  useDisableScroll(nested)


  const calculateBalance = async () => {
    if(wallet.isConnected() && availableBalance){      
      //v2 直接给
      const balance =  availableBalance
      setAvailable(balance)
      const pos = balance.indexOf('.');
      if(pos > 0){
        setDecimal(balance.substring(pos + 1,pos+3));
      } else {
        setDecimal('00')
      }      
    }
  }

  const removeAll = () => {
    setAmount(availableBalance)
  }

  const close = () => {
    if(!pending){
      onClose()
    }
  }

  const onChange = event => {
    const {value} =event.target
    setAmount(value)
  }

  const withdraw = async () => {
    const max = bg(available)
    const curAmount = bg(amount)    
    if(curAmount.gt(max)) {
      alert(lang['under-margin']);
      return;
    }
    if ((+amount) <= 0 || isNaN(amount)) {
      alert(lang['it-has-to-be-greater-than-zero-tip']);
      return;
    }
    setPending(true);
    const isMax = max.eq(amount)
    const res = await ApiProxy.request("withdrawMargin",[wallet.detail.chainId,spec.address,wallet.detail.account,amount,spec.bTokenSymbol,isMax],{includeResponse: true,}) ;
    if(res.success){
      afterWithdraw();
      onClose();
    } else {
      alert("Withdraw Failed")
      
    }
    setPending(false);
  }

  useEffect(() => {
    calculateBalance();
    return () => {
    };
  }, [wallet.detail.account,position.margin,position.unrealizedPnl]);

  return (
    <div
      className='modal fade'
      id='removeMargin'
    >
      <div className='modal-dialog'>
        <div className='modal-content'>
          <div className='modal-header'>
            <div className='title'>{lang['withdraw-margin']}</div>
            <div className='close' onClick={close}>
              <span>&times;</span>
            </div>
          </div>
          <div className='modal-body'>
            <div className='margin-box-info'>
              <div>{lang['available-balance']}</div>
              <div className='money'>
                <span>
                  <span className='bt-balance'>
                    <DeriNumberFormat value={ available } thousandSeparator ={true}  decimalScale={0}/>.<span style={{fontSize:'12px'}}>{decimal}</span>                     
                  </span>
                  </span>
                <span className='remove'></span>
              </div>
              <div className='enter-margin remv'>
                <div className='input-margin'>
                  <div className='box'>
                    <div className='amount' style={{display : amount !=='' ? 'block' : 'none'}}>{lang['amount']}</div>
                    <input
                      type='number'
                      className='margin-value'
                      value={amount}
                      onChange={onChange}
                      placeholder={lang['amount']}/>
                  </div>
                </div>
                <div>{ spec.baseToken }</div>
              </div>
              {(+position.marginHeld) === 0 && <div className='max'>
                {lang['max']}: <span className='max-num'>{ available ? available : position.margin }</span>
                <span className='max-btn-left' onClick={removeAll}>{lang['remove-all']}</span>
              </div>}
              {(+position.volume) > 0 && <div className='max'>
                <span className='max-num'></span>
                <span className='max-btn-left'> </span>
              </div>}
              <div className='add-margin-btn'>
                <Button className='margin-btn' btnText={lang['withdraw']} lang={lang} click={withdraw} checkApprove={true} wallet={wallet} spec={spec}  />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}