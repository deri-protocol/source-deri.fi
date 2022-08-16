import { useState, useEffect, useRef } from 'react'
import { Icon } from '@deri/eco-common';
import DeriNumberFormat from '../../utils/DeriNumberFormat';
import './input.scss'
export default function Input({ value, lang, onChange, inputDisabled, setBalance, balance, focus, bToken, bTokens, setBToken, onBlur, onFocus, disabled, readOnly, placeholder }) {
  const inputRef = useRef(null);
  const [isShowToken, setIsShowToken] = useState(false)
  const change = e => {
    const { value } = e.target
    if (value < 0 || isNaN(value)) {
      onChange("")
    } else {
      onChange(value)
    }
  }

  const blur = e => {
    const { value } = e.target
    if(value.indexOf(".") === 0){
      let text = "0" + value
      onChange(text)
    }
  }
  useEffect(() => {
    inputRef.current.setCustomValidity('')
    if (inputRef.current && focus) {
      inputRef.current.focus();
    }
  }, [focus])
  return (
    <div className='input-box-info'>
      <div className='balance-bet'>
        <div className='bet'>
          {lang['bet'].toUpperCase()}
        </div>
        <div className="balance">
          {lang['balance']}:<DeriNumberFormat value={balance} displayType='text' decimalScale={2} />
        </div>
      </div>
      <div className='input-token'>
        <input placeholder={placeholder} disabled={inputDisabled} type='number' onBlur={blur} onFocus={onFocus} disabled={disabled} value={value} ref={inputRef} onChange={change} readOnly={readOnly} />
        <div className='baseToken' onClick={() => { setIsShowToken(!isShowToken) }}>
          <Icon token={bToken} width="22" height="22" />  {bToken} <Icon token="select-token" />
        </div>
        {isShowToken && <div className='token-list'>
          <div className='select-title'>
            {lang['select-coin']}
          </div>
          <div className='token-info'>
            {bTokens && bTokens.map((item, index) => {
              return (
                <div key={index}>
                  <Icon token={item.bTokenSymbol} width={23} height={23} onClick={() => { setBToken(item.bTokenSymbol); setBalance(''); setIsShowToken(!isShowToken) }} />
                  {bToken === item.bTokenSymbol && <div className='check-bToken'></div>}
                </div>
              )
            })}
          </div>
        </div>}
      </div>
    </div>
  )
}