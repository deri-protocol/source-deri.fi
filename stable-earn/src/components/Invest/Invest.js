import { Button, Icon, UnderlineText } from '@deri/eco-common'
import classNames from 'classnames'
import { useCallback, useEffect, useState } from 'react'
import { useWallet } from 'use-wallet'
import useApprove from '../../hooks/useApprove'
import useTrade from '../../hooks/useTrade'
import DeriNumberFormat from '../../utils/DeriNumberFormat'
import { bg } from '../../utils/utils'
import './invest.scss'
export default function Invest({token,accountInfo,load,loadBalance}) {
  const [value, setValue] = useState()
  const [disabled, setDisabled] = useState(true)
  const { account, connect } = useWallet()
  const [fee, setFee] = useState(0)
  const [isApprove, setIsApprove] = useState(false)
  const [isApproved, approve] = useApprove(token.tokenAddress, token.tokenName)
  const trade = useTrade()
  const click = useCallback(async () => {
    let message = {
      title: {
        processing: `Invest Processing`,
        success: `Invest Executed`,
        error: `Invest Failed`,
      },
      content: {
        success: `Invest ${value} ${token.tokenName}`,
        error: "Transaction Failed :"
      }
    }
    if (bg(value).gt(0)) {
      await trade(token, value, "invest", message, (receipt) => {
        if (receipt) {
          loadBalance()
          setIsApprove(false)
          setValue("")
          load()
        }
      })
    }
  }, [load, loadBalance, token, trade, value])
  const onChange = useCallback(async (e) => {
    const { value } = e.target
    if (value < 0 || isNaN(value)) {
      setValue("")
    } else {
      setValue(value)
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

  useEffect(() => {
    if (isApproved) {
      if (+value) {
        if (bg(value).gt(token.walletBalance)) {
          setDisabled(true)
        } else {
          setDisabled(false)
        }
        let fee = bg(value).times(0.9).times(0.002 + 0.002).toNumber()
        setFee(fee)
      } else {
        setFee(0)
        setDisabled(true)
      }
    } else {
      setDisabled(true)
    }
  }, [isApproved, token.walletBalance, value])

  return <div className="invest-box">
    {accountInfo.timestamp ? <div className='invest-disable-box'>
      <Icon token="invest-disable" />
      <div className='invest-disable-box-title'>
        Under Redemption Process
      </div>
      <div className='invest-disable-box-text'>
        Please wait until the redemption finish before re-investing
      </div>
    </div> : <>
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
            <UnderlineText width='200' tip="est. transaction cost of swapping BUSD into BNB on Apeswap and opening short BNBUSD on Deri Protocol.">
              <Icon token="fee-hint" />
            </UnderlineText>
          </span>
          <span className='fee-value'>
            <DeriNumberFormat value={fee} prefix="$" decimalScale={2} />
          </span>
        </div>
      </div>
    </>}
    <div className={classNames("btn", { "btn-two": account && (!isApproved || isApprove) })}>
      {account && isApproved && !isApprove && <Button disabled={disabled} label="INVEST" onClick={click} fontSize={18} className="invest-btn" width="100%" height="72" bgColor="rgba(56, 203, 137, 0.7)" radius="14" hoverBgColor="#38CB89" borderSize={0} fontColor="#FFFFFF" />}
      {account && (!isApproved || isApprove) && <>
        <Button label="APPROVE" fontSize={18} disabled={isApprove} tip=" " tipIcon={isApprove ? "success-btn" : ""} onClick={clickApprove} className="approve-btn" width="272" height="72" bgColor="#38CB89" radius="14" borderSize={0} hoverBgColor="#38CB89" fontColor="#FFFFFF" />
        <Button label="START INVEST" disabled={disabled} fontSize={18} onClick={click} className="start-btn" width="272" height="72" bgColor="rgba(56, 203, 137, 0.7)" radius="14" hoverBgColor="#38CB89" borderSize={0} fontColor="#FFFFFF" />
      </>}
      {!account && <Button label="CONNECT WALLET" onClick={() => connect()} fontSize={18} width="100%" height="72" bgColor="rgba(56, 203, 137, 0.7)" radius="14" hoverBgColor="#38CB89" borderSize={0} fontColor="#FFFFFF" />}
    </div>
  </div>
} 