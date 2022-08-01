import { useState, useEffect, useRef } from "react";
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
  const [OperateModal, openOperatetModal, closeOperatetModal] = useModal('root', {
    preventScroll: true,
    closeOnOverlayClick: true
  });

  const runInAction = async (action) => {
    let timer;
    const doAction = async () => {
      const position = await action();
      console.log("wallet", wallet.account)
      if (timer) {
        clearTimeout(timer)
      }
      if (position) {
        timer = window.setTimeout(() => doAction(action), 6000)
      }
    }
    return window.setTimeout(doAction, 6000)
  }

  const getSymbolInfo = async () => {
    if (wallet.isConnected()) {
      let res = await ApiProxy.request("getSymbolInfo", { chainId: wallet.chainId, accountAddress: wallet.account, symbol: info.symbol })
      console.log("getSymbolInfo", res, wallet.account)
      setSymbolInfo(res)
      return res
    } else if (wallet.status === "disconnected" && !wallet.account) {
      let chainId = DeriEnv.get() === "prod" ? 56 : 97
      let res = await ApiProxy.request("getSymbolInfo", { chainId: chainId, accountAddress: "0x0000000000000000000000000000000000000000", symbol: info.symbol })
      console.log("getSymbolInfo", res)
      setSymbolInfo(res)
      return res
    }
  }
  const showModal = (type) => {
    setType(type)
    openOperatetModal()
  }
  useEffect(async () => {
    let interval = 0;
    let time = 6000;
    if (wallet.chainId && +wallet.chainId !== 56) {
      time = 10000
    }
    if (info) {
      interval = window.setInterval(() => {
        getSymbolInfo()
      }, time)
      getSymbolInfo()
    }
    return () => {
      clearInterval(interval)
    }
  }, [info, wallet.account, wallet.chainId])


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
            <span> +$<DeriNumberFormat value={symbolInfo.pnlPerDay} decimalScale={2} /></span>/{lang["day"]}
          </div>
          <div className='daily-income-text'>
            <UnderlineText width="220" tip={symbolInfo.volume !== "0" ? `The estimated daily income of my current position. This rate is calculated from the daily funding of ${info.symbol} paid by the option buyers.` : ` The estimated daily income of 1 ${info.unit} position.This rate is calculated from the daily funding of ${info.symbol} paid by the option buyers.`}>
              <span>
                {symbolInfo.volume !== "0" ? lang["my-daily-income"] : lang["est-daily-income"]}
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
              <DeriNumberFormat value={symbolInfo.volume} /> {info.unit} {lang["options"]}
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
        <OperateModalDialog lang={lang} chain={chain} alert={alert} type={type} symbolInfo={symbolInfo} info={info} bTokens={bTokens} wallet={wallet} closeModal={closeOperatetModal} />
      </OperateModal>
    </div>
  )
}