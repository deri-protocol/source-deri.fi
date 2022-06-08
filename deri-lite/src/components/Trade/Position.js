import React, { useState, useEffect } from 'react'
import { closePosition, getWalletBalance, getPoolBTokensBySymbolId, bg } from "../../lib/web3js/indexV2";
import className from 'classnames'
import withModal from '../hoc/withModal';
import DepositMargin from './Dialog/DepositMargin';
import WithdrawMagin from './Dialog/WithdrawMargin';
import DeriNumberFormat from '../../utils/DeriNumberFormat';
import { eqInNumber } from '../../utils/utils';
import { inject, observer } from 'mobx-react';
import { BalanceList } from './Dialog/BalanceList';
import addMarginIcon from '../../assets/img/add-margin.svg'
import removeMarginIcon from '../../assets/img/remove-margin.svg'
import marginDetailIcon from '../../assets/img/margin-detail.png'
import pnlIcon from '../../assets/img/pnl-detail.png'
import closePositionIcon from '../../assets/img/close-position-icon.svg'
import TipWrapper from '../TipWrapper/TipWrapper';



const DepositDialog = withModal(DepositMargin);
const WithDrawDialog = withModal(WithdrawMagin)
const BalanceListDialog = withModal(BalanceList)

function Position({ wallet, trading, version, lang, type }) {
  const [isLiquidation, setIsLiquidation] = useState(false);
  const [direction, setDirection] = useState('');
  const [balanceContract, setBalanceContract] = useState('');
  const [availableBalance, setAvailableBalance] = useState('');
  const [balanceListModalIsOpen, setBalanceListModalIsOpen] = useState(false)
  const [addModalIsOpen, setAddModalIsOpen] = useState(false);
  const [removeModalIsOpen, setRemoveModalIsOpen] = useState(false);
  const [balance, setBalance] = useState('');

  const loadBalance = async () => {
    if (wallet.isConnected() && trading.config) {
      const balance = await getWalletBalance(wallet.detail.chainId, trading.config.pool, wallet.detail.account, trading.config.bTokenId).catch(e => console.error('load balance error,maybe network is wrong'))
      if (balance) {
        setBalance(balance)
      }
    }
  }

  //平仓
  const onClosePosition = async () => {
    setIsLiquidation(true)
    const res = await closePosition(wallet.detail.chainId, trading.config.pool, wallet.detail.account, trading.config.symbolId).finally(() => setIsLiquidation(false))
    if (res.success) {
      refreshBalance()
    } else {
      if (typeof res.error === 'string') {
        alert(res.error || lang['close-position-failed'])
      } else if (typeof res.error === 'object') {
        alert(res.error.errorMessage || lang['close-position-failed'])
      } else {
        alert(lang['close-position-failed'])
      }
    }
  }

  const refreshBalance = () => {
    trading.refresh();
    loadBalance();
  }

  const afterDeposit = () => {
    setAddModalIsOpen(false)
    refreshBalance()
  }

  const afterDepositAndWithdraw = () => {
    refreshBalance();
  }

  const onCloseBalanceList = () => {
    setBalanceListModalIsOpen(false)
  }

  const onCloseDeposit = () => {
    setAddModalIsOpen(false)
  }

  const afterWithdraw = () => {
    setRemoveModalIsOpen(false)
    refreshBalance();
  }

  const onCloseWithdraw = () => {
    setRemoveModalIsOpen(false)
  }

  const directionClass = className('Direction', 'info-num', {
    'LONG': (+trading.position.volume) > 0,
    'SHORT': (+trading.position.volume) < 0
  })




  useEffect(() => {
    loadBalance();
    return () => {
    };
  }, [wallet.detail.account, trading.config]);


  useEffect(() => {
    if (trading.position) {
      const { position } = trading
      const direction = (+position.volume) > 0 ? lang['long'] : (eqInNumber(position.volume, 0) || !position.volume ? '--' : lang['short'])
      setDirection(direction)
      setBalanceContract(bg(position.margin).plus(position.unrealizedPnl).toString())
      setAvailableBalance(bg(position.margin).plus(position.unrealizedPnl).minus(position.marginHeld).toString())
    }
    return () => { };
  }, [trading.position.volume, trading.position.margin, trading.position.unrealizedPnl]);



  return (
    <div className='position-info'>
      <div className='info'>
        <div className='info-left'>
          <div className='title-text'>{lang['position']}</div>
          <div className='info-num'>
            <DeriNumberFormat value={trading.position.volume} thousandSeparator={true} allowZero={true} />
          </div>
        </div>
        <div className='info-right'>
          <div
            className='close-position'
            id='close-p'
            onClick={onClosePosition}
          >
            <span
              className='spinner spinner-border spinner-border-sm'
              role='status'
              aria-hidden='true'
              style={{ display: isLiquidation ? 'block' : 'none' }}
            ></span>
            <img src={closePositionIcon} /> {lang['close']}
          </div>
        </div>
      </div>
      <div className='info'>
        <div className='info-left'>
          <div className='title-text'>{lang['average-entry-price']}</div>
          <div className='info-num'><DeriNumberFormat value={trading.position.averageEntryPrice} decimalScale={2} /></div>
        </div>
        <div className='info-right'></div>
      </div>
      <div className='info'>
        <div className='info-left'>
          <div className='title-text balance-con'>
            {(version.isV1 || version.isV2Lite || type.isOption) ? <>{lang['balance-in-contract']}<br /> ({lang['dynamic-balance']})</> : lang['dynamic-effective-balance']}
          </div>
          <div className='info-num'>
            <DeriNumberFormat decimalScale={2} allowZero={true} value={balanceContract} />
          </div>
        </div>
        <div className={`info-right action ${version.current}`}>
          {(version.isV1 || version.isV2Lite || type.isOption || version.isOpen) ? <>
            <div
              className='add-margin'
              id='openAddMargin'
              onClick={() => setAddModalIsOpen(true)}
            >
              <img src={removeMarginIcon} alt='add margin' /> {lang['add']}
            </div>
            <div className='remove-margin'
              onClick={() => setRemoveModalIsOpen(true)}>
              <img src={addMarginIcon} alt='add margin' /> {lang['remove']}
            </div>
          </> : (<div onClick={() => setBalanceListModalIsOpen(true)}><img src={marginDetailIcon} alt='Remove margin' /> {lang['detail']}</div>)}

        </div>
      </div>
      <div className='info'>
        <div className='info-left'>
          <div className='title-text'>{lang['direction']}</div>
          <div className={directionClass} >{direction}</div>
        </div>
        <div className='info-right'></div>
      </div>
      <div className='info'>
        <div className='info-left'>
          <div className='title-text'>{lang['margin']}</div>
          <div className='info-num'><DeriNumberFormat value={trading.position.marginHeld} decimalScale={2} /></div>
        </div>
        <div className='info-right'></div>
      </div>
      <div className='info'>
        <div className='info-left'>
          <div className='title-text'>{lang['unrealized-pnl']}</div>
          <div className='info-num'>
            <span className='pnl-list'>
              <DeriNumberFormat value={trading.position.unrealizedPnl} decimalScale={8} />
              {(trading.position.unrealizedPnlList ? (version.isV2 || version.isV2Lite || version.isOption) && trading.position.unrealizedPnlList.length : (version.isV2 || version.isV2Lite)) && <img src={pnlIcon} alt='unrealizePnl' />}
              {(version.isV2 || version.isV2Lite || version.isOption) && <div className='pnl-box'>
                {trading.position.unrealizedPnlList && trading.position.unrealizedPnlList.map((item, index) => (
                  <div className='unrealizePnl-item' key={index}>
                    <span>{item[0]}</span><span><DeriNumberFormat value={item[1]} decimalScale={8} /></span>
                  </div>
                ))}
              </div>}
            </span>
          </div>
        </div>
        <div className='info-right'></div>
      </div>
      <div className='info'>
        {type.isFuture && <>
          <div className='info-left'>
            <TipWrapper><div className='title-text  funding-fee' tip={lang['funding-fee-tip']}>{lang['funding-fee']}</div></TipWrapper>
            <div className='info-num'><DeriNumberFormat value={(-(trading.position.fundingFee))} decimalScale={8} /></div>
          </div>
          <div className='info-right'></div>
        </>}
        {type.isOption && <>
          <div className='info-left'>
            <TipWrapper><div className='title-text  funding-fee' tip={lang['funding-fee-tip']}>{lang['funding-fee']}</div></TipWrapper>
            <div className='info-num'><DeriNumberFormat value={(-(trading.position.premiumFundingAccrued))} decimalScale={8} /></div>
          </div>
          <div className='info-right'></div>
        </>}
      </div>
      <div className='info'>
        <div className='info-left'>
          <div className='title-text'>
            <span></span>  
          {type.isOption ? <TipWrapper block={false}><span className='funding-fee' tip={lang['liq-price-hover-one']}>{lang['liquidation-price']}</span></TipWrapper> :<span>{lang['liquidation-price']}</span>}
          </div>
          <div className='info-num'>
            {type.isOption ? <LiqPrice trading={trading} wallet={wallet} lang={lang} /> : <DeriNumberFormat decimalScale={4} value={trading.position.liquidationPrice} />}
          </div>
        </div>
        <div className='info-right'></div>
      </div>
      <DepositDialog
        wallet={wallet}
        modalIsOpen={addModalIsOpen}
        onClose={onCloseDeposit}
        spec={trading.config}
        afterDeposit={afterDeposit}
        balance={balance}
        className='trading-dialog'
        lang={lang}
      />
      <WithDrawDialog
        wallet={wallet}
        modalIsOpen={removeModalIsOpen}
        onClose={onCloseWithdraw}
        spec={trading.config}
        afterWithdraw={afterWithdraw}
        position={trading.position}
        availableBalance={availableBalance}
        className='trading-dialog'
        lang={lang}
      />
      <BalanceListDialog
        wallet={wallet}
        modalIsOpen={balanceListModalIsOpen}
        onClose={onCloseBalanceList}
        spec={trading.config}
        afterDepositAndWithdraw={afterDepositAndWithdraw}
        position={trading.position}
        overlay={{ background: '#1b1c22', top: 80 }}
        className='balance-list-dialog'
        lang={lang}
      />
    </div>
  )
}

