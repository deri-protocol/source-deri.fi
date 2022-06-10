import React, { useState,useEffect } from 'react'
import './areaPicker.less'
import classNames from 'classnames'
import Category from '../../model/Category'
import { inject, observer } from 'mobx-react'

function AreaPicker({lang,version,wallet,type,trading,loading}){
  const [current, setCurrent] = useState('Futures')
  const clazz = classNames('area-picker-wrapper',current)
  const [styles, setStyles] = useState({})
  const siwtchZone = (zone) => {
    setCurrent(zone)
    if(zone === 'Futures') {
      type.setCurrent('future')
      Category.setCurrent("futures")
    } else if(zone === 'Options') {
      type.setCurrent('option')
      Category.setCurrent('option')
    } else if(zone === 'Powers'){
      type.setCurrent('power')
      Category.setCurrent('option')
    }
    loading.loading()
    trading.init(wallet,() => {
      loading.loaded()
    })
  }
  useEffect(() => {
    wallet.supportOpen ? setStyles({width : `${100 / 3}%` }) : setStyles({width : `${100 /2 }%`})
    return () => {}
  }, [wallet.detailt])
  return (
   <div className='area-picker'>
      <div className={clazz}>
        <span className='left' style={styles} onClick={() => siwtchZone('Futures')}>Futures</span>
        <span className='middle' style={styles} onClick={() => siwtchZone('Options')}>Options</span>
        {wallet.supportOpen &&<span className='right' style={styles} onClick={() => siwtchZone('Powers')}> Powers</span>}
      </div>
    </div> 
  )
}

export default inject('version','wallet','type','trading',"loading")(observer(AreaPicker))