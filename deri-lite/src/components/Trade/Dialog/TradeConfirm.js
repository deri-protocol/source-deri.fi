import React, { useState, useEffect } from 'react'
import Button from "../../Button/Button";
import NumberFormat from 'react-number-format';
import DeriNumberFormat from '../../../utils/DeriNumberFormat';
import { tradeWithMargin } from "../../../lib/web3js/index";
import type from '../../../model/Type'
import version from '../../../model/Version'
import { bg, DeriEnv } from '../../../lib/web3js/index'

export default function TradeConfirm({ wallet, spec, onClose, direction, volume, position = 0, indexPrice, leverage, afterLeverage, transFee, afterTrade, lang, markPriceAfter, trading, liquidationPrice }) {
  const [pending, setPending] = useState(false);

  const trade = async () => {
    setPending(true)
    const res = await trading.doTransaction();
    if (res.success) {
      afterTrade()
      onClose()
    } else {
     alert("Failed")
    }
    setPending(false)
  }

  const close = () => {
    if (!pending) {
      onClose()
    }
  }

  const afterTradePosition = direction === 'long' ? bg(volume).plus(bg(position)).toString() : bg(position).minus(bg(volume)).toString()

  return (
    <div className='modal-dialog'>
      <div className='modal-content'>
        <div className='modal-header'>
          <div className='title'>{lang['confirm']}</div>
          <div className='close' data-dismiss='modal' onClick={close}>
            <span>&times;</span>
          </div>
        </div>
        <div className='modal-body'>
          <div className='contract-box-info'>
            <div className='top'>
              <div className='text'>
                <div className='text-title'>{lang['of-contracts']}</div>
                <div className='text-num'>{<DeriNumberFormat value={trading.volumeChanged.totalVolume} thousandSeparator={true} allowZero={true} />} {trading.symbolInfo.unit}</div>
              </div>
              <div className='text'>
                <div className='text-title'>Trade Price (est.)</div>
                <div className='text-num'><DeriNumberFormat value={trading.impactPreview.tradePrice} thousandSeparator={true} allowZero={true} /> </div>
              </div>
              <div className='text'>
                <div className='text-title'>{lang['direction']}</div>
                <div className='text-num'><span className={direction}>{lang[direction.toLowerCase()]}</span></div>
              </div>
              
              <div className='text'>
                <div className='text-title'>{lang['transaction-fee']}</div>
                <div className='text-num'>
                  <NumberFormat value={trading.impactPreview.fee} decimalScale={2} suffix={` ${spec.bTokenSymbol}`} displayType='text' />
                </div>
              </div>
              <div className='text'>
                <div className='text-title'>Margin Usage</div>
                <div className='text-num'>
                  <NumberFormat value={trading.impactPreview.marginUsage} decimalScale={2} suffix={` ${spec.bTokenSymbol}`} displayType='text' />
                </div>
              </div>
              <div className='text'>
                <div className='text-title'>Available Margin</div>
                <div className='text-num'>
                  <NumberFormat value={trading.impactPreview.availableMargin} decimalScale={2} suffix={` ${spec.bTokenSymbol}`} displayType='text' />
                </div>
              </div>
              {type.isFuture && <div className='text'>
                <div className='text-title'>{lang['liquidation-price']}</div>
                <div className='text-num'>
                  <NumberFormat value={trading.impactPreview.liqPrice} decimalScale={2} displayType='text' />
                </div>
              </div>}
            </div>
            <div className='modal-footer'>
              <div className='long-btn' v-if='confirm'>
                <button className='cancel' onClick={close}>{lang['cancel']}</button>
                <Button className='confirm' btnText={lang['ok']} click={trade} lang={lang} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}