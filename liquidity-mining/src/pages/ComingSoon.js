import { useState } from "react";
import './comingSoon.scss'
import logo from '../assets/img/comingSoon.svg'
export default function ComingSoon() {
  const [collect, setCollect] = useState(true)
  const [isExpand, setIsExpand] = useState();
  const switchMenu = () => {
    setIsExpand(!isExpand)
  }
  return (
    <>
      <div className={collect ? "coming-soon bg-collect" : "coming-soon bg-collected"} >
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