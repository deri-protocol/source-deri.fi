import React, { useState, useEffect } from 'react'
import moment from 'moment'
import './countDown.less'
import FlipDown from './Flipdown'


export default function CountDown({lastTimestamp ,lang,onEnd}){
  useEffect(() => {
    const flipdown = new FlipDown(lastTimestamp,{theme : 'light'})
    flipdown.start().ifEnded(() => {
      onEnd && onEnd();
    });
  }, [lastTimestamp])
  return (
    <div className='count-down'>
      <div className='tip'>Time to Start</div>
      <div id="flipdown" class="flipdown"></div>
    </div>
  )
}