
import { Button, Icon } from '@deri/eco-common'
import { useState } from 'react'
import DeriNumberFormat from '../../utils/DeriNumberFormat'
import './invest.scss'
export default function Invest() {
  const [value, setValue] = useState()
  return <div className="invest-box">
    <div className="balance-box">
      <div className='balance-box-amount'>
        <div className='balance-box-amount-label'>
          Invest
        </div>
        <div className='balance-box-amount-value'>
          <input type="number" placeholder='0.00' value={value} className="balance-box-amount-value-input" />
        </div>
      </div>
      <div className='balance-box-token'>
        <div className="balance-box-token-balance">
          Wallet Balance:
          <div className='balance-box-token-value'>
            100 BUSD
          </div>
        </div>
        <div className="balance-box-token-name">
          <Icon token="BUSD" width={40} height={40} />
          BUSD
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
    <div className='btn'>
      <Button label="INVEST" fontSize={18} className="invest-btn" width="100%" height="72" bgColor="rgba(56, 203, 137, 0.2)" radius="14" hoverBgColor="#38CB89" borderSize={0} fontColor="#FFFFFF" />
    </div>
  </div>
} 