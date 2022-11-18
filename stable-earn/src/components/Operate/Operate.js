import './operate.scss'
import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import Invest from '../Invest/Invest';
import Redeem from '../Redeem/Redeem';
import { Button, Icon } from '@deri/eco-common';
import DeriNumberFormat from '../../utils/DeriNumberFormat';
import useToken from '../../hooks/useToken';
import useInfo from '../../hooks/useInfo';
export default function Operate() {
  const [operate, setOperate] = useState("invest")
  const token = useToken()
  const [info] = useInfo()
  console.log(info)
  return (
    <div className='stable-earn-info-operate'>
      <div className='invest-redeem-box'>
        <div className='invest-redeem-tab'>
          <div className={classNames("invest-redeem ", { check: operate === "invest" })} onClick={() => setOperate("invest")}>
            Invest
          </div>
          <div className='hr'></div>
          <div className={classNames("invest-redeem", { check: operate === "redeem" })} onClick={() => setOperate("redeem")}>
            Redeem
          </div>
        </div>
        <div className='operate-info-box'>
          {operate === 'invest' ? <Invest /> : <Redeem />}
        </div>
      </div>
      <div className='stats-box'>
        <div className='stats-box-title'>
          <Icon token="stats" />
          Stats
        </div>
        <div className='stats-box-apy'>
          <DeriNumberFormat value={8} suffix="%" decimalScale={0} />
          <span>Projected APY</span>
        </div>
        <div className='stats-box-info'>
          <div className='info-box'>
            Invest Token
            <span>
              {token.tokenName}
            </span>
          </div>
          <div className='info-box'>
            Yield Token
            <span>
              {token.tokenName}
            </span>
          </div>
          <div className='info-box'>
            Net Value
            <span>
              <DeriNumberFormat value={info["netValue"]} decimalScale={2} />
            </span>
          </div>
          <div className='info-box'>
            AUM
            <span>
              <DeriNumberFormat value={info["aum"]} decimalScale={2} prefix="$" />
            </span>
          </div>
          <div className='info-box'>
            <div className='fees'>
              Fees
              <Icon token='fee-hint' />
            </div>
            <span>
              0
            </span>
          </div>
        </div>
        <div className='stats-box-button'>
          <Button label="PERFORMANCE" fontSize={18} className="stats-chart-btn" icon="chart" width="100%" height="72" bgColor="rgba(55, 125, 255, 0.7)" radius="12" fontColor='#FFFFFF' fontWeight='700' borderSize="0" />
        </div>
      </div>
    </div>
  )
}