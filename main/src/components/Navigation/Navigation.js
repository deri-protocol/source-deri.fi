import classNames from "classnames"
import { Icon,ChainSelector,WalletConnector } from '@deri/eco-common';
import './navigation.scss'
import { useState ,useCallback,useEffect} from 'react';
import apps from '../../apps'

export default function Navigation({ collect, lang, statusCallback, switchMenu,className ,actions}) {
  const [activeUrl, setActiveUrl] = useState(window.location.hash ? window.location.hash : apps.length > 0 && apps[0].activeRule)
  const [isCollapse, setIsCollapse] = useState(true)
  const [isExpand, setIsExpand] = useState(false)
  const clazz = classNames(`portal-header`,className ,{
    collapse: isCollapse,
    growup : !isCollapse,
    expand: isExpand,
    shrink : !isExpand
  })

  const menuStateChange = (value,prev) => {
    setIsExpand(value.menuStatus)
  }

  const link = (href,title) => {
    setIsExpand(false)
    setActiveUrl(href);
    window.history.pushState({}, title, href);
    actions.setGlobalState({menuStatus : false});
  }

  const openOrClose = () => {
    const status = !isCollapse;
    setIsCollapse(status)
  }

  const closeMenu = () => {
    actions.setGlobalState({menuStatus : false});
  }

  useEffect(() => {
    actions && actions.onGlobalStateChange(menuStateChange)
    return () => {
      actions && actions.offGlobalStateChange()
    };
  }, [actions]);
  return (
    <div className={clazz}>
      <div className='title-link'>
        <div className="title-des"><Icon token='logo' width='32'/>DERI.FI - PORTAL FOR ALL DERI PROJECTS</div>
        <div className='link-btn'>
          <Icon token={isCollapse ? "portal-down" : "portal-up"} onClick={openOrClose} className='pc-arrow' />
          <Icon token='m-arrow-left' width='16' className='mobile-arrow' onClick={closeMenu} />
          {apps.map(app => (
            <span  key={app.name} className={classNames('sub-app',{ 'selected' : activeUrl === app.activeRule}) } onClick={() => link(app.activeRule,app.name)}>
              <div className='app-item'>{app.displayName || app.name}</div>
            </span>
          ))}
          
          <a target="_blank" href="https://deri.io/">
            <div className='deri-io'>DERI.IO</div>
          </a>
          <a target="_blank" href="https://forms.gle/mtTqFW54KNM1wJ2f7">
            <Icon token="add-link" className="add-link" />
          </a>
        </div>
      </div>
      <div className='down-up'>
        <ChainSelector collect={collect} id="portal-header-network" actions={actions}/>
        <WalletConnector lang={lang} bgColor="#FFAB00" actions={actions} />
      </div>
    </div>
  )
}