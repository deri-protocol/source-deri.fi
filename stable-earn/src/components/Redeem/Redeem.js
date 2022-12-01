import { Button, Icon, UnderlineText } from '@deri/eco-common'
import classNames from 'classnames'
import { useEffect } from 'react'
import { useCallback, useState } from 'react'
import { useWallet } from 'use-wallet'
import useApprove from '../../hooks/useApprove'
import useTrade from '../../hooks/useTrade'
import { FLP_TOKEN_ADDRESS } from '../../utils/Constants'
import DeriNumberFormat from '../../utils/DeriNumberFormat'
import { bg } from '../../utils/utils'
import Toggle from '../Toggle/Toggle'
import './redeem.scss'
export default function Redeem({token,accountInfo,load,loadBalance}) {
  const [daysOff, setDaysOff] = useState(true)
  const [isApprove, setIsApprove] = useState(false)
  const [fee, setFee] = useState(0)
  const [countime, setCountime] = useState("")
  const [disable, setDisable] = useState(true)
  const [endTimeProportion, setEndTimeProportion] = useState("")
  const [isTime, setIsTime] = useState(false)
  const { account, connect } = useWallet()
  const trade = useTrade()
  const [isApproved, approve] = useApprove(FLP_TOKEN_ADDRESS, "FLP")
  const click = useCallback(async () => {
    let type = daysOff ? isTime ? "claimRedeem" : "requestRedeem" : "instantRedeem"
    let message = daysOff ? isTime ? {
      title: {
        processing: `Claim Processing`,
        success: `Claim Executed`,
        error: `Claim Failed`,
      },
      content: {
        success: `Claimed ${accountInfo["estValue"]} ${token.tokenName}`,
        error: "Transaction Failed :"
      }
    } : {
      title: {
        processing: `Redeem Request Processing`,
        success: `Redeem Request Executed`,
        error: `Redeem Request Failed`,
      },
      content: {
        success: `Redeem all your fund shares`,
        error: "Transaction Failed :"
      }
    } : {
      title: {
        processing: `Instant Claim Processing`,
        success: `Instant Claim Executed`,
        error: `Instant Claim Failed`,
      },
      content: {
        success: `Instant claimed ${accountInfo["estValue"]} ${token.tokenName}`,
        error: "Transaction Failed : "
      }
    }
    await trade(null, 0, type, message, (receipt) => {
      if (receipt) {
        loadBalance()
        setIsApprove(false)
        load()
      }
    })
  }, [accountInfo, daysOff, isTime, load, loadBalance, token.tokenName, trade])
  const clickApprove = useCallback(async () => {
    await approve((receipt) => {
      if (receipt) {
        console.log(receipt)
        setIsApprove(true)
      }
    })
  }, [approve])

  useEffect(() => {
    if (accountInfo.timestamp) {
      let timestamp = new Date()
      let daysTime = 86400 * 15
      let now = timestamp.getTime() / 1000
      let end = accountInfo.timestamp
      let start = accountInfo.timestamp - daysTime
      if (now > end) {
        setIsTime(true)
      } else {
        setIsTime(false)
      }
      let leftTime = (end - now)
      if (leftTime > 0) {
        let proportion = ((now - start) / (daysTime)) * 100
        let d = Math.floor(leftTime / 60 / 60 / 24);
        let h = Math.floor(leftTime / 60 / 60 % 24);
        let timeText = `${d} days ${h} hours`
        setCountime(timeText)
        setEndTimeProportion(proportion)
      }

    }

  }, [accountInfo.timestamp])

  useEffect(() => {
    if (accountInfo.estValue) {
      let fee = 0
      if (accountInfo.timestamp) {
        fee = bg(accountInfo.estValue).times(0.9).times(0.002 + 0.002).toNumber()
        setFee(fee)
      } else if (!daysOff) {
        fee = bg(accountInfo.estValue).times(0.9).times(0.004 + 0.002).toNumber()
        setFee(fee)
      } else {
        setFee(fee)
      }
    }else{
      setFee(0)
    }
  }, [accountInfo.estValue, accountInfo.timestamp, daysOff])

  useEffect(() => {
    if (isApproved) {
      if (accountInfo.estValue) {
        if (accountInfo.timestamp && isTime) {
          setDisable(false)
        } else if (!accountInfo.timestamp) {
          setDisable(false)
        } else {
          setDisable(true)
        }
      } else {
        setDisable(true)
      }
    } else {
      setDisable(true)
    }
  }, [accountInfo.estValue, accountInfo.timestamp, isApproved, isTime])
  return <div className="redeem-box">
    {!accountInfo.timestamp ? <div className='redeem-box-days'>
      <div className='redeem-box-days-describe'>
        {daysOff ? "Redeem funds will be available for withdrawal in 7-15 days" : "Instant exchange BNBx to BNB on Apeswap. To know more refer our FAQs."}
      </div>
      <UnderlineText tip="Instant Redeem">
        <div className='redeem-box-days-off-on'>
          <Icon token={daysOff ? "redeem-off" : "redeem-on"} />
          <Toggle isOff={daysOff} onClick={setDaysOff} />
        </div>
      </UnderlineText>
    </div> : <div className='redeem-box-days-countdown'>
      <div className='redeem-box-days-countdown-describe'>
        <Icon token="time-hint" /> Your Fund will be withdrawable in {countime}
      </div>
      <div className='time-slider'>
        <div className='time-slider-box' style={{ width: `${endTimeProportion}%` }}></div>
      </div>
    </div>}
    <div className={classNames('redeem-box-info', { timedown: accountInfo.timestamp })}>
      <div className='redeem-box-info-value'>
        <div className='redeem-box-info-value-label'>
          Est. Value
        </div>
        <div className='redeem-box-info-value-text'>
          <div className='redeem-value'>
            <DeriNumberFormat value={accountInfo["estValue"]} decimalScale={2} />
          </div>
          <div className='redeem-token'>
            <Icon token="BUSD" width={40} height={40} />
            BUSD
          </div>
        </div>
      </div>
      {/* <div className='redeem-box-info-value'>
        <div className='redeem-box-info-value-label'>
          30-day Profit
        </div>
        <div className='redeem-box-info-value-text'>
          <div className='redeem-value'>
            <DeriNumberFormat value={0.5} decimalScale={2} />
          </div>
          <div className='redeem-token'>
            <Icon token="BUSD" width={40} height={40} />
            BUSD
          </div>
        </div>
      </div> */}
    </div>
    <div className='open-preview'>
      {daysOff ? null : <div className="prop">
        <span>
          Redeem cost
          <UnderlineText width='200' tip={
            daysOff ? !accountInfo.timestamp ? " no redemption fee required" : "est. transaction cost of swapping BNB into BUSD on Apeswap and closing BNBUSD postion on Deri Protocol." : " est. transaction cost of swapping BNBX into BUSD on Apeswap and closing BNBUSD postion on Deri Protocol."
          }>
            <Icon token="fee-hint" />
          </UnderlineText>
        </span>
        <span>
          <DeriNumberFormat value={fee} prefix="$" decimalScale={2} />
        </span>
      </div>}

    </div>
    <div className={classNames("btn", { "btn-two": account && (!isApproved || isApprove) })}>
      {account && isApproved && !isApprove && <Button label="REDEEM" disabled={disable} onClick={click} fontSize={18} className="redeem-btn" width="100%" height="72" bgColor="rgba(56, 203, 137, 0.7)" radius="14" hoverBgColor="#38CB89" borderSize={0} fontColor="#FFFFFF" />}
      {account && (!isApproved || isApprove) && <>
        <Button label="APPROVE" fontSize={18} tip=" " disabled={isApprove} tipIcon={isApprove ? "success-btn" : ""} onClick={clickApprove} className="approve-btn" width="272" height="72" bgColor="#38CB89" radius="14" borderSize={0} hoverBgColor="#38CB89" fontColor="#FFFFFF" />
        <Button label="START REDEEM" fontSize={18} disabled={disable} onClick={click} className="start-btn" width="272" height="72" bgColor="rgba(56, 203, 137, 0.7)" radius="14" hoverBgColor="#38CB89" borderSize={0} fontColor="#FFFFFF" />
      </>}
      {!account && <Button label="CONNECT WALLET" onClick={() => connect()} fontSize={18} width="100%" height="72" bgColor="rgba(56, 203, 137, 0.7)" radius="14" hoverBgColor="#38CB89" borderSize={0} fontColor="#FFFFFF" />}
    </div>
  </div>
}