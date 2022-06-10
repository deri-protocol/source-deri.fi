import { useState, useEffect, useRef } from 'react'
import classNames from "classnames";
import Slider from '../Slider/Slider';
import { useWallet } from 'use-wallet';
import Button from '../Button/Button';
import { DeriEnv, priceCache, getIntrinsicPrice, PerpetualPoolParametersCache, isUnlocked, unlock, getFundingRate, getWalletBalance, getSpecification, getEstimatedFee, getLiquidityUsed, hasWallet, getEstimatedLiquidityUsed, getEstimatedFundingRate, getEstimatedTimePrice, getEstimatedLiquidatePrice } from '../../lib/web3js/index'
import withModal from '../hoc/withModal';
import TradeConfirm from './Dialog/TradeConfirm';
import DepositMargin from './Dialog/DepositMargin'
import WithdrawMagin from './Dialog/WithdrawMargin'
import DeriNumberFormat from '../../utils/DeriNumberFormat'
import { inject, observer } from 'mobx-react';
import { BalanceList } from './Dialog/BalanceList';
import SymbolSelector from './SymbolSelector';
import { bg } from "../../lib/web3js/index";
import TipWrapper from '../TipWrapper/TipWrapper';
import removeMarginIcon from '../../assets/img/remove_margin.png'
import addMarginIcon from '../../assets/img/add_margin.png'
import { convertToInternationalCurrencySystem, eqInNumber } from '../../utils/utils';
import { versionMajorMinor } from 'typescript';


const ConfirmDialog = withModal(TradeConfirm)
const DepositDialog = withModal(DepositMargin)
const WithDrawDialog = withModal(WithdrawMagin)
const BalanceListDialog = withModal(BalanceList)


