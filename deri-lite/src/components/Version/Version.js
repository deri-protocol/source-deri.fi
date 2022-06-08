import React , {useState,useEffect}from 'react'
import { inject } from 'mobx-react';
import { observer } from 'mobx-react-lite';
import { useRouteMatch } from 'react-router-dom';
import { addParam, hasParam, getParam } from '../../utils/utils';
import './version.less'

function Version({wallet,version}){
  const isLite = useRouteMatch('/futures/lite')
  const isPro = useRouteMatch('/futures/pro')
  const [enabled, setEnabled] = useState(false)


  const switchVersion = () => {
    version.switch();
    // const url = addParam('version',version.current);
    // window.location.href = url;
  }


  useEffect(() => {
    if(wallet.supportAllVersion){
      if(hasParam('version')) {
        version.setCurrent(getParam('version'))
      } else {
        version.setCurrent('v2')
      };
    } else {
      if(wallet.supportV1 && !wallet.supportV2){
        version.setCurrent('v1')
      } else if(wallet.supportV2 && !wallet.supportV1){
        version.setCurrent('v2')
      } else {
        version.setCurrent('v1')
      } 
    }
    return () => {}
  }, [wallet.detail.chainId])

  //处理是否显示版本切换功能
  useEffect(() => {
    let isShow = isLite || isPro
    if(wallet.detail){
      isShow = wallet.supportAllVersion && isShow
    }
    setEnabled(isShow)
    return () => {}
  }, [version.current,wallet.detail.chainId,window.location.href])

  return (
    enabled ? 
      (<div className='version'>
        <div onClick={switchVersion} className={`version-container ${version.current}`}>
          <span className='current-v1'>V1</span>
          <span className='current-v2'>V2</span>
        </div>
      </div>)
    :
      null
    )
}
export default inject('wallet','version')(observer(Version))