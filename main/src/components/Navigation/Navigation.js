import classNames from "classnames"
import { Icon,ChainSelector,WalletConnector } from '@deri/eco-common';
import './navigation.scss'
import { useState } from 'react';
import apps from '../../apps'

export default function Navigation({ collect, lang, isExpand, statusCallback, switchMenu,className }) {
  const [activeUrl, setActiveUrl] = useState(apps && apps.length > 0 ? apps[0].name : '')
  const [isCollapse, setIsCollapse] = useState(true)
  const clazz = classNames(`portal-header`,className ,{
    collapse: isCollapse,
    growup : !isCollapse,
    expand: isExpand
  })
  const link = (href,title) => {
    setActiveUrl(href);
    window.history.pushState({}, title, href);
  }
  const openOrClose = () => {
    const status = !isCollapse;
    setIsCollapse(status)
    statusCallback && statusCallback(status);
  }
  return (
    <div className={clazz}>
      <div className='title-link'>
        <div className="title-des">DERI.FI - PORTAL FOR ALL DERI PROJECTS</div>
        <div className='link-btn'>
          <Icon token={collect ? "portal-down" : "portal-up"} onClick={openOrClose} className='pc-arrow' />
          <Icon token='m-arrow-left' width='16' className='mobile-arrow' onClick={openOrClose} />
          {apps.map(app => (
            <a href='javascript:void(0)' className={activeUrl === app.name && 'selected'} onClick={() => link(app.name,app.name)}>
              <div className='bit-it'>{app.name}</div>
            </a>
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
        <ChainSelector collect={collect} id="portal-header-network" />
        <WalletConnector lang={lang} bgColor="#FFAB00" />
      </div>
    </div>
  )
}