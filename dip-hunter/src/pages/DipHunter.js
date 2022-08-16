import { useModal } from 'react-hooks-use-modal';
import classNames from 'classnames'
import './dip-hunter.scss'
import usePool from "../hooks/usePool";
import { Icon } from '@deri/eco-common';
import { isStartScroll, isMobile } from "../utils/utils";
import Font from '../components/Font/Font'
import { useState, useEffect, useCallback } from "react";
import Header from "../components/Header/Header";
import Card from "../components/Card/Card"
export default function DipHunter({ lang, getLang, actions }) {
  const [index, setIndex] = useState(0)
  const [isFixed, setIsFixed] = useState(false)
  const [withDipA, setWithDipA] = useState(false)
  const [withDipB, setWithDipB] = useState(false)
  const [bTokens, symbols] = usePool()
  const switchMenu = () => {
    const status = !actions.getGlobalState('menuStatus')
    actions.setGlobalState({ 'menuStatus': status })
  } 
  return (
    <div className='dip-hunter'>
      <div className={isFixed ? "bg-img-color hide-three" : "bg-img-color"}>
      </div>
      <Header lang={lang} collect={true} switchMenu={switchMenu}></Header>
      <div className='hunter-info'>
        <div className='left-info'>
          <div className='dip-hunter-title'>
            <Font text={lang["dip-hunter"]} />
          </div>
          <div className="mobile-dip-hunter-title">
            <span className="dip-text">
              DIP
            </span>
            Hunter
          </div>
          <div className="helps-info">
            {lang["info-des"]} <span>
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
                <div className='option-title'>
                  {lang["with-dip-hunter"]}
                </div>
                <div className='option-info-text'>
                  {lang["with-dip-hunter-des"]}
                  <span> BTC-20000-P </span>
                  {lang["with-dip-hunter-des-two"]}
                </div>
                <div className='option-info-img-text'>
                  <div className={classNames("option-text option-three-text", { "option-up": withDipA })}>
                    <div className='hr-orange'></div>
                    <span className='text-span font-size-two'>
                      <span className='scenario'>
                        {lang["scenario-a"]}
                      </span>
                      <span>
                        {lang['eth-price-rises']}
                        <br></br>
                      </span>
                      {lang["with-dip-hunter-secenario-a-des"]}
                      <div className="check-example">
                        <div className="check-example-btn" onClick={() => setWithDipA(!withDipA)}>
                          <span> {lang["check-example"]}</span>
                          <Icon token={withDipA ? "up" : "down"} />
                        </div>
                        {withDipA && <div className='withDip-info'>
                          <div className='symbol-list'>
                            <div className="symbol-name">
                              BTC-20000-P
                            </div>
                            <div className="symbol-list-info">
                              <div className="symbol-list-info-title">
                                <span className="volume">{lang["volume"]}</span>
                                <span className="entry-price">{lang["entry-price"]}</span>
                                <span className="exit-price">{lang["exit-price"]}</span>
                                <span className="avg-daily-funding">{lang["avg-daily-funding"]}</span>
                                <span className="holding-period">{lang["holding-period"]}</span>
                              </div>
                              <div className="symbol-list-info-num">
                                <span className="volume">1</span>
                                <span className="entry-price">$220</span>
                                <span className="exit-price">$38.15</span>
                                <span className="avg-daily-funding">$18.50</span>
                                <span className="holding-period">60 days</span>
                              </div>

                            </div>
                          </div>
                          <div className='withDip-info-des'>
                            <div>{lang["with-dip-hunter-scenario-a-the"]}</div>
                            <div>{lang["with-dip-hunter-scenario-a-the-volume"]}</div>
                          </div>
                        </div>}
                      </div>
                    </span>
                  </div>
                </div>
              </li>}
              {index === 3 && <li className="option-four">
                <div className='option-title'>
                  {lang["with-dip-hunter"]}
                </div>
                <div className='option-info-text'>
                  {lang["with-dip-hunter-des"]}
                  <span> BTC-20000-P </span>
                  {lang["with-dip-hunter-des-two"]}
                </div>
                <div className='option-info-img-text'>
                  <div className={classNames("option-text option-four-text", { "option-up-b": withDipB })}>
                    <div className='hr-orange'></div>
                    <span className='text-span font-size-two'>
                      <span className='scenario'>
                        {lang["scenario-b"]}
                      </span>
                      <span>
                        {lang['eth-price-fall']}
                        <br></br>
                      </span>
                      {lang["with-dip-hunter-secenario-b-des"]}
                      <div className="check-example">
                        <div className="check-example-btn" onClick={() => setWithDipB(!withDipB)}>
                          <span> {lang["check-example"]}</span>
                          <Icon token={withDipB ? "up" : "down"} />
                        </div>
                        {withDipB && <div className='withDip-info'>
                          <div className='symbol-list'>
                            <div className="symbol-name">
                              BTC-20000-P
                            </div>
                            <div className="symbol-list-info">
                              <div className="symbol-list-info-title">
                                <span>{lang["volume"]}</span>
                                <span>{lang["entry-price"]}</span>
                                <span>{lang["exit-price"]}</span>
                                <span>{lang["avg-daily-funding"]}</span>
                                <span>{lang["holding-period"]}</span>
                              </div>
                              <div className="symbol-list-info-num">
                                <span className="volume">1</span>
                                <span className="entry-price">$220</span>
                                <span className="exit-price">$1382</span>
                                <span className="avg-daily-funding">$43</span>
                                <span className="holding-period">60 days</span>
                              </div>

                            </div>
                          </div>
                          <div className='withDip-info-des'>
                            <div>{lang["with-dip-hunter-scenario-b-the"]}</div>
                            <div>{lang["with-dip-hunter-scenario-b-the-volume"]}</div>
                            <div>{lang["with-dip-hunter-scenario-b-alice"]}</div>
                          </div>
                        </div>}
                      </div>
                    </span>
                  </div>
                </div>
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
      <div className='card-box-info'>
        {symbols && symbols.map((item, index) => {
          return (
            <Card key={index} info={item} lang={lang} bTokens={bTokens} />
          )
        })}
      </div>
    </div>
  )
}