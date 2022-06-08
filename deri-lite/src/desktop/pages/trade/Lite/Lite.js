import LiteTrade from '../../../../components/Trade/LiteTrade';
import AreaPicker from '../../../../components/AreaPicker/AreaPicker';
import Tab from '../Tab/Tab';
import './lite.less'
import version from '../../../../model/Version'
import { useLocation } from 'react-router-dom/cjs/react-router-dom.min'

export default function Lite({lang}){
  const location = useLocation();
  const isV1Router = location.pathname.split('/')[3]
  if(isV1Router === 'v1'){
    version.setCurrent('v1')
  }else {
    if(version.isV1){
      version.setCurrent('v2')
    }
  }
  return (
    <div className='trade-container'>
      <AreaPicker lang={lang} ></AreaPicker> 
      <div className='trade-body lite'>
        <Tab lite={true} lang={lang} />
        <LiteTrade lang={lang} /> 
      </div>
    </div>
  )
}