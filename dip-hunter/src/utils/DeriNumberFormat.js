import React, { useState, useEffect, useRef } from 'react'
import ReactDOM from 'react-dom'
import NumberFormat from 'react-number-format'
import { inject, observer } from 'mobx-react';
import styled from 'styled-components';
import { toPlainString, countDecimal} from './utils';
import { BigNumber as bg} from 'bignumber.js';
const Wrapper = styled(NumberFormat)`
  width : ${props => props.width}px;
`
const LoadLine = styled.div`
  width : ${props => /px$/.test(props.width) ? props.width : `${props.width}px`};
  height : ${props => /px$/.test(props.height) ? props.height : `${props.height}px`};
`
function DeriNumberFormat(props) {
  const [renderablity, setRenderablity] = useState(<span className='loading-line'></span>);
  const [firstTime, setFirstTime] = useState(true)
  const isValidate = () => {
    const { allowZero } = props
    return (typeof props.value !== 'object' && props.value !== undefined && props.value !== '' && !isNaN(props.value) && props.value !== 'NaN')
      || ((Math.abs(props.value)) === 0 && allowZero === true)
  }
  const renderText = value => value && value.replace(/\.$/, '')

  useEffect(() => {
    const { allowZero, wallet, closeShowLoadingEffectAfterLoaded, defaultValue = '--', ...others } = props

    if (isValidate()) {
      //如果精度截取之后为0，则动态获取精度，取到不为0为止
      if (others.decimalScale > 0 && others.value && /\d+\.0*[1-9]+/.test(others.value) && (+bg(others.value).toFixed((+others.decimalScale || 2))) === 0) {
        others.decimalScale = countDecimal(Math.abs(others.value)) + 2
      }

      if (others.decimalScale === -1 || ((+others.value) === 0 && allowZero)) {
        delete others.decimalScale
      }

      others.value = toPlainString(others.value)
      if (others.value && /\d+.9{6}/.test(others.value)) {
        others.value = (+others.value).toFixed(5)
      }
      setRenderablity(<Wrapper {...others} renderText={renderText}
        displayType='text' fixedDecimalScale={true} thousandSeparator={true} />)
    } else if (firstTime) {
      const { width, height } = props
      setRenderablity(<LoadLine className='loading-line' width={width} height={height}></LoadLine>)
      if (closeShowLoadingEffectAfterLoaded) {
        setFirstTime(false)
      }
    }
    const timeout = window.setTimeout(() => {
      // && wallet && (!wallet.isConnected() || !wallet.supportChain)
      if (!isValidate()) {
        setRenderablity(defaultValue)
      }
    }, 60000)
    return () => {
      clearTimeout(timeout)
    };
  }, [props.value, props.decimalScale, props.suffix]);

  return renderablity;
}
export default DeriNumberFormat
// export default inject('wallet')(observer(DeriNumberFormat))