function Trade({ wallet = {}, trading, version, lang, type }) {
  const [direction, setDirection] = useState('long');
  const [markPrice, setMarkPrice] = useState();
  const [indexPrice, setIndexPrice] = useState();
  const [spec, setSpec] = useState({});
  const [indexPriceClass, setIndexPriceClass] = useState('rise');
  const [markPriceClass, setMarkPriceClass] = useState('rise');
  const [optionInputHolder, setOptionInputHolder] = useState('0.000')
  const [balance, setBalance] = useState('');
  const [slideFreeze, setSlideFreeze] = useState(true);
  const [inputing, setInputing] = useState(false);
  const [rate, setRate] = useState('')
  const [isOptionInput, setIsOptionInput] = useState(false);
  const [stopCalculate, setStopCalculate] = useState(false)
  const [balanceListModalIsOpen, setBalanceListModalIsOpen] = useState(false);
  const [availableBalance, setAvailableBalance] = useState('');
  const indexPriceRef = useRef();
  const markPriceRef = useRef();
  const directionClazz = classNames('checked-long', 'check-long-short', ' long-short', { 'checked-short': direction === 'short' })
  const volumeClazz = classNames('contrant-input', { 'inputFamliy': trading.volume !== '' })

  const onCloseBalanceList = () => setBalanceListModalIsOpen(false);
  const afterWithdraw = () => {
    refreshBalance();
  }
  const afterDepositAndWithdraw = () => {
    refreshBalance();
  }

  const refreshBalance = () => {
    loadBalance();
    trading.refresh();
  }
  const loadBalance = async () => {
    if (wallet.isConnected() && trading.symbolInfo) {
      const balance = await getWalletBalance(wallet.detail.chainId, trading.symbolInfo.address, wallet.detail.account, trading.symbolInfo.bTokenId).catch(e => console.log(e))
      if (balance) {
        setBalance(balance)
      }
    }
  }

  const afterDeposit = afterWithdraw
  //是否有链接钱包

  const directionChange = direction => {
    trading.setVolume('')
    setDirection(direction)
  }

  const switchDirection = () => {
    if (direction === 'long') {
      setDirection('short')
    } else {
      setDirection('long')
    }
  }

  const onSlide = (value, needSwitchDirection) => {
    trading.setSlideMargin(value);
    setInputing(false)
    needSwitchDirection && switchDirection();
  }


  const makeLongOrShort = (volume) => {
    if (volume >= 0) {
      setDirection('long')
    } else {
      setDirection('short')
    }
  }




  const volumeMu = (volume) => {
    // return type.isOption ? bg(volume).div(bg(trading.contract.multiplier)).toString() : volume
    return bg(volume).div(bg(trading.contract.multiplier)).toString()
  }

  //处理输入相关方法
  const onFocus = event => {
    const target = event.target;
    target.setAttribute('class', 'contrant-input inputFamliy')
  }


  const onKeyPress = evt => {
    // if(type.isOption){
    if (evt.which !== 46 && (evt.which < 48 || evt.which > 57)) {
      evt.preventDefault();
    }
    // }else if(type.isFuture){
    //   if(evt.which < 48 || evt.which > 57) {
    //     evt.preventDefault();
    //   }
    // }

  }

  const volumeChange = event => {
    let { value } = event.target
    // if (value === '0' && type.isFuture) {
    //   value = ''
    // }
    trading.setVolume(value)
    setInputing(true)
  }


  const onBlur = event => {
    const target = event.target;
    // if(type.isOption){
    let value = target.value
    let multiplier = trading.contract.multiplier
    if (multiplier <= 1) {
      let index = multiplier.indexOf('.')
      let num = multiplier.slice(index);
      let length = num.length
      if (target.value.indexOf(".") !== -1) {
        value = target.value.substring(0, target.value.indexOf(".") + length)
        value = value === '0' ? '' : value
        trading.setVolume(value)
      }
    } else {
      let length = multiplier.length - 1
      let num = value.slice(-length);
      value = value.slice(0, -length)
      num = num.replace(/\d/gi, '0')
      value = value + num
      trading.setVolume(value)

    }
    if (value !== '') {
      if (value < multiplier) {
        setIsOptionInput(true)
      } else {
        setIsOptionInput(false)
      }
    }
    if (target.value === '') {
      target.setAttribute('class', 'contrant-input')
    }
  }

  //完成交易
  const afterTrade = () => {
    trading.setVolume('')
    trading.refresh();
    wallet.refresh();
  }

  useEffect(() => {
    if (trading.position && trading.position.volume) {
      makeLongOrShort((+trading.position.volume))
    }
    return () => { };
  }, [trading.position.volume]);

  useEffect(() => {
    if (!stopCalculate && trading.displayVolume !== '') {
      trading.pause();
    } else if (wallet.detail.account) {
      trading.resume()
    }

    return () => { };
  }, [trading.displayVolume, stopCalculate]);


  useEffect(() => {
    loadBalance();
    return () => { };
  }, [wallet.detail.account, trading.symbolInfo, trading.accountInfo.dynEffMargin])

  useEffect(() => {
    let index = (trading.position ? trading.position.indexPrice : '')
    if (indexPriceRef.current > index) {
      setIndexPriceClass('fall')
    } else {
      setIndexPriceClass('rise')
    }
    indexPriceRef.current = index
    setIndexPrice(index)
  }, [trading.position.indexPrice, trading.position]);

  useEffect(() => {
    if (trading.position) {
      const { position } = trading
      setAvailableBalance(bg(position.margin).plus(position.unrealizedPnl).minus(position.marginHeld).toString())
    }
    return () => { };
  }, [trading.position.volume, trading.position.margin, trading.position.unrealizedPnl]);

  useEffect(() => {
    let mark = (trading.position ? trading.position.markPrice : '')
    if (markPriceRef.current > mark) {
      setMarkPriceClass('fall')
    } else {
      setMarkPriceClass('rise')
    }
    markPriceRef.current = mark
    setMarkPrice(mark)
    return () => {
      document.querySelector('head title').innerText = 'deri'
    };
  }, [trading.index, trading.position, trading.markPrice, trading.symbolInfo, trading.priceDecimals])

  useEffect(() => {
    if (trading.symbolInfo) {
      setSpec(trading.symbolInfo)
    }
    return () => {
      // setMarkPriceAfter('')
      // setFundingRateAfter('');
    };
  }, [trading.symbolInfo]);

  useEffect(() => {
    if (trading.margin) {
      trading.direction && setDirection(trading.direction)
    }
    return () => { };
  }, [trading.margin]);

  useEffect(() => {
    let holder = '0.000'
    if (trading.contract.multiplier <= 1) {
      let multiplier = trading.contract.multiplier
      holder = multiplier.replace(/1/gi, '0')
    } else {
      holder = trading.contract.multiplier
    }
    setOptionInputHolder(holder)
  }, [trading.contract])

  useEffect(() => {
    if (trading.index && wallet.isConnected() && wallet.supportChain) {
      setSlideFreeze(false)
    }
    return () => { };
  }, [wallet.detail.account, trading.index]);

  useEffect(() => {
    //不作用于键盘输入，只作用于slider
    if (!inputing) {
      if (trading.position.volume > 0) {
        if (trading.volume < 0) {
          setDirection('short')
        } else {
          setDirection('long')
        }
      } else if (trading.position.volume < 0) {
        if (trading.volume > 0) {
          setDirection('short')
        } else {
          setDirection('long')
        }
      }
    }
    return () => { };
  }, [trading.volume, inputing]);

  useEffect(() => {
    if (trading.fundingRate.funding0 && markPrice) {
      let num = bg(trading.fundingRate.funding0).div(bg(markPrice)).times(bg(100)).toString()
      setRate(num)
    }
  }, [trading.fundingRate, markPrice])

  useEffect(() => {
    trading.setUserSelectedDirection(direction)
    return () => { };
  }, [direction]);



  return (
    <div className='trade-info'>
      <div className='trade-peration'>
        <div className='check-baseToken'>
          <SymbolSelector setSpec={setSpec} spec={trading.symbolInfos} type={type} />
          <div className='price-fundingRate pc'>
            {type.isFuture && <>
              <div className='mark-price'>
                {lang['mark-price']} : <span className={markPriceClass}>&nbsp; <DeriNumberFormat value={markPrice} decimalScale={2} /></span>
              </div>
              <div className='index-prcie'>
                {lang['index-price']}: <span className={indexPriceClass}>&nbsp; <DeriNumberFormat value={indexPrice} decimalScale={2} /></span>
              </div>
            </>}
            {(type.isOption) && <>
              <div className='mark-price'>
                {lang['mark-price']} : <span className={markPriceClass}>&nbsp; <DeriNumberFormat value={markPrice} decimalScale={4} /></span>
              </div>
              <div className='index-prcie'>
                {trading.symbolInfo ? trading.symbolInfo.underlier : ''} : <span className='option-vol'>&nbsp; <span> <DeriNumberFormat value={indexPrice} decimalScale={2} /></span><span className='vol'> | </span>DVOL : <DeriNumberFormat value={trading.position.volatility} decimalScale={2} suffix='%' /></span>
              </div>
            </>}
            {(type.isPower) && <>
              <div className='mark-price'>
                {lang['mark-price']} : <span className={markPriceClass}>&nbsp; <DeriNumberFormat value={markPrice} decimalScale={4} /></span>
              </div>
              <div className='index-prcie'>
                {trading.symbolInfo.symbolWithoutPower} Price : <span className='option-vol'>&nbsp; <span> <DeriNumberFormat value={indexPrice} decimalScale={2} /></span><span className='vol'> | </span>DVOL : <DeriNumberFormat value={trading.position.volatility} decimalScale={2} suffix='%' /></span>
              </div>
            </>}
            <div className='funding-rate'>
              {(type.isOption || type.isPower) && <>
                <span>Daily Funding : &nbsp;</span>
                <TipWrapper block={false} tip={trading.fundingFeeValueTip}>
                  <span className='funding-per' tip={trading.fundingFeeValueTip || ''}><DeriNumberFormat value={trading.fundingRate.funding0} decimalScale={4} /></span>
                </TipWrapper>
              </>}
              {type.isFuture && <>
                <span>Daily Funding: &nbsp;</span>
                <TipWrapper block={false} >
                  <span className='funding-per' tip={trading.fundingFeeValueTip || ''}><DeriNumberFormat value={trading.fundingRate.funding0} decimalScale={4} /></span>
                </TipWrapper>
                <TipWrapper block={false} >
                  &nbsp;  <span className='funding-per' tip={trading.rateTip || ''}>(<DeriNumberFormat value={rate} decimalScale={4} suffix='%' />)</span>
                </TipWrapper>
              </>}

            </div>
          </div>
          <div className='price-fundingRate mobile'>
            {type.isFuture && <>
              <div className='index-prcie'>
                {lang['mark-price']}: <span className={markPriceClass}>&nbsp; <DeriNumberFormat value={markPrice} decimalScale={2} /></span>
              </div>
              <div className='index-prcie'>
                {lang['index']}: <span className={indexPriceClass}>&nbsp; <DeriNumberFormat value={indexPrice} decimalScale={2} /></span>
              </div>
            </>}
            {type.isOption && <>
              <div className='mark-price'>
                {lang['mark-price']} : <span className={markPriceClass}>&nbsp; <DeriNumberFormat value={markPrice} decimalScale={2} /></span>
              </div>
              <div className='index-prcie'>
                {trading.symbolInfo ? trading.symbolInfo.underlier : ''}: <span className={indexPriceClass}>&nbsp; <DeriNumberFormat value={trading.index} decimalScale={2} /></span>
              </div>
              <div className='index-prcie'>
                DVOL: <DeriNumberFormat value={trading.volatility} decimalScale={2} />
              </div>

            </>}

            <div className='funding-rate'>
              {type.isOption && <>
                <span>Daily Funding : &nbsp;</span>
                <TipWrapper block={false}>
                  <span className='funding-per' tip={trading.fundingFeeValueTip || ''}><DeriNumberFormat value={trading.fundingRate.premiumFunding0} decimalScale={4} /></span>
                </TipWrapper>
              </>}
              {type.isFuture && <>
                <span>Daily Funding : &nbsp;</span>
                <TipWrapper block={false} tip={trading.fundingFeeValueTip}>
                  <span className='funding-per' tip={trading.fundingFeeValueTip || ''}><DeriNumberFormat value={trading.fundingRate.funding0} decimalScale={4} /></span>
                </TipWrapper>
              </>}
            </div>
            {type.isFuture && <>
              <div className='rate'>
                <TipWrapper block={false} tip={trading.rateTip}>
                  <span className='funding-per' tip={trading.rateTip || ''}>(<DeriNumberFormat value={rate} decimalScale={4} suffix='%' />)</span>
                </TipWrapper>
              </div>
            </>}

          </div>
        </div>
        <div className={directionClazz}>
          <div className='check-long' onClick={() => directionChange('long')}>{lang['long-buy']}</div>
          <div className='check-short' onClick={() => directionChange('short')}>{lang['short-sell']}</div>
        </div>
        <div className='the-input'>
          <div className='left'>
            <div className='current-position'>
              <span>{lang['current-position']}</span>
              <span className='position-text'>
                <DeriNumberFormat value={trading.position.volume} allowZero={true} thousandSeparator={true} />
              </span>
            </div>
            <div className='contrant option-input'>
              <div className='bg-input'>
                <div>
                  <input
                    type='number'
                    step={trading.contract.multiplier}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    onKeyPress={onKeyPress}
                    disabled={Math.abs(trading.accountInfo.availableMargin) === 0}
                    onChange={event => volumeChange(event)}
                    value={trading.displayVolume}
                    className={volumeClazz}
                    placeholder={optionInputHolder}
                  />
                </div>

                <div className='option-unit' >
                  {trading.symbolInfo && trading.symbolInfo.unit}
                </div>
              </div>
            </div>
            {isOptionInput && <>
              <div className='min-quantity'>
                {lang['option-input-min-quantity']}
                &nbsp; {trading.contract.multiplier} &nbsp;
                {trading.symbolInfo && trading.symbolInfo.unit}
              </div>
            </>}
          </div>
          <div className='right-info'>
            <div className={`contrant-info ${version.current}`}>
              <div className='balance-contract'>
                <TipWrapper block={false}>
                  <span className='balance-contract-text pc' tip="Total Discounted Margin + Unrealized PnL + Acc'd Funding">
                    {lang['dynamic-effective-balance']}
                  </span>
                  <span className='balance-contract-text mobile' tip="Total Discounted Margin + Unrealized PnL + Acc'd Funding">
                    {lang['dynamic-effective-balance']}
                  </span>
                </TipWrapper>
                <span className={`balance-contract-num ${version.current}`}>
                  <TipWrapper block={false}>
                    <span
                      className='open-add'
                      id='openAddMargin'
                      tip={lang['remove-margin']}
                      onClick={() => setBalanceListModalIsOpen(true)}
                    >
                      <img src={removeMarginIcon} alt='add margin' />
                    </span>
                  </TipWrapper>
                  <DeriNumberFormat value={trading.accountInfo.dynEffMargin} allowZero={true} decimalScale={2} />
                  <TipWrapper block={false}>
                    <span className='open-remove'
                      onClick={() => setBalanceListModalIsOpen(true)}
                      tip={lang['add-margin']}
                    >
                      <img src={addMarginIcon} alt='add margin' />
                    </span>
                  </TipWrapper>
                </span>
              </div>
              <TipWrapper block={false} >
                <div className='box-margin'>{lang['margin']}</div>
                <div className='box-margin'>
                  <span className='total-held' tip={lang['total-held-title']}>&nbsp;- {lang['total-held']}</span>
                  <span className='margin' ><DeriNumberFormat value={trading.position.marginHeld} allowZero={true} decimalScale={2} /></span>
                </div>
                <div className='margin-held-pos'>
                  <span className='pos-held' tip={lang['for-this-pos-title']}>&nbsp;- {lang['for-this-pos']} </span>
                  <span className='margin' ><DeriNumberFormat value={trading.position.marginHeldBySymbol} allowZero={true} decimalScale={2} /></span>
                </div>
              </TipWrapper>
              <TipWrapper block={true}>
                <div className='available-balance'>
                  <span className='pc' tip={lang['available-balance-title']} > {lang['available-balance']} </span>
                  <span className='mobile' tip={lang['available-balance-title']}>{lang['available-balance']}</span>
                  <span className='available-balance-num'>
                    <DeriNumberFormat value={trading.accountInfo.availableMargin} allowZero={true} decimalScale={2} />
                  </span>
                </div>
              </TipWrapper>
            </div>
          </div>
        </div>
        <div className='slider mt-13'>
          {/* <Slider max={trading.accountInfo.dynEffMargin} onValueChange={onSlide} start={trading.accountInfo.margin} freeze={slideFreeze} currentSymbolMarginHeld={trading.position.marginHeldBySymbol} originMarginHeld={trading.position.marginHeld} setStopCalculate={(value) => setStopCalculate(value)} /> */}
        </div>
        {/* <div className='title-margin'>{lang['margin']}</div> */}
        <div className='enterInfo'>
          {trading.displayVolume && <>
            <div className='text-info'>
              <div className='title-enter pool'>Margin Usage</div>
              <div className='text-enter poolL'>
                <DeriNumberFormat value={trading.impactPreview.marginUsage} decimalScale={2} />
              </div>
            </div>
            <div className='text-info'>
              <div className='title-enter pool'>{lang['trade-price']}</div>
              <div className='text-enter poolL'>
                <DeriNumberFormat value={trading.impactPreview.tradePrice} decimalScale={2} />
              </div>
            </div>
            <div className='text-info'>
              <div className='title-enter'>{lang['transaction-fee']}</div>
              <div className='text-enter'>
                <DeriNumberFormat value={trading.impactPreview.fee} allowZero={true} decimalScale={2} suffix={` ${trading.symbolInfo.bTokenSymbol}`} />
              </div>
            </div>
            {(type.isFuture || type.isPower) && <div className='text-info'>
              <div className='title-enter'>{lang['liquidation-price']}</div>
              <div className='text-enter'>
                {<DeriNumberFormat value={trading.impactPreview.liqPriceAfter} decimalScale={2} />}
              </div>
            </div>}
          </>}
        </div>
        <Operator
          wallet={wallet}
          spec={trading.symbolInfo}
          indexPrice={indexPrice}
          available={trading.accountInfo.availableMargin}
          volume={trading.displayVolume}
          direction={direction}
          leverage={trading.accountInfo.leverage}
          afterLeverage={trading.accountInfo.afterLeverage}
          afterTrade={afterTrade}
          position={trading.position}
          trading={trading}
          // symbolId={trading.symbolInfo.symbolId}
          // bTokenId={trading.symbolInfo.bTokenId}
          version={version}
          lang={lang}
          type={type}
        />
        <BalanceListDialog
          wallet={wallet}
          modalIsOpen={balanceListModalIsOpen}
          onClose={onCloseBalanceList}
          spec={trading.symbolInfo}
          afterDepositAndWithdraw={afterDepositAndWithdraw}
          position={trading.position}
          overlay={{ background: '#1b1c22', top: 80 }}
          className='balance-list-dialog'
          lang={lang}
        />
      </div>
      {/* <Loading modalIsOpen={loaded} overlay={{background : 'none'}}/> */}
    </div>
  )
}


