import { useState, useEffect, useCallback } from "react";
import { Icon, Button, UnderlineText } from '@deri/eco-common';
import classNames from 'classnames'
import './card.scss'
// import ApiProxy from "../../model/ApiProxy";
import { show } from "react-functional-modal"
import OperateMoadl from "../OperateModal/OperateModal"
import { useWallet } from "use-wallet";
import useChain from '../../hooks/useChain';
import { useAlert } from 'react-alert'
import DeriNumberFormat from "../../utils/DeriNumberFormat";
import { eqInNumber, getBtokenAmount, hasParent } from "../../utils/utils";
let timer;
export default function Card({ info, lang, getLang }) {
  const showModal = (type) => {
    show(<OperateMoadl lang={lang} type={type} />, {
      key: 'OperateMoadl',
      fading: true,
      style: {
        background: "rgba(0, 0, 0, 0.2)",
        zIndex: 99,
      }
    })
  }
  return (
    <div className={classNames('card-box', info.unit)}>
      <div className="buy-symbol-name">
        BUY {info.unit}
      </div>
      <div className={classNames('price-text', `${info.unit}-price`)}>
        <span className='price-up-text'>
          ${info.price}
        </span>
        <span className='price-down-text'>
          ${info.price}
        </span>
      </div>
      <div className="card-info">
        <div className="symbol-name">
          <Icon token={info.symbol} />
          {info.unit}
        </div>
        <div className="daily-income">
          <div className="daily-fee-day">
            +$1.55/{lang["day"]}
          </div>
          <div className='daily-income-text'>
            {lang["daily-income"]}
          </div>
        </div>
        <div className='price-postion'>
          <div className='price-info'>
            <div className="price-title">
              {lang["excution-price"]}
              <UnderlineText tip="The execution">
                <Icon token="wring" />
              </UnderlineText>
            </div>
            <div className="price-num">1</div>
          </div>
          <div className='position-info'>
            <div className="position-title">
              {lang["your-position"]}
              <UnderlineText tip="selling cash-covered put options">
                <Icon token="wring" />
              </UnderlineText>
            </div>
            <div className="position-num">1</div>
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
    </div>
  )
}