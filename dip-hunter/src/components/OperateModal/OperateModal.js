import { useEffect, useState } from "react"
import { hide } from "react-functional-modal"
import { Icon, Button } from '@deri/eco-common';
import classNames from "classnames"
import './modal.scss';
export default function OperateMoadl({ lang, type = "POSITION", wallet }) {
  const [percent, setPercent] = useState("")
  return (
    <div className={classNames('withdraw-deposit-position', type)}>
      <div className='font-box'>
        <div className='font-text'>
          {type}
        </div>
 
      </div>
      <div className="modal-info">
        {type === "POSITION" && <div className="position-modal-info">
          <div className="position-modal-info-top">
            <div className="position-modal-info-col">
              <div className="info-col-title">
                {lang["my-position"]}
              </div>
              <div className="info-col-num">
                1.00 ETH {lang["options"]}
              </div>
            </div>
            <div className="position-modal-info-col">
              <div className="info-col-title">
                {lang["my-deposit"]}
              </div>
              <div className="info-col-num">
                $1,000
              </div>
            </div>
            <div className="position-modal-info-col">
              <div className="info-col-title">
                {lang["accumulated-income"]}
              </div>
              <div className="info-col-num">
                $123
              </div>
            </div>
            <div className="position-modal-info-col">
              <div className="info-col-title">
                {lang["daily-income"]}
              </div>
              <div className="info-col-num">
                $1.55/{lang["day"]}
              </div>
            </div>
          </div>
          <div className='value-strategy'>
            <div className="value-strategy-title">
              {lang["value-strategy"]}
            </div>
            <div className="value-strategy-des">
              {lang["value-strategy-des"]}
            </div>
          </div>
        </div>}
        {type === "DEPOSIT" && <div className="deposit-modal-info">
          <div className="deposit-withdraw-input">
            <div className="balance-position">
              {lang["wallet-balance"]}: 2,000
            </div>
            <div className="input-box">
              <div className="input-token">
                <input />
                <div className='baseToken'>
                  <Icon token="BUSD" width="22" height="22" />  BUSD <Icon token="select-token" />
                </div>
              </div>
              <div className="button-group">
                <div className={classNames("percent", { "selected": percent === "25%" })} onClick={() => { setPercent("25%") }}>25%</div>
                <div className={classNames("percent", { "selected": percent === "50%" })} onClick={() => { setPercent("50%") }}>50%</div>
                <div className={classNames("percent", { "selected": percent === "75%" })} onClick={() => { setPercent("75%") }}>75%</div>
                <div className={classNames("percent", { "selected": percent === "MAX" })} onClick={() => { setPercent("MAX") }}>MAX</div>
              </div>
            </div>
          </div>
          <div className="hr">

          </div>
          <div className="change-box">
            <div className="deposit-withdraw-modal-info-col">
              <div className="deposit-withdraw-modal-info-col-title">
                {lang["position-after-deposit"]}
              </div>
              <div className="deposit-withdraw-modal-info-col-num">
                1.00 ETH
              </div>
            </div>
            <div className="deposit-withdraw-modal-info-col">
              <div className="deposit-withdraw-modal-info-col-title">
                {lang["transaction-fee"]}
              </div>
              <div className="deposit-withdraw-modal-info-col-num">
                $0.22
              </div>
            </div>
          </div>
          <div className="deposit-withdraw-btn">
            <Button label={`${lang["deposit"]} BUSD`} width={375} height={56} hoverBgColor="#38CB89" radius={14} bgColor="#EEFAF3" fontColor="#38CB89" borderSize="0" />
          </div>
        </div>}
        {type === "WITHDRAW" && <div className="deposit-modal-info">
          <div className="change-box withdraw-top-info">
            <div className="deposit-withdraw-modal-info-col">
              <div className="deposit-withdraw-modal-info-col-title">
                {lang["current"]} ETH {lang["price"]}
              </div>
              <div className="deposit-withdraw-modal-info-col-num">
                $1,500
              </div>
            </div>
            <div className="deposit-withdraw-modal-info-col">
              <div className="deposit-withdraw-modal-info-col-title">
                {lang["current-withdraw-type"]}
              </div>
              <div className="deposit-withdraw-modal-info-col-num">
                BUSD ETH
              </div>
            </div>
          </div>
          <div className="deposit-withdraw-input">
            <div className="balance-position">
              {lang["current-position"]}: 2,000
            </div>
            <div className="input-box">
              <div className="input-token">
                <input />
                <div className='baseToken'>
                  <Icon token="BUSD" width="22" height="22" /> ETH-1000-P
                </div>
              </div>
              <div className="button-group">
                <div className={classNames("percent", { "selected": percent === "25%" })} onClick={() => { setPercent("25%") }}>25%</div>
                <div className={classNames("percent", { "selected": percent === "50%" })} onClick={() => { setPercent("50%") }}>50%</div>
                <div className={classNames("percent", { "selected": percent === "75%" })} onClick={() => { setPercent("75%") }}>75%</div>
                <div className={classNames("percent", { "selected": percent === "MAX" })} onClick={() => { setPercent("MAX") }}>MAX</div>
              </div>
            </div>
          </div>
          <div className="hr">

          </div>
          <div className="change-box">
            <div className="deposit-withdraw-modal-info-col">
              <div className="deposit-withdraw-modal-info-col-title">
                {lang["withdraw-amount"]}
              </div>
              <div className="deposit-withdraw-modal-info-col-num">
                1.00 ETH
              </div>
            </div>
            <div className="deposit-withdraw-modal-info-col">
              <div className="deposit-withdraw-modal-info-col-title">
                {lang["position-after-withdraw"]}
              </div>
              <div className="deposit-withdraw-modal-info-col-num">
                1.00 ETH
              </div>
            </div>
            <div className="deposit-withdraw-modal-info-col">
              <div className="deposit-withdraw-modal-info-col-title">
                {lang["transaction-fee"]}
              </div>
              <div className="deposit-withdraw-modal-info-col-num">
                $0.22
              </div>
            </div>
          </div>
          <div className="deposit-withdraw-btn">
            <Button label={`${lang["withdraw"]} BUSD`} width={375} height={56} hoverBgColor="#38CB89" radius={14} bgColor="#EEFAF3" fontColor="#38CB89" borderSize="0" />
          </div>
        </div>}
      </div>
      <div className="close-modal" onClick={() => { hide("OperateMoadl") }}>
        <Icon token="close-modal" />
      </div>
    </div>
  )
}