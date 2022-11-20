
import { Button, Icon } from '@deri/eco-common'
import classNames from 'classnames'
import { useCallback, useState } from 'react'
import { useWallet } from 'use-wallet'
import useApprove from '../../hooks/useApprove'
import useInfo from '../../hooks/useInfo'
import useToken from '../../hooks/useToken'
import useTrade from '../../hooks/useTrade'
import DeriNumberFormat from '../../utils/DeriNumberFormat'
import './invest.scss'
export default function Invest() {
  const [value, setValue] = useState()
  const { account, connect } = useWallet()
  const token = useToken()
  const [isApprove, setIsApprove] = useState(false)
  const [isApproved, approve] = useApprove(token.tokenAddress, token.tokenName)
  const trade = useTrade()
  const click = useCallback(async () => {
    if(+value >0){
      await trade(token,value,"invest")
    }
  }, [token, trade, value])
  const onChange = useCallback(async (e) => {
    const { value } = e.target
    if (+value > 0 || value === "" || value !== "--") {
      setValue(value)
    } else {
      setValue("")
    }
  }, [])
  const clickApprove = useCallback(async () => {
    await approve((receipt) => {
      if (receipt) {
        console.log(receipt)
        setIsApprove(true)
      }
    })
  }, [approve])
  return <div className="invest-box">
    <div className="balance-box">
      <div className='balance-box-amount'>
        <div className='balance-box-amount-label'>
          Invest
        </div>
        <div className='balance-box-amount-value'>
          <input title='' type="number" placeholder='0.00' onChange={onChange} value={value} className="balance-box-amount-value-input" />
        </div>
      </div>
      <div className='balance-box-token'>
        <div className="balance-box-token-balance">
          Wallet Balance:
          <div className={classNames('balance-box-token-value', { isMaxBalance: value === token.walletBalance })} onClick={() => setValue(token.walletBalance)}>
            <DeriNumberFormat value={token.walletBalance} decimalScale={2} /> {token.tokenName}
          </div>
        </div>
        <div className="balance-box-token-name">
          <Icon token={token.tokenName} width={40} height={40} />
          {token.tokenName}
        </div>
      </div>
    </div>
    <div className='open-preview'>
      <div className="prop">
        <span>
          Transaction cost
          <Icon token="fee-hint" />
        </span>
        <span className='fee-value'>
          <DeriNumberFormat value={10} prefix="$" decimalScale={2} />
        </span>
      </div>
    </div>
    <div className={classNames("btn", { "btn-two": account && (!isApproved || isApprove) })}>
      {account && isApproved && !isApprove && <Button disabled={!value} label="INVEST" onClick={click} fontSize={18} className="invest-btn" width="100%" height="72" bgColor="rgba(56, 203, 137, 0.7)" radius="14" hoverBgColor="#38CB89" borderSize={0} fontColor="#FFFFFF" />}
      {account && (!isApproved || isApprove) && <>
        <Button label="APPOVE" fontSize={18} tip=" " tipIcon={isApprove ?"success-btn":""} onClick={clickApprove} className="approve-btn" width="272" height="72" bgColor="#38CB89" radius="14" borderSize={0} hoverBgColor="#38CB89" fontColor="#FFFFFF" />
        <Button label="START INVEST" fontSize={18} onClick={click} className="start-btn" width="272" height="72" bgColor="rgba(56, 203, 137, 0.7)" radius="14" hoverBgColor="#38CB89" borderSize={0} fontColor="#FFFFFF" />
      </>}
      {!account && <Button label="CONNECT WALLET" onClick={() => connect()} fontSize={18} width="100%" height="72" bgColor="rgba(56, 203, 137, 0.7)" radius="14" hoverBgColor="#38CB89" borderSize={0} fontColor="#FFFFFF" />}
    </div>
  </div>
} 