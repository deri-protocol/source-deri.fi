import React, { useState,useEffect } from 'react'
import './areaPicker.less'
import classNames from 'classnames'
import { inject, observer } from 'mobx-react'

function AreaPicker({lang,version,wallet,type}){
  const [current, setCurrent] = useState('main')
  const clazz = classNames('area-picker-wrapper',current)
  const [styles, setStyles] = useState({})
  const siwtchZone = (zone) => {
    setCurrent(zone)
    if(zone === 'innovation') {
      version.setCurrent('v2_lite')
    } else if(zone === 'main') {
      version.setCurrent('v2')
    } else if(zone === 'open'){
      version.setCurrent('v2_lite_open')
    }
  }
  useEffect(() => {
    if(version.isV2Lite){
      siwtchZone('innovation')
    } else if(version.isV2){
      siwtchZone('main')
    } else if(version.isOpen && wallet.supportOpen) {
      siwtchZone('open')
    }
    wallet.supportOpen ? setStyles({width : `${100 / 3}%` }) : setStyles({width : `${100 /2 }%`})
    return () => {}
  }, [wallet.detail,version.current])
  return (
    ((version.isV2 || version.isV2Lite || version.isOpen) && wallet.supportInnovation  &&!type.isOption) ? <div className='area-picker'>
      <div className={clazz}>
        <span className='left' style={styles} onClick={() => siwtchZone('Futures')}>Futures</span>
        <span className='middle' style={styles} onClick={() => siwtchZone('Options')}>Options</span>
        {wallet.supportOpen &&<span className='right' style={styles} onClick={() => siwtchZone('Powers')}> Powers</span>}
      </div>
    </div> 
    : null
  )
}

export default inject('version','wallet','type')(observer(AreaPicker))