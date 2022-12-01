import './operate.scss'
import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import Invest from '../Invest/Invest';
import Redeem from '../Redeem/Redeem';
import { Button, Icon, UnderlineText } from '@deri/eco-common';
import DeriNumberFormat from '../../utils/DeriNumberFormat';
import useToken from '../../hooks/useToken';
import useInfo from '../../hooks/useInfo';
import { useModal } from "react-hooks-use-modal"
import Chart from '../Chart/Chart';
import { useWallet } from 'use-wallet';
export default function Operate() {
  const [operate, setOperate] = useState("invest")
  const [token, loadBalance] = useToken()
  const [info, accountInfo, load] = useInfo()
  const wallet = useWallet()
  const [ChartModal, openChartModal, closeChartModal] = useModal('stable-earn-root', {
    preventScroll: true,
    closeOnOverlayClick: true
  });
  useEffect(() => {
    let interval = null
    interval = window.setInterval(() => {
      load()
    }, 1000 * 60 * 10)
    return () => {
      interval && clearInterval(interval)
    }
  }, [load])
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
          <div style={operate === 'invest' ? { display: "block" } : { display: "none" }}><Invest token={token} info={info} accountInfo={accountInfo} load={load} loadBalance={loadBalance} /></div>
          <div style={operate === 'redeem' ? { display: "block" } : { display: "none" }}><Redeem token={token} info={info} accountInfo={accountInfo} load={load} loadBalance={loadBalance} /></div>
        </div>
      </div>
      <div className='stats-box'>
        <div className='stats-box-title'>
          <Icon token="stats" />
          Stats
        </div>
        <div className='stats-box-apy'>
          <DeriNumberFormat value={4.83} suffix="%" decimalScale={2} />
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
              <UnderlineText tip="Stable Earn does not charge any fees.">
                <Icon token='fee-hint' />
              </UnderlineText>
            </div>
            <span>
              0
            </span>
          </div>
          <div className='info-box'>
            My Investment
            <span>
              <DeriNumberFormat value={accountInfo["estValue"]} decimalScale={2} />
            </span>
          </div>
        </div>
        <div className='stats-box-button'>
          <Button label="PERFORMANCE" fontSize={18} onClick={openChartModal} className="stats-chart-btn" icon="chart" width="100%" height="72" bgColor="rgba(55, 125, 255, 0.7)" radius="12" fontColor='#FFFFFF' fontWeight='700' borderSize="0" />
        </div>
      </div>
      <ChartModal>
        <Chart wallet={wallet} closeChartModal={closeChartModal} />
      </ChartModal>
    </div>
  )
}