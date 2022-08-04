import { useState, useEffect, useRef, useCallback } from "react";
import { Icon, Button, UnderlineText } from '@deri/eco-common';
import classNames from 'classnames'
import './card.scss'
import ApiProxy from "../../model/ApiProxy";
import { useModal } from "react-hooks-use-modal"
import OperateModalDialog from "../OperateModal/OperateModal"
import { useWallet } from "use-wallet";
import useChain from '../../hooks/useChain';
import { useAlert } from 'react-alert'
import DeriNumberFormat from "../../utils/DeriNumberFormat";
import { DeriEnv, bg } from '../../web3'
import { eqInNumber, getBtokenAmount, hasParent } from "../../utils/utils";
export default function Card({ info, lang, getLang, bTokens }) {
  const [symbolInfo, setSymbolInfo] = useState({})
  const [type, setType] = useState("")
  const wallet = useWallet();
  const chains = useChain()
  const chain = chains.find((item) => eqInNumber(item.chainId, wallet.chainId))
  const alert = useAlert();
  const pausedRef = useRef()
  const [OperateModal, openOperatetModal, closeOperatetModal] = useModal('root', {
    preventScroll: true,
    closeOnOverlayClick: true
  });

  const runInAction = async (action) => {
    let timer = null;
    const position = await action();
    if (timer) {
      window.clearTimeout(timer)
    }
    console.log('paused ', pausedRef.current)
    if (position && !pausedRef.current) {
      timer = window.setTimeout(() => runInAction(action), 6000)
    }
    return timer
  }

  const getSymbolInfo = async () => {
    console.log("wallet.status",wallet.status)
    if (wallet.isConnected()) {
      let res = await ApiProxy.request("getSymbolInfo", { chainId: wallet.chainId, accountAddress: wallet.account, symbol: info.symbol })
      if (res.indexPrice) {
        console.log("getSymbolInfo", res, wallet.account)
        setSymbolInfo(res)
      }
      return res
    } else if ((wallet.status === "disconnected" || wallet.status === "error") && !wallet.account) {
      let chainId = DeriEnv.get() === "prod" ? 56 : 97
      let res = await ApiProxy.request("getSymbolInfo", { chainId: chainId, accountAddress: "0x0000000000000000000000000000000000000000", symbol: info.symbol })
      if (res.indexPrice) {
        console.log("getSymbolInfo", res)
        setSymbolInfo(res)
      }
      return res
    }
  }
  const showModal = (type) => {
    setType(type)
    openOperatetModal()
  }

  const afterTransaction = () => {
    getSymbolInfo()
  }
  // useEffect(async () => {
  //   let interval = 0;
  //   if (info.symbol) {
  //     interval && window.clearTimeout(interval)
  //     pausedRef.current = true
  //     interval = await runInAction(getSymbolInfo)
  //     pausedRef.current = false
  //     getSymbolInfo()
  //     console.log("clearTimeout", interval)
  //   }
  //   return () => {

  //     console.log("============", interval)
  //     interval && window.clearTimeout(interval)
  //   }
  // }, [wallet, info.symbol, wallet.account, wallet.chainId])

  useEffect(() => {
    let interval = null;
    let time = 6000
    if (wallet.isConnected() && +wallet.chainId !== 56) {
      time = 10000
    }
    if (info.symbol) {
      setSymbolInfo({})
      getSymbolInfo()
      interval = window.setInterval(() => {
        getSymbolInfo()
      }, time)
    }
    return () => {
      interval && window.clearInterval(interval)
    }
  }, [info.symbol, wallet.account, wallet.chainId,wallet.status])


  return (
    <div className={classNames('card-box', info.unit)}>
      <div className="buy-symbol-name">
        BUY {info.unit}
      </div>
      <div className={classNames('price-text', `${info.unit}-price`)}>
        <span className='price-up-text'>
          ${info.strikePrice}
        </span>
        <span className='price-down-text'>
          ${info.strikePrice}
        </span>
      </div>
      <div className="card-info">
        <div className="symbol-name">
          <Icon token={info.unit} />
          {info.unit}
        </div>
        <div className="daily-income">
          <div className="daily-fee-day">
            <span> +$<DeriNumberFormat width="50px" value={symbolInfo.pnlPerDay} decimalScale={2} /></span>/{lang["day"]}
          </div>
          <div className='daily-income-text'>
            <UnderlineText className="text-left" width="220" tip={symbolInfo.volume !== "0" && symbolInfo.volume ? `The estimated daily income of my current position. This rate is calculated from the daily funding of ${info.symbol} paid by the option buyers.` : ` The estimated daily income of 1 ${info.unit} position.This rate is calculated from the daily funding of ${info.symbol} paid by the option buyers.`}>
              <span>
                {symbolInfo.volume && symbolInfo.volume !== "0" ? lang["my-daily-income"] : `${lang["est-daily-income"]} ${info.unit}`}
              </span>
              <Icon token="daily-tip" />
            </UnderlineText>
          </div>
        </div>
        <div className='price-postion'>
          <div className='price-info'>
            <div className="price-title">
              {lang["excution-price"]}
              <UnderlineText tip="The excecise price of the underlier put options.">
                <Icon token="wring" />
              </UnderlineText>
            </div>
            <div className="price-num">${info.strikePrice}</div>
          </div>
          <div className='position-info'>
            <div className="position-title">
              {lang["your-position"]}
              <UnderlineText tip="Selling cash-covered put options">
                <Icon token="wring" />
              </UnderlineText>
            </div>
            <div className="position-num">
              <DeriNumberFormat value={symbolInfo.volume} width="50px" /> {info.unit} {lang["options"]}
            </div>
          </div>
        </div>
        <div className="deposit-withdraw-position">
          <div className="postion-btn" onClick={() => { showModal("POSITION") }}>
            {lang["position-go"]}
            <Icon token="position-go" />
          </div>
          <div className="deposit-withdraw">
            <Button label={lang["deposit"]} onClick={() => { showModal("DEPOSIT") }} className="deposit" height={62} fontSize={16} hoverBgColor="#38CB89" radius={0} bgColor="#EEFAF3" fontColor="#38CB89" borderSize="0" />
            <Button label={lang["withdraw"]} onClick={() => { showModal("WITHDRAW") }} className="withdraw" height={62} fontSize={16} hoverBgColor="#FF5630" radius={0} bgColor="#FCEFEB" fontColor="#FF5630" borderSize="0" />
          </div>
        </div>
      </div>
      <OperateModal>
        <OperateModalDialog lang={lang} afterTransaction={afterTransaction} chain={chain} alert={alert} type={type} symbolInfo={symbolInfo} info={info} bTokens={bTokens} wallet={wallet} closeModal={closeOperatetModal} />
      </OperateModal>
    </div>
  )
}