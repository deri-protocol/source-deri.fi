import React, { useState, useEffect } from 'react'
import withModal from '../../hoc/withModal';
import DepositMargin from './DepositMargin';
import WithdrawMagin from './WithdrawMargin';
import removeMarginIcon from '../../../assets/img/remove-margin.svg'
import addMarginIcon from '../../../assets/img/add-margin.svg'
import DeriNumberFormat from '../../../utils/DeriNumberFormat';
import { getPoolBTokensBySymbolId } from '../../../lib/web3js/indexV2';
import useDisableScroll from '../../../hooks/useDisableScroll';

const AddMarginDialog = withModal(DepositMargin)
const RemoveMarginDialog = withModal(WithdrawMagin)

export function BalanceList({wallet,spec,afterDepositAndWithdraw,position,onClose,lang}){  
  const [depositAndWithdragList, setDepositAndWithdragList] = useState([]);
  const limit = parseInt((document.body.offsetHeight - 140)/54)
  const [placeholdList, setPlaceholdList] = useState(Array.from({length : limit}));
  const [addModalIsOpen, setAddModalIsOpen] = useState(false);
  const [removeModalIsOpen, setRemoveModalIsOpen] = useState(false);
  const [balance, setBalance] = useState('');
  const [availableBalance, setAvailableBalance] = useState('');
  const [bTokenId, setBTokenId] = useState('');
  const [bTokenSymbol, setBTokenSymbol] = useState('');
  useDisableScroll()

  const closeAddMargin = () => setAddModalIsOpen(false)

  const closeRemoveMargin = () => setRemoveModalIsOpen(false)

  const closeCurrent = () => {
    afterDepositAndWithdraw();
    onClose();
  }
  const addMargin = (balance,bTokenId,symbolId) => {                              
    setBalance(balance);
    setBTokenId(bTokenId);
    setBTokenSymbol(symbolId);
    setAddModalIsOpen(true)
  }
  const removeMargin = (availableBalance,bTokenId,symbolId) => {
    setAvailableBalance(availableBalance);    
    setBTokenId(bTokenId);
    setBTokenSymbol(symbolId);
    setRemoveModalIsOpen(true);
  }

  const afterDeposit = () => {
    setAddModalIsOpen(false);
    loadBalanceList();
  }

  const afterWithdraw = () => {
    setRemoveModalIsOpen(false);
    loadBalanceList();
  }

  const loadBalanceList = async () => {
    if(wallet.detail.account && spec){
      const list = await getPoolBTokensBySymbolId(wallet.detail.chainId,spec.pool,wallet.detail.account,spec.symbolId)
      setDepositAndWithdragList(list)
      if(list.length < limit){
        setPlaceholdList(Array.from({length : limit - list.length}));
      }
    }
  }

  useEffect(() => {
    loadBalanceList();
    window.scrollTo(0, 0);
    return () => {};
  }, [wallet.detail.account,spec]);

  return(
    <>
      <div className='modal fade'>
        <div className='modal-dialog'>
          <div className='modal-content'>
            <div className='modal-header'>
              <div className='title'>{lang['balance-in-contract-uppercase']}</div>
              <div className='close' data-dismiss='modal' onClick={closeCurrent}>
                <span>&times;</span>
              </div>
            </div>
            <div className='modal-body'>
              <div className='balance-list'>
                <div className='row header'>
                  <span className='btoken pc'>{lang['base-token']}</span>
                  <span className='btoken mobile'>{lang['base-token']}</span>
                  <span className='w-balance pc'>{lang['wallet-balance']}</span>
                  <span className='w-balance mobile'>{lang['wallet-balance']}</span>
                  <span className='avail-balance pc'>{lang['available-balance']}</span>
                  <span className='avail-balance mobile'>{lang['available-balance']}</span>
                </div>
                {depositAndWithdragList.map((item,index) => (                  
                  <div className='row' key={index}>
                    <span className='btoken'>{item.bTokenSymbol}</span>
                    <span className='w-balance'><DeriNumberFormat value={item.walletBalance} fixedDecimalScale decimalScale={2}/></span>
                    <span className='avail-balance'><DeriNumberFormat value={item.availableBalance} fixedDecimalScale decimalScale={2}/></span>
                    <span className='action'>
                      <span
                        className='add-margin'
                        id='openAddMargin'
                        onClick={() => addMargin(item.walletBalance,item.bTokenId,item.bTokenSymbol)}> 
                        <img src={removeMarginIcon} alt={lang['add-margin']}/> {lang['add']}
                      </span>
                      <span className='remove-margin'
                        onClick={() => removeMargin(item.availableBalance,item.bTokenId,item.bTokenSymbol)}>
                        <img src={addMarginIcon} alt={lang['remove-margin']}/> {lang['remove']}
                      </span>
                    </span>
                  </div>
                ))}
                {placeholdList.map((item,index) => <div className='row' key={index}></div>)}
              </div>
            </div>
          </div>
        </div>
      </div>
      <AddMarginDialog  wallet={wallet} onClose={closeAddMargin} balance={balance} spec={{...spec,bTokenId,bTokenSymbol}} 
                        position={position} modalIsOpen={addModalIsOpen} afterDeposit={afterDeposit} className='trading-dialog' nested={true} lang={lang}/>
      <RemoveMarginDialog wallet={wallet} onClose={closeRemoveMargin} spec={{...spec,bTokenId,bTokenSymbol}} 
                          position={position} modalIsOpen={removeModalIsOpen} afterWithdraw={afterWithdraw} availableBalance={availableBalance} className='trading-dialog' nested={true}  lang={lang}/>
    </>
  )
}