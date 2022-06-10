import React,{useState,useEffect} from 'react'
import NumberFormat from 'react-number-format'
import { inject, observer } from 'mobx-react';

function DeriNumberFormat(props){
  const [renderablity, setRenderablity] = useState(<span className='loading-line'></span>);

  const isValidate = () => {
    const {allowZero} = props 
    return (typeof props.value !== 'object' && props.value !== undefined && props.value !== '' && props.value !== 'NaN') 
          || ((isNaN(props.value) && Math.abs(props.value)) === 0 && allowZero === true )
  }

  useEffect(() => {
    const {allowZero,wallet,defaultValue = '--',...others} = props 
    if(isValidate()) {
      setRenderablity(<NumberFormat {...others}  displayType = 'text'  fixedDecimalScale={true} />)
    } else {
      setRenderablity(<span className='loading-line'></span>)
    } 
    const timeout = window.setTimeout(() => {
      if(!isValidate() && wallet && !wallet.isConnected()){
        setRenderablity(defaultValue)
      }
    },30000)
    return () => {
      clearTimeout(timeout)
    };
  }, [props.value]);

  return renderablity;
}

export default inject('wallet','trading')(observer(DeriNumberFormat))