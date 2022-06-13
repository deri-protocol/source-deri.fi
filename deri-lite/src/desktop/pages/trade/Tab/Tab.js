import React, { useState, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import classNames from 'classnames';
import type from '../../../../model/Type'
import { useLocation } from 'react-router-dom/cjs/react-router-dom.min'

export default function Tab({ lite = false, lang }) {
  const location = useLocation();
  const isV1Router = location.pathname.split('/')[3]
  const history = useHistory();
  // const [isLite, setIsLite] = useState(true);

  const clazz = classNames('check-lite-pro', {
    lite: lite,
    pro: !lite
  })

  const redirect = path => {
    history.push(path)
  }


  return (
    <div className={clazz}>
      {/* {type.isFuture && !isV1Router && <>
        <div className='lite' onClick={() => redirect('/futures/lite')} >{lang['lite']}</div>
        <div className='pro' onClick={() => redirect('/futures/pro')}> {lang['pro']}
        </div>
      </>}
      {type.isFuture && isV1Router && <>
        <div className='lite' onClick={() => redirect('/futures/lite/v1')} >{lang['lite']}</div>
        <div className='pro' onClick={() => redirect('/futures/pro/v1')}> {lang['pro']}
        </div>
      </>}
      {type.isOption && <>
        <div className='lite' onClick={() => redirect('/options/lite')} >{lang['lite']}</div>
        <div className='pro' onClick={() => redirect('/options/pro')}> {lang['pro']}
        </div>
      </>} */}
    </div>
  )
}