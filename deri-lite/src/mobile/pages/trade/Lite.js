
import LiteTrade from "../../../components/Trade/LiteTrade";
import './lite.less'
import AreaPicker from "../../../components/AreaPicker/AreaPicker";
import { useRouteMatch } from 'react-router-dom';
import type from '../../../model/Type';
import version from '../../../model/Version'
import { useLocation } from 'react-router-dom/cjs/react-router-dom.min'

function Lite({lang}){
  return (
    <div className='trade-container'>
      <AreaPicker lang={lang} />
      <div className='trade-body'>
        <LiteTrade lang={lang} />  
      </div>
    </div>    
  )
  
}

export default Lite