function Operator({ wallet, spec, volume, available,
  baseToken, leverage, indexPrice, position, afterTrade, direction, trading, version, lang, type, afterLeverage }) {
  const [isApprove, setIsApprove] = useState(true);
  const [emptyVolume, setEmptyVolume] = useState(true);
  const [confirmIsOpen, setConfirmIsOpen] = useState(false);
  const [depositIsOpen, setDeposiIsOpen] = useState(false);
  const [balance, setBalance] = useState('');
  const walletContext = useWallet();
  const connect = () => {
    walletContext.connect()
  }
  useEffect(() => {
    if (walletContext.isConnected()) {
      wallet.setDetail(walletContext)
      window.ethereum = walletContext.ethereum
    } else {
      wallet.setDetail({})
    }
  }, [walletContext, lang]);

  const approve = async () => {
    // const res = await wallet.approve(spec.address, spec.symbol)
    // if (res.success) {
    //   setIsApprove(true);
    //   loadApprove();
    // } else {
    //   setIsApprove(false)
    //   alert(lang['approve-failed'])
    // }
  }

  const afterDeposit = async () => {
    trading.refresh();
    setDeposiIsOpen(false);
  }

  const afterDepositAndWithdraw = () => {
    trading.refresh();
    setDeposiIsOpen(false);
  }

  //load Approve status
  const loadApprove = async () => {
    if (wallet.isConnected() && spec) {
      // const result = await wallet.isApproved(spec.pool, spec.symbol)
      // setIsApprove(result);
    }
  }

  const loadBalance = async () => {
    if (wallet.isConnected() && spec) {
      const balance = await getWalletBalance(wallet.detail.chainId, spec.pool, wallet.detail.account, spec.symbol).catch(e => console.error('getWalletBalance was error,maybe network is Wrong'))
      if (balance) {
        setBalance(balance)
      }
    }
  }

  useEffect(() => {
    if (wallet.isConnected() && spec) {
      loadBalance();
    }
    return () => { };
  }, [wallet.detail.account, spec, available]);


  useEffect(() => {
    setEmptyVolume(!volume)
    return () => { };
  }, [volume]);


  useEffect(() => {
    if (spec) {
      loadApprove();
    }
    return () => { };
  }, [wallet.detail.isApproved, spec]);

  let actionElement = (<>
    <ConfirmDialog wallet={wallet}
      className='trading-dialog'
      spec={spec}
      modalIsOpen={confirmIsOpen}
      onClose={() => setConfirmIsOpen(false)}
      leverage={leverage}
      baseToken={baseToken}
      volume={volume}
      position={position.volume}
      indexPrice={indexPrice}
      afterTrade={afterTrade}
      direction={direction}
      lang={lang}
      afterLeverage={afterLeverage}
      trading={trading}
    />
    <button className='short-submit' onClick={() => setConfirmIsOpen(true)}>{lang['trade']}</button>
  </>)

  if (wallet.isConnected()) {
    if (!isApprove) {
      actionElement = <Button className='approve' btnText={lang['approve']} click={approve} lang={lang} />
    } else if (!available || (+available) <= 0) {
      actionElement = (<>
        <BalanceListDialog
          wallet={wallet}
          modalIsOpen={depositIsOpen}
          onClose={afterDepositAndWithdraw}
          spec={spec}
          afterDepositAndWithdraw={afterDepositAndWithdraw}
          position={trading.position}
          overlay={{ background: '#1b1c22', top: 80 }}
          className='balance-list-dialog'
          lang={lang}
        />
        <div className="noMargin-text">{((+trading.position.marginHeld) === 0 || !trading.position.marginHeld) ? lang['no-margin-tip'] : lang['not-enough-margin-tip']}</div>
        <button className='short-submit' onClick={() => setDeposiIsOpen(true)}>{lang['deposit']}</button>
      </>)
    } else if (emptyVolume) {
      actionElement = <button className='btn btn-danger short-submit' >{lang['enter-volume']}</button>
    }
  } else {
    actionElement = <Button className='btn btn-danger connect' btnText={lang['connect-wallet']} click={connect} lang={lang} />
  }
  return (
    <div className='submit-btn'>
      {actionElement}
    </div>
  )
}

export default inject('wallet', 'trading', 'version', 'type')(observer(Trade))