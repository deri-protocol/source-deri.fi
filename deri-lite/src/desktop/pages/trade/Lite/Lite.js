import LiteTrade from '../../../../components/Trade/LiteTrade';
import AreaPicker from '../../../../components/AreaPicker/AreaPicker';
import Tab from '../Tab/Tab';
import './lite.less'
import version from '../../../../model/Version'
import { useLocation } from 'react-router-dom/cjs/react-router-dom.min'

export default function Lite({lang}){
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