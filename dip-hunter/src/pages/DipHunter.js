import { useModal } from 'react-hooks-use-modal';
import classNames from 'classnames'
import './dip-hunter.scss'
import { Icon } from '@deri/eco-common';
import { isStartScroll, isMobile } from "../utils/utils";
import Font from '../components/Font/Font'
import { useState, useEffect, useCallback } from "react";
export default function DipHunter({ lang, getLang, actions }) {
  const [index, setIndex] = useState(2)
  const [isFixed, setIsFixed] = useState(false)
  const handler = useCallback(() => {
    let offset = 138
    let bgTop = document.getElementsByClassName('bg-img-color')[0]
    if (isStartScroll(offset)) {
      setIsFixed(true)
    } else {
      setIsFixed(false)
    }
    let top = 56
    if (!isStartScroll(top)) {
      const st = window.pageYOffset || document.documentElement.scrollTop;
      bgTop.style.top = top - st + "px"
    } else {
      bgTop.style.top = "0px"
    }
  })
  useEffect(() => {
    let bgTop = document.getElementsByClassName('bg-img-color')[0]
    document.addEventListener('scroll', handler, false);
    let top = 56
    if (!isStartScroll(top)) {
      const st = window.pageYOffset || document.documentElement.scrollTop;
      bgTop.style.top = top - st + "px"
    } else {
      bgTop.style.top = "0px"
    }
    return () => {
      document.removeEventListener('scroll', handler)
    }
  }, [])
  return (
    <div className='dip-hunter'>
      <div className={isFixed ? "bg-img-color hide-three" : "bg-img-color"}>
      </div>
      <div className='hunter-info'>
        <div className='left-info'>
          <div className='dip-hunter-title'>
            <Font text={lang["dip-hunter"]} />
          </div>
          <div className="helps-info">
            {index === 0 ? lang["info-des"] : lang["info-des-tow"]} <span>
              {lang["passive-income"]}
            </span>
          </div>
        </div>
        <div className='right-info'>
          <div className="slieder">
            <ul className="slieder-item-container">
              {index === 0 && <li className="option-one">
                <div className='option-title'>
                  {lang["how-it-works"]}
                </div>
                <div className='option-info-text'>
                  {lang["how-it-works-des"]}
                </div>
                <div className='option-info-img-text'>
                  <div className='option-text option-one-text'>
                    <div className='hr-orange'></div>
                    <span className='text-span'>
                      {lang["she-has-two-options"]}
                    </span>
                  </div>
                  <Icon token="how-it-works" className="how-it-works-img" />
                </div>
              </li>}
              {index === 1 && <li className="option-two">
                <div className='option-title'>
                  {lang["no-dip-hunter"]}
                </div>
                <div className='option-info-text'>
                  {lang["no-dip-hunter-des"]}
                </div>
                <div className='option-info-img-text'>
                  <div className='option-text option-tow-text-one'>
                    <div className='hr-orange'></div>
                    <span className='text-span font-size-two'>
                      <span className='scenario'>
                        {lang["scenario-a"]}
                        <br></br>
                      </span>
                      {lang["scenario-a-des"]}
                    </span>
                  </div>
                  <div className='option-text option-tow-text-two'>
                    <div className='hr-orange'></div>
                    <span className='text-span font-size-two'>
                      <span className='scenario'>
                        {lang["scenario-b"]}
                      </span>
                      {lang["scenario-b-des"]}
                    </span>
                  </div>
                  <Icon token="no-dip-hunter" className="no-dip-hunter-img" />
                </div>

              </li>}
              {index === 2 && <li className="option-three">
                cccc
              </li>}
              {index === 3 && <li className="option-four">
                ddd
              </li>}
            </ul>
            <div className="arrow-container">
              <span className="left-arrow">{index !== 0 && <Icon token="left" onClick={() => setIndex(index - 1)} />} </span>
              <span className="right-arrow">  {index !== 3 && <Icon token="right" onClick={() => setIndex(index + 1)} />} </span>
            </div>
            <div className="indicator-container">
              <span className={index === 0 ? "indicator active" : "indicator"} onClick={() => setIndex(0)}></span>
              <span className={index === 1 ? "indicator active" : "indicator"} onClick={() => setIndex(1)}></span>
              <span className={index === 2 ? "indicator active" : "indicator"} onClick={() => setIndex(2)}></span>
              <span className={index === 3 ? "indicator active" : "indicator"} onClick={() => setIndex(3)}></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}