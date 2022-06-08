import React, { useState, useEffect } from 'react'
import NumberFormat from 'react-number-format'
import { inject, observer } from 'mobx-react';
import TipWrapper from '../TipWrapper/TipWrapper';
import version from '../../model/Version';
import {DeriEnv} from '../../lib/web3js/indexV2'

function ContractInfo({ wallet, trading, lang, type }) {

  const toNonExponential = (num)=>{
    num = +(num.toFixed(11))
    var m = num.toExponential().match(/\d(?:\.(\d*))?e([+-]\d+)/);
    return m[0];
  }

  return (
    <div className="contract-box">
      <div className='contract-header'></div>
      <div className="contract-info">
        <div className="conntract-header">{lang['contract-info']}</div>
        <div className="info">
          <div className="title">{lang['base-token']}</div>
            <div className="text" >
              {trading.contract.bTokenSymbol && trading.contract.bTokenSymbol.map((bToken,index) => {
                return ( (version.isV2 && type.isFuture )
                  ? <TipWrapper key={index}><span className='btoken-symbol'>{bToken}(<span className='multiplier' tip={lang['multiplier-tip']}>{trading.contract.bTokenMultiplier && trading.contract.bTokenMultiplier[index]}x</span>)</span></TipWrapper>
                  : <span key={index} className='btoken-symbol'>{bToken}</span>)  
              })}
            </div>
        </div>
        <div className="info">
          <div className="title">
            {type.isOption && lang['symbol-option']}
            {type.isFuture && lang['symbol']} 
          </div>
          <div className="text">
            {trading.contract.symbol}
          </div>
        </div>

        {type.isFuture && <>
          <div className="info">
            <div className="title"> <span>{lang['min-trade-volume']} ( {lang['notional']} )</span> </div>
            <div className="text">
              {trading.contract.multiplier} {trading.config ? trading.config.unit : ''}
            </div>
          </div>
          { (version.isOpen || version.isV1) && 
          <div className="info">
            <div className="title">{lang['funding-rate-coefficient']}</div>
            <div className="text">
              {trading.contract.fundingRateCoefficient}
            </div>
          </div>
          }
          {!version.isOpen && 
            <div className="info">
            <div className="title">{lang['funding-rate-coefficient']}</div>
            <div className="text">
              <TipWrapper block={false} >
                <span tip={trading.fundingCoefficientTip} className='margin-per'>{trading.contract.fundingRateCoefficient ? toNonExponential(+trading.contract.fundingRateCoefficient) :'' }</span> 
              </TipWrapper>
            </div>
          </div>
          }
          <div className="info">
            <div className="title">{lang['min-initial-margin-ratio']}</div>
            <div className="text">
              <NumberFormat displayType='text' value={trading.contract.minInitialMarginRatio * 100} decimalScale={2} suffix='%' />
            </div>
          </div>
          <div className="info">
            <div className="title">{lang['min-maintenance-margin-ratio']}</div>
            <div className="text">
              <NumberFormat displayType='text' value={trading.contract.minMaintenanceMarginRatio * 100} decimalScale={2} suffix='%' />
            </div>
          </div>
        </>}
        {type.isOption && <>
          <div className="info">
            <div className="title">{lang['underlier']}</div>
            <div className="text">
              {trading.contract.underlier}
            </div>
          </div>
          <div className="info">
            <div className="title">{lang['strike']}</div>
            <div className="text">
              {trading.contract.strike}
            </div>
          </div>
          <div className="info">
            <div className="title">{lang['option-type']}</div>
            <div className="text">
              {trading.contract.optionType === 'C' ? `${lang['call']}` : `${lang['put']}`}
            </div>
          </div>
          <div className="info">
            <div className="title"> <span>{lang['min-trade-volume']} ( {lang['notional']} )</span> </div>
            <div className="text">
              {trading.contract.multiplier} {trading.config ? trading.config.unit : ''}
            </div>
          </div>
          <div className="info">
            <div className="title"><TipWrapper block={false}><span tip={trading.initialMarginRatioTip} className='margin-per'>{lang['initial-margin-ratio']}</span></TipWrapper></div>
            <div className="text">
              <NumberFormat displayType='text' value={trading.contract.initialMarginRatio * 100} decimalScale={2} suffix='%' />
            </div>
          </div>
          <div className="info">
            <div className="title"> <TipWrapper block={false}><span tip={trading.maintenanceMarginRatioTip} className='margin-per'> {lang['maintenance-margin-ratio']}</span></TipWrapper> </div>
            <div className="text">
              <NumberFormat displayType='text' value={trading.contract.maintenanceMarginRatio * 100} decimalScale={2} suffix='%' />
            </div>
          </div>
        </>}
        <div className="info">
          {type.isFuture && <>
            <div className="title">{lang['transaction-fee']}</div>
          </>}
          {type.isOption && <>
            <div className="title">
              <TipWrapper block={false}>
                <span className="margin-per" tip={trading.TransactionFeeTip}>{lang['transaction-fee']}</span>  
              </TipWrapper>
            </div>
          </>}
          <div className="text">
            {type.isOption && <>
              {trading.contract.optionType === 'C' && <>
                {trading.contract.strike >= trading.index && <>
                  {lang['eo-mark-price']} * <NumberFormat displayType='text' value={trading.contract.feeRatioOTM * 100} decimalScale={3} suffix='%' />
                </>}
                {trading.contract.strike < trading.index && <>
                  {trading.contract.underlier} {lang['price']} * <NumberFormat displayType='text' value={trading.contract.feeRatioITM * 100} decimalScale={3} suffix='%' />
                </>}
              </>}

              {trading.contract.optionType !== 'C' && <>
                {trading.contract.strike < trading.index && <>
                  {lang['eo-mark-price']} * <NumberFormat displayType='text' value={trading.contract.feeRatioOTM * 100} decimalScale={3} suffix='%' />
                </>}
                {trading.contract.strike >= trading.index && <>
                  {trading.contract.underlier} {lang['price']} * <NumberFormat displayType='text' value={trading.contract.feeRatioITM * 100} decimalScale={3} suffix='%' />
                </>}
              </>}


            </>}
            {type.isFuture && <>
              <NumberFormat displayType='text' value={trading.contract.feeRatio * 100} decimalScale={3} suffix='%' />
            </>}
          </div>
        </div>
        {trading.contract.indexConstituents && trading.contract.indexConstituents.tokens.length > 0 && <div className="info">
          <div className="title">{lang['index-constituent']}</div>
          <div className="text">
            {trading.contract.indexConstituents.tokens.join(' | ')}
          </div>
        </div>}
      </div>
    </div>
  )
}

export default inject('wallet', 'trading', 'type')(observer(ContractInfo))