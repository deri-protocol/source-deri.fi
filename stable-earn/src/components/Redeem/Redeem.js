import { Button, Icon } from '@deri/eco-common'
import { useState } from 'react'
import DeriNumberFormat from '../../utils/DeriNumberFormat'
import Toggle from '../Toggle/Toggle'
import './redeem.scss'
export default function Redeem() {
  const [daysOff, setDaysOff] = useState(true)
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
            <DeriNumberFormat value={2} decimalScale={2} />
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
    <div className='btn'>
      <Button label="REDEEM" width="100%" className="redeem-btn" fontSize={18} height="72" bgColor="rgba(56, 203, 137, 0.2)" radius="14" hoverBgColor="#38CB89" borderSize={0} fontColor="#FFFFFF" />
    </div>
  </div>
}