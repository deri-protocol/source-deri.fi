import styled, { StyleSheetManager } from 'styled-components';
import { useEffect, useState } from 'react';
import { useWallet } from 'use-wallet';
import ApiProxy from '../../model/ApiProxy';
const Wrapper = styled.div`
  &.total-pnl-box{
    .total-pnl {
      width: 632px;
      height: 60px;
      background: #FFAB00;
      border: 2px solid #FFFFFF;
      border-radius: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 26px;
      padding: 0 50px;
      color: #FFFFFF;
      font-weight: 600px;

      .pnl-num {
        font-size: 34px;
        font-weight: 700px;
        display: flex;
        align-items: center;
      }
    }
  }
  

  @media only screen and (min-width : 375px ) and (max-width : 1000px) {
    &.total-pnl-box{
      .total-pnl {
        width: 347px;
        height: 48px;
        font-size: 12px;
        .pnl-num{
          font-size: 22px;
        }
      }
    }
  }
  &.mobile-total-pnl-box{
    .total-pnl {
      width: 327px;
      height: 48px;
      margin:0 24px ;
      font-size: 12px;
      .pnl-num{
        font-size: 22px;
      }
    }
  }
`
export default function PnlBar({ className = 'total-pnl-box', lang }) {
  const [totalPnl, setTotalPnl] = useState(0)
  const wallet = useWallet()

  const getBetsPnl = async () => {
    let res = await ApiProxy.request("getBetsPnl", { chainId: wallet.chainId, accountAddress: wallet.account })
    setTotalPnl(res)
  }

  useEffect(() => {
    if (wallet.chainId && wallet.account) {
      let interval = window.setInterval(() => { getBetsPnl() }, 1000 * 6);
      getBetsPnl()
      return () => clearInterval(interval);
    }
  }, [wallet])
  return (
    <StyleSheetManager disableCSSOMInjection>
      <Wrapper className={className}>
        <div className='total-pnl'>
          <span>{lang['total-pnl']} {+totalPnl < 0 ? lang["loss"] : lang['pnl-profit']} </span>
          <div className='pnl-num'>${(+totalPnl).toFixed(2)}</div>
        </div>
      </Wrapper>
    </StyleSheetManager>

  )
}