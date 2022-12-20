
import React, { useState, useEffect } from 'react'
import hint from './img/hint.svg'
import skip from './img/skip.svg'
import closeModalIcon from './img/close-modal-icon.svg'
import Cookies from 'js-cookie'
import './hint.scss'


export default function Announcement({ router }) {
  const [show, setShow] = useState(false)
  const [isSkip, setIsSkip] = useState(true)
  const setCookie = (name,value,expires = 365 ,domain = ".deri.fi",path = '/')=>{
    if(name && value){
     Cookies.set(name,value,{expires : expires,domain : domain,path : path})
    }
  }
  const closeHint = () => {
    if (isSkip) {
      setCookie('deri-fi', "false", 1)
    }
    setShow(false)
  }
  useEffect(() => {
    //timestep 1661972400
    let timestamp = new Date()
    // if(timestamp.getTime() >= 1661972400000){
    //   return false;
    // }
    let cookie = Cookies.get("deri-fi")
    if (cookie === "false") {
      return false;
    }
    setShow(true)
  }, [])


  return (
    show ? <div className="trade-hint ">
      <div className='hint-img'>
        <img src={hint} alt='' />
      </div>
      <div className='hint-box'>
        <div className='hint-title'>
          <span>
            Maintenance Notice
          </span>
          <img className='close' src={closeModalIcon} alt='X' onClick={closeHint} />
        </div>
        <div className='hint-content'>
          <div className='hint-text vip-text'>
            Website is currently being upgraded and is temporarily unavailable. Please check back later for updates.
          </div>
          <div className='hint-link vip-skip'>
            <div className={isSkip ? 'skip check-skip' : 'skip'} onClick={() => setIsSkip(!isSkip)}>
              {isSkip && <img src={skip} />}
            </div>  <span>skip notification until tomorrow</span>
          </div>
        </div>
      </div>
      <div className='m-check' onClick={closeHint}>
        <span className='check'>
          OK
        </span>
      </div>
    </div> : null

  )
}