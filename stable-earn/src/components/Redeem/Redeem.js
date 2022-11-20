import { Button, Icon } from '@deri/eco-common'
import classNames from 'classnames'
import { useCallback, useState } from 'react'
import { useWallet } from 'use-wallet'
import useApprove from '../../hooks/useApprove'
import useInfo from '../../hooks/useInfo'
import useTrade from '../../hooks/useTrade'
import { FLP_TOKEN_ADDRESS } from '../../utils/Constants'
import DeriNumberFormat from '../../utils/DeriNumberFormat'
import Toggle from '../Toggle/Toggle'
import './redeem.scss'
export default function Redeem() {
  const [daysOff, setDaysOff] = useState(true)
  const [isApprove, setIsApprove] = useState(false)
  const { account, connect } = useWallet()
  const [,accountInfo] = useInfo()
  const trade = useTrade()
  const [isApproved, approve] = useApprove(FLP_TOKEN_ADDRESS, "FLP")
  const click = useCallback(async () => {
    let type = daysOff ? "instantRedemm" : "claimRedeem"
    await trade(null, 0, type, () => {

    })
  }, [daysOff, trade])
  const clickApprove = useCallback(async () => {
    await approve((receipt) => {
      if (receipt) {
        console.log(receipt)
        setIsApprove(true)
      }
    })
  }, [approve])
  console.log(accountInfo)
  return <div className="redeem-box">
    <div className='redeem-box-days'>
      <div className='redeem-box-days-describe'>
        Redeem funds will be available for withdrawal in 7-15 days
      </div>
      <div className='redeem-box-days-off-on'>
        <Icon token={daysOff ? "redeem-off" : "redeem-on"} />
        <Toggle isOff={daysOff} onClick={setDaysOff} />
      </div>
    </div>
    <div className='redeem-box-info'>
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
      <div className='redeem-box-info-value'>
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
      </div>
    </div>
    <div className='open-preview'>
      <div className="prop">
        Redeem cost
        <span>
          <DeriNumberFormat value={10} prefix="$" decimalScale={2} />
        </span>
      </div>
    </div>
    <div className={classNames("btn", { "btn-two": account && (!isApproved || isApprove) })}>
      {account && isApproved && !isApprove && <Button label="REDEEM" onClick={click} fontSize={18} className="redeem-btn" width="100%" height="72" bgColor="rgba(56, 203, 137, 0.7)" radius="14" hoverBgColor="#38CB89" borderSize={0} fontColor="#FFFFFF" />}
      {account && (!isApproved || isApprove) && <>
        <Button label="APPOVE" fontSize={18} tip=" " tipIcon={isApprove ? "success-btn" : ""} onClick={clickApprove} className="approve-btn" width="272" height="72" bgColor="#38CB89" radius="14" borderSize={0} hoverBgColor="#38CB89" fontColor="#FFFFFF" />
        <Button label="START REDEEM" fontSize={18} onClick={click} className="start-btn" width="272" height="72" bgColor="rgba(56, 203, 137, 0.7)" radius="14" hoverBgColor="#38CB89" borderSize={0} fontColor="#FFFFFF" />
      </>}
      {!account && <Button label="CONNECT WALLET" onClick={() => connect()} fontSize={18} width="100%" height="72" bgColor="rgba(56, 203, 137, 0.7)" radius="14" hoverBgColor="#38CB89" borderSize={0} fontColor="#FFFFFF" />}
    </div>
  </div>
}