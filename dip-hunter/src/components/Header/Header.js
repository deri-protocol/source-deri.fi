// import NetworkSelector from "../NetworkSelector/NetworkSelector";
import { Icon, ChainSelector, WalletConnector } from '@deri/eco-common';
import styled, { StyleSheetManager } from 'styled-components';
import { useCallback, useEffect } from 'react';
import classNames from "classnames";
import { useState } from 'react';
import { isStartScroll } from "../../utils/utils";

const Wrapper = styled.div`
  &.header {
    position : initial;
    font-size :32px;
    display:none;
    background : #FF891D;
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

  @media only screen and (min-width : 761px ){
    &.header {
      position : initial;
      font-size :32px;
      display : flex;
      padding : 0 110px;
      background : none;
      justify-content: space-between;
      align-items: center;
      height : 96px;
      .chain-wallet-btn{
        display:none;
      }
      .left-menu {
        display : none;
      }
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
    &.header.fixed {
      position : fixed;
      top : 0px;
      left : 0;
      box-sizing: border-box;
      width : 100%;
      justify-content: space-between;
      background : #FFAB00;
      z-index : 10; 
      animation : headerFadein 1s ease; 
      .chain-wallet-btn{
        display:flex;
      }
      .f-name {
        color : #FF7913;
      }
    }
    &.header.fadeOut {
      animation : headerFadeout 0.5s ease; 
      display:none;
    }
  }
  
@keyframes headerFadein {
  from {
    // opacity: 0;
    height : 0px;
  }
  to {
    // opacity: 1;
    height : 96px;
  }
}
@keyframes headerFadeout {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
  

`

export default function Header({ lang, collect, switchMenu }) {
  const [isFixed, setIsFixed] = useState(false);
  const [btnMainColor, setBtnMainColor] = useState('#FFAB00');
  const clazz = classNames('header', {
    fixed: isFixed,
    fadeOut: !isFixed
  })
  const handler = useCallback(() => {
    let offset = collect ? 138 : 202
    if (isStartScroll(offset)) {
      setIsFixed(true)
      setBtnMainColor('#FF7913')
    } else {
      setIsFixed(false)
      setBtnMainColor('#FFAB00')
    }
  })

  useEffect(() => {
    document.addEventListener('scroll', handler, false);
    return () => {
      document.removeEventListener('scroll', handler)
    }
  }, [collect])
  return (
    <StyleSheetManager disableCSSOMInjection>
      <Wrapper className={clazz}>
        <div className="left">
          <div className="logo-title">
            <span className='left-menu' onClick={switchMenu}><Icon token='left-menu' width='22.5' /></span>
            <span className="f-name">Dip</span><span className="l-name">Hunter</span>
          </div>
          {!isFixed && <div className="helps-info">
            {lang["info-des"]} <span>
              {lang["passive-income"]}
            </span>
          </div>}
        </div>
        <div className="right">
          <div className='chain-wallet-btn'>
            <ChainSelector bgColor={btnMainColor} collect={collect} id="header-network" />
            <WalletConnector lang={lang} bgColor={btnMainColor} />
          </div>
        </div>

      </Wrapper>
    </StyleSheetManager>
  )
}
