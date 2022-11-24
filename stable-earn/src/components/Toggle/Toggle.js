import classNames from 'classnames';
import { useRef } from 'react';
import './toggle.scss'
export default function Toggle({ isOff, onClick }) {
  const isOnce = useRef()
  const click = () => {
    onClick(!isOff);
    isOnce.current = true
  }
  return (
    <div className={classNames("toggle", { on: !isOff, off: isOff && isOnce.current })} onClick={click}>
      <div className='toggle-round'></div>
    </div>
  )
}