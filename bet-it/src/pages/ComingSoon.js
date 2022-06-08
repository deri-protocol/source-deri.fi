import { useState } from "react";
import { Icon } from '@deri/eco-common';
import './comingSoon.scss'
import logo from '../assets/img/comingSoon.svg'
export default function ComingSoon({ lang }) {
  const [collect, setCollect] = useState(true)
  const [isExpand, setIsExpand] = useState();
  const switchMenu = () => {
    setIsExpand(!isExpand)
  }
  return (
    <>
      <div className={collect ? "coming-soon bg-collect" : "coming-soon bg-collected"} >
        <span className='left-menu' onClick={switchMenu}><Icon token='left-menu' width='22.5' /></span>
        <div className='img'>
          <img src={logo} />
          <div className='coming-soon-text'>
            COMING SOON...
          </div>
        </div>
      </div>
    </>
  )
}