import Header from "../components/Header/Header";
import Card from "../components/Card/Card";
import { useModal } from 'react-hooks-use-modal';
import classNames from 'classnames'
import './betit.scss'
import { useState, useEffect, useCallback } from "react";
import { isStartScroll, isMobile } from "../utils/utils";
import PnlBar from "../components/PnlBar/PnlBar";
import usePool from "../hooks/usePool";
import leftBg from "../assets/img/bg-icon-left.png"
import rightBg from "../assets/img/bg-icon-right-buttom.png"
import TinderCard from '../components/TinderCard/TinderCard'
export default function BetIt({ lang, getLang, actions }) {
  const [stepNow, setStepNow] = useState(1)
  const [isFixed, setIsFixed] = useState(false)
  const [bTokens, symbols] = usePool();
  console.log(bTokens, symbols)
  const [collect, setCollect] = useState(true)
  const [openSymbol, setOpenSymbol] = useState("")
  const [isExpand, setIsExpand] = useState();
  const mobile = isMobile()
  const [CardModal, openCardModal, closeCardModal] = useModal('root', {
    preventScroll: true,
    closeOnOverlayClick: false
  });

  const showCardModal = (symbol) => {
    if (mobile) {
      setOpenSymbol(symbol)
      openCardModal()
    }

  }
  const handler = useCallback(() => {
    let offset = collect ? 138 : 202
    let bgTop = document.getElementsByClassName('bg-img-color')[0]
    if (isStartScroll(offset)) {
      setIsFixed(true)
    } else {
      setIsFixed(false)
    }
    let top = collect ? 56 : 120
    if (!isStartScroll(top)) {
      const st = window.pageYOffset || document.documentElement.scrollTop;
      bgTop.style.top = top - st + "px"
    } else {
      bgTop.style.top = "0px"
    }
  })

  const switchMenu = () => {
    setIsExpand(!isExpand)
    const status = !actions.getGlobalState('menuStatus')
    actions.setGlobalState({ 'menuStatus': status })
  }


  useEffect(() => {
    let bgTop = document.getElementsByClassName('bg-img-color')[0]
    document.addEventListener('scroll', handler, false);
    let top = collect ? 56 : 120
    if (!isStartScroll(top)) {
      const st = window.pageYOffset || document.documentElement.scrollTop;
      bgTop.style.top = top - st + "px"
    } else {
      bgTop.style.top = "0px"
    }
    return () => {
      document.removeEventListener('scroll', handler)
    }
  }, [collect])

  const setCard = () => {
    symbols.map((item, index) => {
      let card = document.getElementsByClassName(`${item.unit}`)[0]
      if (card) {
        let left = card.getBoundingClientRect()
        if (left.x < 120 && left.x > 0) {
          setStepNow(index + 1)
        }
      }

    })
  }

  useEffect(() => {
    if (symbols.length) {
      document.removeEventListener('scroll', setCard)
      document.addEventListener('scroll', setCard, true);
    }
    return () => {
      document.removeEventListener('scroll', setCard)
    }
  }, [symbols])

  return (
    <>
      <div className={classNames("betit", { "bg-hide": isFixed, "mobile": mobile })}>
        <div className={isFixed ? "bg-img-color hide-three" : collect ? "bg-img-color bg-collect" : "bg-img-color bg-collected"} >
        </div>
        <div className='bg-buttom'></div>
        {!mobile ? <img src={leftBg} className='left-icon' /> : null}
        {!mobile ? <img src={rightBg} className='right-icon' /> : null}
        <Header lang={lang} collect={collect} switchMenu={switchMenu}></Header>
        <div className="main-body">
          {mobile ? <PnlBar lang={lang} className='total-pnl-box mobile-total-pnl-box' /> : null}
          <CardModal>
            <TinderCard bTokens={bTokens} openSymbol={openSymbol} closeModal={closeCardModal} lang={lang} symbols={symbols} getLang={getLang} />
          </CardModal>

          <div className={classNames("card-list", { "list-mobile": mobile })}>
            {symbols && symbols.map((item, index) => {
              return (
                <Card key={index} info={item} showCardModal={showCardModal} bTokens={bTokens} lang={lang} getLang={getLang} />
              )
            })}
          </div>
          {mobile ? <div className='step-card'>
            <div className='step-strat-end'>
              <div className={`${(stepNow === 1) ? "step-box now" : "step-box"}`}></div>
              <div className={`${(stepNow !== 1 && stepNow !== (symbols.length)) ? "step-box now" : "step-box"}`} ></div>
              <div className={`${(stepNow === symbols.length) ? "step-box now" : "step-box"}`}></div>
              <div className='step-num'> {symbols ? <>
                {stepNow} / <span className='step-num-sum'>{symbols.length}</span>
              </> : null} </div>
            </div>

          </div> : null}
        </div>
      </div>
    </>
  )
}