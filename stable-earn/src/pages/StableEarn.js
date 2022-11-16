import classNames from 'classnames'
import './stable-earn.scss'
import { Icon } from '@deri/eco-common';
import { isStartScroll, isMobile } from "../utils/utils";
import { useState, useEffect, useCallback } from "react";
export default function DipHunter({ lang, getLang, actions }) {
  const switchMenu = () => {
    const status = !actions.getGlobalState('menuStatus')
    actions.setGlobalState({ 'menuStatus': status })
  }
  return (
    <div className='stable-earn'>
      <div className='stable-earn-bg-box'>
        <div className='deri-stader-box'>
          <div className='deri-stader-title'>
            Powered By
            <div className='deri-stader'>
              <div className='deri-logo-text'>
                <Icon token="deri" />
                DERI
              </div>
              <div className='stader-logo-text'>
                X
                <Icon token="stader" />
                DERI
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}