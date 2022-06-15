import React, { useState, useEffect } from 'react'
import { isBrowser, isMobile, deviceDetect } from 'react-device-detect'
import LoadableComponent from './utils/LoadableComponent';
import { inject, observer } from 'mobx-react';
import { useWallet } from 'use-wallet'
import LoadingMask from './components/Loading/LoadingMask';
const DesktopApp = LoadableComponent(() => import('./desktop/index'))
const MobileApp = LoadableComponent(() => import('./mobile/index'))
const getIsDesktop = () => window.screen.width > 1024;
function Mask({ loading }) {
  const [isOpen, setIsOpen] = useState(false)
  useEffect(() => {
    setIsOpen(loading.isShowMask)
    return () => {
    }
  }, [loading.isShowMask])
  return <LoadingMask modalIsOpen={isOpen} overlay={{ background: 'none', top: '80px' }} />
}

const MaskWrapper = inject('loading')(observer(Mask))

function App({ intl, loading, actions }) {
  const wallet = useWallet()
  useEffect(() => {
    actions && actions.onGlobalStateChange((state) => {
      if (state.wallet.isConnected()) {
        wallet.connect()
      }
    })
  }, [])
  if (isBrowser) {
    return <><MaskWrapper /><DesktopApp locale={intl.locale} actions={actions}></DesktopApp></>
  } else {
    return <><MaskWrapper /><MobileApp locale={intl.locale} actions={actions}><Mask loading={loading} /></MobileApp></>
  }
}

export default inject('intl', 'loading')(observer(App));
