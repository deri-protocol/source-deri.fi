import { observable, action, computed, makeObservable } from "mobx";
import { OPTION, CALL_OPTION, PUT_OPTION, VERSION_V3, VERSION_V3_LITE, FUTURES, FUTURE } from '../utils/Constants'
// import { isCakeLP, isSushiLP, getMarkpriceSymbol } from '../utils/utils'
import {POWER} from '../utils/Constants'
import { bg } from '../lib/web3js/index'
import { sortOptionSymbols } from "../lib/web3js/index";

const columnMap = {
  pool: 'address'
}
export default class Pool {
  name  = ''
  chainId = ''
  chain = ''
  zone = ''
  address = ''
  version = ''
  type = '' 
  isLp = ''
  bTokenSymbol = ''
  retired = ''
  rewarded=''
  new=''
  symbols = []
  bTokens = []
  decimals = 2
  markpriceSymbolFormat = ''
  currentSymbol = null

  constructor(data) {
    makeObservable(this, {
      chainId: observable,
      chain: observable,
      zone: observable,
      address: observable,
      retired: observable,
      symbols: observable,
      bTokens: observable,
      bTokenSymbol: observable,
      isLp: observable,
      decimals: observable,
      markpriceSymbolFormat: observable,
      currentSymbol: observable,
      setCurrentSymbol: action,
      setMarkpriceSymbolFormat: action,
      setAddress: action,
      setChain: action,
      setChainId: action,
      setZone: action,
      setVersion: action,
      setType: action,
      setSymbols: action,
      setBTokens: action,
      setDecimals: action,
      selectedSymbol: computed,
      isFuture: computed,
      isOption: computed,
      isInno: computed,
      isV3: computed,
      isV3Lite: computed,
      isAllV3: computed,
      isPower: computed
    })
    this.init(data)
  }

  init(data = {}) {
    const keys = Object.keys(data);
    for (const k in keys) {
      const name = columnMap[keys[k]] ? columnMap[keys[k]] : keys[k];
      if (this.hasOwnProperty(name) && data[keys[k]]) {
        const attr = name.replace(/^\S/, s => s.toUpperCase())
        const method = `set${attr}`
        if (this[method]) {
          this[method].call(this, data[keys[k]])
        } else {
          this[name] = data[keys[k]]
        }
      }
    }
  }

  setChainId(chainId) {
    this.chainId = chainId;
  }

  setChain(chain) {
    this.chain = chain
  }

  setZone(zone) {
    this.zone = zone;
  }

  setAddress(address) {
    this.address = address;
  }

  setType(type) {
    this.type = type
  }

  setBTokenSymbol(bTokenSymbol){
    this.bTokenSymbol = bTokenSymbol;
  }

  setSymbols(symbols) {
    symbols = symbols.map(s => {
      const tokenInfo = this.bTokens.length > 0 ? this.bTokens[0] : {}
      s.name = this.name;
      s.type = this.type
      s.address = this.address
      s.version = this.version
      s.bTokenSymbol = tokenInfo.bTokenSymbol
      s.chain = this.chain
      s.chainId = this.chainId
      if(/bsctestnet/.test(this.chain)) {
        s.chain = 'bsc'
      } else if(/arbitrum/.test(this.chain)) {
        s.chain = 'arbi'
      }
      s.zone = this.zone
      s.optionType = ''
      s.isPower = s.category === POWER
      s.isFuture = s.category === FUTURES
      s.isOption = s.category === OPTION
      s.isAllV3 = s.version === VERSION_V3 || s.version === VERSION_V3_LITE
      s.getVolume24Changed =  this.getVolume24Changed
      // s.symbol = s.displaySymbol || s.symbol
      s.displaySymbol = s.displaySymbol || s.symbol,
      this.isV2 && this.setBTokenSymbol(tokenInfo.bTokenSymbol)
      s.formatedSymbol = (this.isOpen || this.isV2) && s.isFuture ? `${s.symbol}/${tokenInfo.bTokenSymbol}` : s.displaySymbol || s.symbol
      // s.unit = s.displayUnit ? s.displayUnit :  s.unit
      if(s.isPower){
        s.symbolWithoutPower = s.symbol.replace('^2','')
      }
      if (s.type.includes(OPTION)) {
        s.optionType = /c$/i.test(s.symbol) ? CALL_OPTION : PUT_OPTION
        const symbol = s.symbol.split('-')[0]
        s.underlier = symbol
        // s.zone = symbol
      }
      s.displayCategory = /s$/.test(s.category) ? s.category.toUpperCase() : `${s.category}s`.toUpperCase()
      // if (!this.isOpen) {
      //   s.markpriceSymbolFormat = getMarkpriceSymbol(s)
      // }
      s.getDecimalBySymbol = symbol => {
        const _symbol = symbols.find(s => s.symbol === symbol)
        return _symbol && +(_symbol.decimals || 2)
      }
      return s;
    })
    if (this.type.includes(OPTION)) {
      this.symbols = sortOptionSymbols(symbols)
    } else {
      this.symbols = symbols.sort((s1,s2) => {
        if(s1.rank > s2.rank){
          return 1
        } else if(s1.rank < s2.rank){
          return -1
        } else {
          return 0;
        }
      });
    }
  }


  setCurrentSymbol(symbol) {
    this.currentSymbol = symbol
  }


  setMarkpriceSymbolFormat(markpriceSymbolFormat) {
    this.markpriceSymbolFormat = markpriceSymbolFormat
  }

  setDecimals(decimals) {
    this.decimals = decimals
  }


  setVersion(version) {
    this.version = version
  }

  setBTokens(bTokens) {
    this.bTokens = bTokens;
  }

  setName(name){
    this.name = name;
  }

  get selectedSymbol() {
    if (this.currentSymbol) {
      return this.currentSymbol
    } else {
      return this.symbols.length > 0 ? this.symbols[0] : {}
    }
  }

  get isFuture() {
    return this.type.includes(FUTURE);
  }

  get isOption() {
    return this.type.includes(OPTION)
  }

  get isInno() {
    return this.version ===  this.version === VERSION_V3_LITE
  }


  get isPower(){
    return this.category === POWER
  }

  get isV3() {
    return this.version === VERSION_V3
  }


  get isV3Lite() {
    return this.version === VERSION_V3_LITE
  }

  get isAllV3() {
    return this.isV3 || this.isV3Lite
  }


}