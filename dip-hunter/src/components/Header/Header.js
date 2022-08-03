// import NetworkSelector from "../NetworkSelector/NetworkSelector";
import { Icon, ChainSelector, WalletConnector } from '@deri/eco-common';
import styled from 'styled-components';

const Wrapper = styled.div`
  &.header {
    position : initial;
    font-size :32px;
    display : none;
    background-color : #FF891D;
    justify-content: space-between;
    align-items: center;
    height : 88px;
    .f-name {
      font-weight: 800;
      color : #FFAB00; 
      margin-right : 4px;
    }
    .l-name {
      font-weight: 800;
      color : #FFF;
      margin-right :140px;
    }
    .right {
      display : flex;
    }
  }

  @media only screen and (min-width : 0px ) and (max-width : 760px) {
    &.header {
      padding : 0 24px;
      display : flex;
      .left {
        font-size :24px;
        display: flex;
        align-items: center;
        flex-direction: column;
        align-items:flex-start;
        .logo-title{
          display: flex;
          align-items: center;
        }
        .left-menu {
          margin-right : 24px;
        }
        .l-name {
          margin-right : 20px;
        }
        .helps-info{
          font-size:14px;
          color:#FFF;
          width:208px;
          text-align: start;
          margin-left:47px;
        }
      }
      .right {
        .chain-wallet-btn {
          display : flex;
          .wallet-btn{
            border: 1px solid #fff;
            width: 34px;
            height: 34px;
            border-radius: 8px;
            overflow: hidden;
            span{
              display:none;
            }
          }
          .nw-wrapper{
            width: 34px;
            height: 34px;
            border: 1px solid #fff;
            border-radius: 8px;
            font-size: 12px;
            padding: 0;
            justify-content: center;
            min-height: auto;
            position: initial;
            align-items: center;
            .name,.arrow{
              display:none
            }
            
          }
        }
      }
    }
  }
  

`

export default function Header({ lang, collect, switchMenu }) {
  return (
    <Wrapper className="header">
      <div className="left">
        <div className="logo-title">
          <span className='left-menu' onClick={switchMenu}><Icon token='left-menu' width='22.5' /></span>
          <span className="f-name">Dip</span><span className="l-name">Hunter</span>
        </div>
        <div className="helps-info">
          {lang["info-des"]} <span>
            {lang["passive-income"]}
          </span>
        </div>
      </div>
      <div className="right">
        <div className='chain-wallet-btn'>
          <ChainSelector bgColor="#FFAB00" collect={collect} id="header-network" />
          <WalletConnector lang={lang} bgColor="#FFAB00" />
        </div>
      </div>

    </Wrapper>
  )
}
