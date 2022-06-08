import { getSpecification, DeriEnv } from "../lib/web3js/indexV2";
import { makeObservable, observable, action, computed } from "mobx";
import Intl from "./Intl";
import version from "./Version";
import type from "./Type";
import { getDefaultNw } from "../utils/utils";

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
  // constructor(){
  //   makeObservable(this,{
  //     info : observable,
  //     setInfo : action,
  //     bTokenSymbolDisplay : computed
  //   })
  // }

  async load(wallet,config){
    if(config){
      const chainId = wallet && wallet.isConnected() ? wallet.detail.chainId : getDefaultNw(DeriEnv.get()).id
      const spec = await getSpecification(chainId,config.pool,config.symbolId);
      spec.bTokenSymbol = this.bTokenSymbolDisplay(spec)
      if(type.isOption){
        spec.underlier = this.getUnderlierStrike(spec).underlier
        spec.strike = this.getUnderlierStrike(spec).strike
        spec.optionType = this.getUnderlierStrike(spec).optionType
      }
      this.setInfo(spec)
    }
    return this.info
  }

  setInfo(info){
    this.info = info
  }

  getUnderlierStrike(spec){
    let underlier = spec.symbol.split('-')[0]
    let strike = spec.symbol.split('-')[1]
    let optionType = spec.symbol.split('-')[2]
    return {
      underlier:underlier,
      strike:strike,
      optionType:optionType
    }
  }

  bTokenSymbolDisplay(spec){
    if(version.isV1 || version.isV2Lite || type.isOption || version.isOpen || (version.isV2 && !Array.isArray(spec.bTokenSymbol))){
      return [spec.bTokenSymbol];
    }
    return spec.bTokenSymbol;
  }
}