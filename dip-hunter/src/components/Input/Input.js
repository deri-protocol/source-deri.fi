import { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { BigNumber as bg } from 'bignumber.js'
// import { bg } from '../../lib/web3js';
// import UnderlineText from '../UnderlineText/UnderlineText';

const Wrapper = styled.div`
display : flex;
font-size : 14px;
align-items : center;
background: rgba(85, 119, 253, 0.1);
border-radius: 4px;
justify-content: space-between;
input {
  background: transparent;
  border-radius: 4px;
  // min-width: 240px;
  border: 0;
  width : ${props => props.inputWidth};
  height: ${props => props.inputHeight};
  color : #E0ECFF;
  font-size : 18px;
  padding-left: 16px;
}
input:focus {
  outline: none;
}
.unit {
  margin-right: ${props => props.unitPadding};
}
`
export default function Input({value,unit,unitTip,max,step,onChange,styles = {},disableNegtive = true ,focus,placeholder='',unitPadding = '24px',minTradeVolume,decimal = 2,readOnly,inputWidth = '50%',inputHeight='56px',className,disabled = false,onBlur,onFocus}){
  const inputRef = useRef(null);
  const change = e => {
    const regStr = `\\d+\\.\\d{0,${decimal}}$`
    const reg = new RegExp(regStr)
    const { value } = e.target
    if(max && bg(value).gt(max)){    
      onChange && onChange(max)
    } else if(disableNegtive && (value < 0 || isNaN(value))) {
      onChange && onChange('')
    } else if(value){
      if(minTradeVolume >= 1) {
        if(value / minTradeVolume >=1) {
          onChange && onChange(bg(value).div(minTradeVolume).integerValue() * minTradeVolume) 
        } else {
          const validValue = value * minTradeVolume
          onChange && onChange(validValue) 
        }
      } else if(/\d+\./.test(value) && !reg.test(value)){
        const filter = value.substring(0,value.indexOf('.') + 1 + decimal)
        onChange && onChange(filter)
      } else {
        onChange && onChange(value)
      }
    } else {
      onChange && onChange(value)
    }
  }

  useEffect(()=>{
    inputRef.current.setCustomValidity('')
    if(inputRef.current && focus){
      inputRef.current.focus();
    }
  },[focus])


  return (
    <Wrapper  unitPadding={unitPadding} inputWidth={inputWidth} inputHeight={inputHeight} className={className} style={{...styles}}>
      <input placeholder={placeholder} type='number'  onBlur={onBlur} onFocus={onFocus} disabled = {disabled} value={value} step = {step} ref={inputRef} onChange={change} readOnly={readOnly}/>
      {/* <div className='unit'>{unitTip ? <UnderlineText tip={unitTip} text={unit}/> : unit}</div> */}
    </Wrapper>    
  )
}