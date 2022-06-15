import React, { useState, useEffect } from 'react'
import {isBrowser,isMobile,deviceDetect} from 'react-device-detect'
import LoadableComponent from './utils/LoadableComponent';
import { inject, observer } from 'mobx-react';
import {useWallet} from 'use-wallet'
import LoadingMask from './components/Loading/LoadingMask';
import { useRouteMatch } from 'react-router-dom';
import type from './model/Type'
const DesktopApp = LoadableComponent(() => import('./desktop/index'))
const MobileApp = LoadableComponent(() => import('./mobile/index'))
const getIsDesktop = () => window.screen.width > 1024;
function Mask({loading}){
  const [isOpen, setIsOpen] = useState(false)
  useEffect(() => {
    setIsOpen(loading.isShowMask)
    return () => {
    }
  }, [loading.isShowMask])
  return <LoadingMask modalIsOpen={isOpen} overlay={{background : 'none',top : '80px'}}/>
}

const MaskWrapper = inject('loading')(observer(Mask))

function App({intl,loading,actions}) {
  // const [isDesktop, setIsDesktop] = useState(getIsDesktop())
  // const isOptionsLite = useRouteMatch('/options/lite') ? true : false
  // const isOptionsPro = useRouteMatch('/options/pro') ? true : false
  // const isOption = isOptionsLite || isOptionsPro
  // const catagory = isOption ? 'option' : 'future'
  // type.setCurrent(catagory)

  // useEffect(() => {
  //   const onResize = () => {
  //     if(getIsDesktop() !== isDesktop){
  //       window.location.reload()
  //     }
  //   }
  //   window.addEventListener("resize", onResize);
  //   return () => window.removeEventListener("resize", onResize)
  // },[]);

  const wallet = useWallet()
  useEffect(()=>{
    wallet.connect()
  },[])
  if(isBrowser){
    return <><MaskWrapper/><DesktopApp locale={intl.locale} actions={actions}></DesktopApp></>
  } else {
    return <><MaskWrapper/><MobileApp locale={intl.locale} actions={actions}><Mask loading={loading}/></MobileApp></>
  }
}

export default inject('intl','loading')(observer(App)) ;
