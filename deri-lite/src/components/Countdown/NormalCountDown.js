import React, { useState, useEffect } from 'react'
import moment from 'moment'
import './normalCountDown.less'

export default function CountDown({beginTimestamp = Date.now(),lastTimestamp = moment('2021-10-11 00:00:00') ,lang}){
  const [days, setDays] = useState('');
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');
  const [seconds, setSeconds] = useState('')
  useEffect(() => {
    const eventTime = moment(lastTimestamp).unix();
    const currentTime = moment(beginTimestamp).unix();
    let  diffTime = eventTime - currentTime;
    let  duration = moment.duration(diffTime * 1000, 'milliseconds')
    const interval = setInterval(() => {
      duration = moment.duration(duration.asMilliseconds() - 1000, 'milliseconds');
      let d = moment.duration(duration).days(),
          h = moment.duration(duration).hours(),
          m = moment.duration(duration).minutes(),
          s = moment.duration(duration).seconds();
        // d = d < 10 ? '0' + d : d;
        h = h < 10 ? '0' + h : h;
        m = m < 10 ? '0' + m : m;
        s = s < 10 ? '0' + s : s;
        setDays(d);
        setHours(h);
        setMinutes(m);
        setSeconds(s)
    },1000)
    return () => clearInterval(interval)
  }, [lastTimestamp,beginTimestamp])
  return (
    <div className='count-down'>
      <div className='c-d-title'>Activity Start Countdown</div>
      <div className='c-d-clock'>
        <div className='days'>{days}<div className='tip'>{lang['days']}</div></div> : 
        <div className='hours'>{hours}<div className='tip'>{lang['hours']}</div></div>: 
        <div className='minutes'>{minutes}<div className='tip'>{lang['minutes']}</div></div>: 
        <div className='seconds'>{seconds}<div className='tip'>{lang['seconds']}</div></div>  
      </div>
    </div>
  )
}