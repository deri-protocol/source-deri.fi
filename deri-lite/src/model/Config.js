import { makeObservable, observable, action } from "mobx";
import { getContractAddressConfig, DeriEnv,sortOptionSymbols } from "../lib/web3js/index";

export default class Config {
  all = []

  constructor(){
    makeObservable(this,{
      all : observable,
      setAll : action
    })
  }

  async load(version,isOptions){
    let current = version && version.current;
    if(isOptions){
      current = 'option'
    }
    let configs = getContractAddressConfig(DeriEnv.get(),current)
    if(isOptions){
      configs = sortOptionSymbols(configs)
    }
    if(!isOptions && version){
      configs = configs.filter(c => c.version === version.current && c.symbol !== '--')
      //v2 不需要展示base token,需要合并相同的base token
      if(version.isV2){
        configs = configs.reduce((total,cur) => {
          const pos = total.findIndex(c => c.symbol === cur.symbol && c.pool === cur.pool);
          if(pos === -1 ){
            total.push(cur)
          }
          return total;
        },[])
      }
    }
    this.setAll(configs)
    return this.all;
  }

  setAll(all){
    this.all = all;
  }
  
}