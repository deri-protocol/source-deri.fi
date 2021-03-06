import { getSpecification, DeriEnv, bg } from "../lib/web3js/index";
import { makeObservable, observable, action, computed, makeAutoObservable } from "mobx";
import version from "./Version";
import type from "./Type";
import { getDefaultNw } from "../utils/utils";
import ApiProxy from "./ApiProxy";
import { SHORT_NAME_MAP } from "../utils/Constants";

export default class Contract {
  info = {
    bTokenSymbol:["BUSD"],
    symbol:'BTCUSD',
    multiplier:'0.0001',
    fundingRateCoefficient:'0.0000025',
    deltaFundingCoefficient:'0.2',
    minInitialMarginRatio:0.1,
    initialMarginRatio:0.1,
    minMaintenanceMarginRatio:0.05,
    maintenanceMarginRatio:0.05,
    feeRatio:0.0005,
    underlier :'',
    strike:0,
    optionType:'C',
    bTokenSymbolDisplay : ['BUSD']
  }
  

  async load(wallet,symbolInfo){
    if(symbolInfo){
      const chainId = wallet && wallet.isConnected() &&  wallet.supportCurNetwork ? wallet.detail.chainId : getDefaultNw(DeriEnv.get()).id
      const symbolParam = symbolInfo.isAllV3 ? symbolInfo.symbol : symbolInfo.symbolId
      const spec = await ApiProxy.request('getSpecification',[chainId,symbolInfo.address,symbolParam]);
      spec.bTokenSymbol = this.bTokenSymbolDisplay(spec)
      spec.minTradeUnit = symbolInfo.isPower && symbolInfo.formattedUnit ? bg(spec.multiplier).div(SHORT_NAME_MAP[symbolInfo.formattedUnit]).toNumber() : spec.multiplier
      spec.displayMultiplier = symbolInfo.isPower && symbolInfo.formattedUnit ? SHORT_NAME_MAP[symbolInfo.formattedUnit] : spec.multiplier
      spec.displaySymbol = symbolInfo.displaySymbol || spec.symbol
      // spec.multiplier = symbolInfo.isPower && symbolInfo.displaySymbolMultiplier ? bg(spec.multiplier).times(symbolInfo.displaySymbolMultiplier).toNumber() : spec.multiplier
      if(type.isOption && spec && spec.symbol){
        Object.assign(spec,this.extractBySymbol(spec))
      }
      // spec.initialMarginRatio = '0.1'
      this.setInfo(spec)
    }
    return this.info
  }

  setInfo(info){
    this.info = info
  }

  extractBySymbol(spec){
    const symboleInArray = spec.symbol.split('-')
    const underlier = symboleInArray[0]
    const strike = symboleInArray[1]
    const optionType = symboleInArray[2]
    return {
      underlier,
      strike,
      optionType : optionType === 'C' ? 'Call' : 'Put'
    }
  }

  bTokenSymbolDisplay(spec){
    if(!Array.isArray(spec.bTokenSymbol)){
      return [spec.bTokenSymbol];
    }
    return spec.bTokenSymbol;
  }

}