function LiqPrice({ trading, wallet, lang }) {

  const [element, setElement] = useState(<span></span>);

  useEffect(() => {
    let ele = '';
    if (wallet.isConnected() && trading.position.liquidationPrice) {
      if (trading.position.liquidationPrice.numPositions > 1) {
        if (trading.position.liquidationPrice.price1 && trading.position.liquidationPrice.price2) {
          ele = <span>
            <DeriNumberFormat decimalScale={2} value={trading.position.liquidationPrice.price1} />
            <span> / </span>
            <DeriNumberFormat decimalScale={2} value={trading.position.liquidationPrice.price2} />
          </span>
        } else if (!trading.position.liquidationPrice.price1 && !trading.position.liquidationPrice.price2) {
          ele = <span>
            <TipWrapper block={false}><span className='funding-fee' tip={lang['liq-price-hover-three']}> ? </span></TipWrapper>
            <span> / </span>
            <TipWrapper block={false}><span className='funding-fee' tip={lang['liq-price-hover-three']}> ? </span></TipWrapper>
          </span>
        } else if (!trading.position.liquidationPrice.price1 && trading.position.liquidationPrice.price2) {
          ele = <span>
            <TipWrapper block={false}><span className='funding-fee' tip={lang['liq-price-hover-three']}> ? </span></TipWrapper>
            <span> / </span>
            <span> <DeriNumberFormat decimalScale={2} value={trading.position.liquidationPrice.price2} /> </span>
          </span>
        } else if (trading.position.liquidationPrice.price1 && !trading.position.liquidationPrice.price2) {
          ele = <span>
            <span> <DeriNumberFormat decimalScale={2} value={trading.position.liquidationPrice.price1} /> </span>
            <span> / </span>
            <TipWrapper block={false}><span className='funding-fee' tip={lang['liq-price-hover-three']}> ? </span></TipWrapper>
          </span>
        }
      } else {
        if (trading.position.liquidationPrice.price1 && trading.position.liquidationPrice.price2) {
          ele = <span>
            <DeriNumberFormat decimalScale={2} value={trading.position.liquidationPrice.price1} />
            <span> / </span>
            <DeriNumberFormat decimalScale={2} value={trading.position.liquidationPrice.price2} />
          </span>
        } else if (!trading.position.liquidationPrice.price1 && !trading.position.liquidationPrice.price2) {
          ele = <span>
            <TipWrapper block={false}> <span className='funding-fee' tip={lang['liq-price-hover-two']}> -- </span></TipWrapper>
            <span> / </span>
            <TipWrapper block={false}> <span className='funding-fee' tip={lang['liq-price-hover-two']}> -- </span></TipWrapper>
          </span>
        } else if (!trading.position.liquidationPrice.price1 && trading.position.liquidationPrice.price2) {
          ele = <span>
            <TipWrapper block={false}> <span className='funding-fee' tip={lang['liq-price-hover-two']}> -- </span></TipWrapper>
            <span> / </span>
            <span> <DeriNumberFormat decimalScale={2} value={trading.position.liquidationPrice.price2} /> </span>
          </span>
        } else if (trading.position.liquidationPrice.price1 && !trading.position.liquidationPrice.price2) {
          ele = <span>
            <span> <DeriNumberFormat decimalScale={2} value={trading.position.liquidationPrice.price1} /> </span>
            <span> / </span>
            <TipWrapper block={false}> <span className='funding-fee' tip={lang['liq-price-hover-two']}> -- </span></TipWrapper>
          </span>
        }
      }
      setElement(ele)
    }


  }, [trading.position, wallet.detail])


  return (
    <span>
      {element}
    </span>
  )

}
export default inject('wallet', 'trading', 'version', 'type')(observer(Position))