import React, { useState,useEffect } from 'react'
import RcSlider,{SliderTooltip} from 'rc-slider'
import 'rc-slider/assets/index.css';
import './slider.less'
import classNames from 'classnames';
import { bg } from '../../lib/web3js/indexV2';
const { Handle } = RcSlider;


 function handle(props){
  const { value, dragging, index, ...restProps } = props;
  return (
    <SliderTooltip
      prefixCls="rc-slider-tooltip"
      overlay={!!value ? value : ''}
      placement="top"
      key={index}
      visible={!!value ? true : false}
      overlayStyle={{display : 'block'}}
      overlayInnerStyle={{color : '#569BDA',background : 'none',display : 'block' ,fontSize : '10px',boxShadow : 'none'}}
    >
      <Handle value={value} {...restProps} />
    </SliderTooltip>
  );
};


const initDefaultMarks = (max) => {
  const mark = {}
  const per = (+max) / 10
  for(let i = 0 ; i<=10 ; i++){
    if(i === 0 || i ===10 ){
      const style = {top: '-16px',position: 'relative'}
      if(i ===10){
        style.width = 100;
        style.left = '-10px'
        style.paddingRight = '10px'            
      }
      mark[i*per] = <><div style={style}>{i === 10 ? (i*per).toFixed(2) : i * per}</div><div style={{top: '-16px',position: 'relative'}}>l</div></>
    } else{
      mark[i*per] = 'l'
    }    
  }
  return mark;
}

export default function Slider({max = '--' ,start,onValueChange,freeze,currentSymbolMarginHeld,originMarginHeld,setStopCalculate}){
  const [limit, setLimit] = useState(0);
  const [value, setValue] = useState(0);
  const [disabled, setDisabled] = useState(false);
  const [marks, setMarks] = useState({});
  const [loaded, setLoaded] = useState(false);
  const [sliding,setSliding] = useState(false)


  const onSliderChange = newValue => {
    setSliding(true)
    setStopCalculate(true)
    setValue(newValue)
    onValueChange(newValue,false);
  }

  const onAfterChange = value=> {
    //v2 才有值
    if(currentSymbolMarginHeld){
      const rest = bg(originMarginHeld).minus(currentSymbolMarginHeld);    
      if(bg(value).lt(rest)) {
        setValue(rest)
        onValueChange(rest);
      }
    }
    setSliding(false)
    setStopCalculate(false)
  }


  useEffect(() => {
    setDisabled(freeze)
    if(Math.abs(max) === 0){
      setDisabled(true)
    }
    return () => { };
  }, [freeze,max]);


  useEffect(() => {
    const origin = max
    if(Math.abs(max) === 0 || max === '--') {
      max = 100;
    }
    if(isNaN(origin)){
      setLimit('')
    }
    max && setMarks(initDefaultMarks(max));    
    setLimit(+max)
    if(origin !== '--'){
      setLoaded(true)
    } 
    if(Math.abs(max) === 0 || Math.abs(origin) === 0){
      setLoaded(false)
    }
    return () => {};
  }, [max]);

  useEffect(() => {
    if(!sliding) {
      if(isNaN(start)){
        setValue(0)
      } else {
        setValue(start)
      }
    }
    return () => {      
    };
  }, [start]);


  const clazz =classNames('deri-slider',{controlled : loaded})

  return (
      <RcSlider
        handle={handle}
        className={clazz} 
        start={start}
        min={0}
        max={limit}
        value={value}
        onChange={onSliderChange}
        onAfterChange={onAfterChange}
        disabled={disabled}
        overlay={value}
        step={0.01}
        marks={marks}
       >
      </RcSlider>
  )
}