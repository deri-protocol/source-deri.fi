

import BigNumber from 'bignumber.js'
import version from '../model/Version';
import type from '../model/Type';
import config from '../config.json'
import Cookies from 'js-cookie'

import {
  DeriEnv,
  getPoolLiquidity,
  getPoolInfoApy,
  getUserInfoAll,
  getLiquidityInfo
} from '../lib/web3js/index'
import Type from '../model/Type';
import { COOKIE_DERI_DOMAIN, FUTURE, FUTURES, OPTION, POWER, SKIP_TRADE_CONFIRMATION, VERSION_V3, VERSION_V3_LITE } from './Constants';
const versionKey = 'deri-current-version'


const env = DeriEnv.get();
const { chainInfo } = config[env]

export function bg(value, base = 0) {
  if (base === 0) {
    return BigNumber(value);
  } else if (base > 0) {
    return BigNumber(value).times(BigNumber("1" + "0".repeat(base)));
  } else {
    return BigNumber(value).div(BigNumber("1" + "0".repeat(-base)));
  }
}


export function deriNatural(value) {
  return bg(value, -18);
}

export function firstLetterUppercase(str){
  return str && str.replace(/^\S/, s => s.toUpperCase());
}

export function formatAddress(address){
  return address && `${address.substr(0,6)}...${address.substr(-4)}`
}

export function formatBalance(balance){
  return balance && (+balance).toFixed(4)
}

export function eqInNumber(str1,str2){
  return (+str1) === (+str2)
}

export function isLP(address){
  return address === '0xc2EdaD668740f1aA35E4D8f227fB8E17dcA888Cd' || address === '0x73feaa1eE314F8c655E354234017bE2193C9E24E'
}
export function isSushiLP(address){
  return address === '0xc2EdaD668740f1aA35E4D8f227fB8E17dcA888Cd'
}
export function isCakeLP(address){
  return address === '0x73feaa1eE314F8c655E354234017bE2193C9E24E'
}
export function isEpochMining(address){
  return address === '0xc2EdaD668740f1aA35E4D8f227fB8E17dcA888Cd' || address === '0x73feaa1eE314F8c655E354234017bE2193C9E24E' || address === '0x26bE73Bdf8C113F3630e4B766cfE6F0670Aa09cF' 
}
export function isV3(address){
  return address === '0x4ad5cb09171275a4f4fbcf348837c63a91ffab04' || address === '0x243681b8cd79e3823ff574e07b2378b8ab292c1e' || address === '0xd2d950e338478ef7feb092f840920b3482fcac40' || "0xDE3447Eb47EcDf9B5F90E7A6960a14663916CeE8"
}
export function sessionStorageKey(version){
  return `${version}-current-trading-pool`
}

export function convertToInternationalCurrencySystem (labelValue,decimalScale) {
  
  // Nine Zeroes for Billions
  return Number.isNaN(labelValue) ? ''
  : Math.abs(Number(labelValue)) >= 1.0e+9

  ? (Math.abs(Number(labelValue)) / 1.0e+9).toFixed(decimalScale) + "B"
  // Six Zeroes for Millions 
  : Math.abs(Number(labelValue)) >= 1.0e+6

  ? (Math.abs(Number(labelValue)) / 1.0e+6).toFixed(decimalScale) + "M"
  // Three Zeroes for Thousands
  : Math.abs(Number(labelValue)) >= 1.0e+3

  ? (Math.abs(Number(labelValue)) / 1.0e+3).toFixed(decimalScale) + "K"

  : Math.abs(Number(labelValue).toFixed(decimalScale));

}


// export function storeVersion(version){
//   sessionStorage.setItem(versionKey,version)
// }

// export function restoreVersion(){
//   return sessionStorage.getItem(versionKey)
// }

export function storeConfig(version,config){
  if(config){
    const key = sessionStorageKey(version);
    sessionStorage.setItem(key,JSON.stringify(config))
  }
}

export function getConfigFromStore(version){
  return JSON.parse(sessionStorage.getItem(sessionStorageKey(version)))
}

export function storeChain(chainInfo){
  sessionStorage.setItem('current-chain',JSON.stringify(chainInfo))
}
export function restoreChain(){
  return JSON.parse(sessionStorage.getItem('current-chain')) || {code : ''};
}

export function storeLocale(locale){
  sessionStorage.setItem('current-locale',locale)
}

export function restoreLocale(){
  return sessionStorage.getItem('current-locale')
}

export function addParam(param,value,urlString = window.location.href){
  const url = new URL(urlString);
  if(url.searchParams.has(param)){
    url.searchParams.set(param,value);
  } else {
    url.searchParams.append(param,value);
  }
  return  url.toString();
}

export function hasParam(param,urlString = window.location.href){
  const url = new URL(urlString);
  return url.searchParams.has(param);
}

export function getParam(param,urlString = window.location.href){
  const url = new URL(urlString);
  return url.searchParams.get(param);
}

export function getFormatSymbol(symbol,symbolInfo){
  symbol = symbol.toUpperCase();
  const chain = symbolInfo.chain
  const version = symbolInfo.isAllV3 ? 'V3' : 'V2'
  if(type.isOption){
    if(symbol.indexOf('-MARKPRICE') !== -1) {
      symbol = symbol.substr(0,symbol.indexOf('-MARKPRICE')).toUpperCase()
      return  `${symbol}_${version}_${chain}`.toUpperCase()
    } else if(symbol.indexOf('MARKPRICE_') !== -1) {
      return symbol
    } else {
      return  `${symbol}_${version}_${chain}`.toUpperCase()
    }
  } else {
    if(version.isV1){
      return symbol
    } else {
      if(symbol.indexOf('MARKPRICE') !== -1) {
        return symbol;
      } else {
        symbol = symbol.replace(/\^2/,'');
        if(symbol.indexOf('USD') === -1) {
          return `${symbol}USD_${version}_${chain}`.toUpperCase()
        } else {
          return `${symbol}_${version}_${chain}`.toUpperCase()
        }
      }
    }
  }
}

export function getDefaultNw(env){
  return getNetworkList(env).find(network => network.isDefault) || {}
}

export function getNetworkList(env){
  const chainInfo = config[env]['chainInfo']
  const ids = Object.keys(chainInfo);
  return ids.map(id => Object.assign(chainInfo[id],{id})).sort((c1,c2) => c1.order > c2.order ? 1 : c1.order < c2.order ? -1 : 0);
}


export function getMarkpriceSymbol(pool){
  if(pool.category === OPTION) {
    if(pool.version === VERSION_V3 ) {
      if(DeriEnv.get() === 'dev') {
        if(/ARBI/i.test(pool.chain)){
          return `MARKPRICE_${pool.symbol}_V3_${pool.chain}_${pool.name}_devnet_${pool.bTokenSymbol}`.toUpperCase()
        } else {
          return `MARKPRICE_${pool.symbol}_V3_${pool.chain}_${Type.current}_devnet_${pool.zone}_${pool.bTokenSymbol}`.toUpperCase()
        }
      } else {
        if(/ARBI/i.test(pool.chain)){
          return `MARKPRICE_${pool.symbol}_V3_${pool.chain}_${pool.name}_${pool.bTokenSymbol}`.toUpperCase()
        } 
      } 
      return `MARKPRICE_${pool.symbol}_V3_${pool.chain}_${Type.current}_${pool.bTokenSymbol}`.toUpperCase()
    } else {
      return `${pool.symbol}-MARKPRICE`
    }
  }  else if(pool.category === FUTURES){
    if(pool.version === VERSION_V3 || pool.version === VERSION_V3_LITE){
      if(DeriEnv.get() === 'dev') {
        if(/ARBI/i.test(pool.chain)) {
          return `MARKPRICE_${pool.symbol}_V3_${pool.chain}_${pool.name}_${DeriEnv.get()}net_${pool.bTokenSymbol}`.toUpperCase() 
        }
        return `MARKPRICE_${pool.symbol}_V3_${pool.chain}_${Type.current}_${DeriEnv.get()}net_${pool.zone}_${pool.bTokenSymbol}`.toUpperCase() 
      } else {
        if(/ARBI/i.test(pool.chain)){
          return `MARKPRICE_${pool.symbol}_V3_${pool.chain}_${pool.name}_${pool.bTokenSymbol}`.toUpperCase()
        }
      } 
      return `MARKPRICE_${pool.symbol}_V3_${pool.chain}_${pool.name}_${pool.bTokenSymbol}`.toUpperCase()
    }  else {
      return `MARKPRICE_${pool.symbol}_${pool.chain}_${Type.current}_${pool.zone}_${pool.bTokenSymbol}`.toUpperCase()
    }
  } else if(pool.category === POWER) {
     if(DeriEnv.get() === 'dev'){
       if(/ARBI/i.test(pool.chain)) {
        return `MARKPRICE_${pool.displaySymbol}_V3_${pool.chain}_${pool.name}_${DeriEnv.get()}net_${pool.bTokenSymbol}`.toUpperCase()
       } else {
        return `MARKPRICE_${pool.displaySymbol}_V3_${pool.chain}_${pool.category}_${DeriEnv.get()}net_${pool.zone}_${pool.bTokenSymbol}`.toUpperCase()
       }
     } else {
      if(/ARBI/i.test(pool.chain)){
        return `MARKPRICE_${pool.displaySymbol}_V3_${pool.chain}_${pool.name}_${pool.bTokenSymbol}`.toUpperCase()
      } 
    } 
    return `MARKPRICE_${pool.displaySymbol}_V3_${pool.chain}_${pool.category}_${pool.zone}_${pool.bTokenSymbol}`.toUpperCase()
  }
}

// export function getMarkpriceSymbol(pool){
//   const version = pool.isV2 ? 'v2' : 'v3'
//   const prefix = `MARKPRICE_${pool.displaySymbol}_${version}_${pool.chain}_${pool.name}`;
//   let middle = `${pool.zone}`;
//   let suffix = `${pool.bTokenSymbol}`;
//   // let symbol = `${prefix}-${middle}-${suffix}`
//   //兼容option的v2
//   if(pool.isV2 ) {
//     if(pool.category === OPTION) {
//       return `${pool.symbol}-MARKPRICE`.toUpperCase();
//     } else if(pool.category === FUTURES){
//       //MARKPRICE_AXSUSDT_BSC_FUTURE_INNO_DERI
//       return `${prefix}_${middle}_${suffix}`.toUpperCase()
//     }
//   }

//   //MARKPRICE_BTCUSD_V3_BSC_FUTURE_MAIN_BUSD v3 future
//   //MARKPRICE_BTCUSD-40000-C_V3_BSC_OPTION_BUSD v3 option
//   //MARKPRICE_MBTC^2_V3_BSC_POWER_INNO_BUSD v3 power


//   if(pool.category === OPTION){
//     middle = `${pool.category}`
//   }

//   if(DeriEnv.get() === 'dev') {
//     middle = `${DeriEnv.get()}`
//   }

//   if(/ARBI/i.test(pool.chain)) {

//   }
  

//   if(pool.category === OPTION) {
//       if(DeriEnv.get() === 'dev') {
//         if(/ARBI/i.test(pool.chain)){
//           return `${prefix}_${pool.category}_${DeriEnv.get()}net_${pool.bTokenSymbol}`.toUpperCase()
//         } 
//       } 
//       symbol = `${prefix}_${pool.category}_${pool.bTokenSymbol}`;
//   }  else if(pool.category === FUTURES){
//     if(DeriEnv.get() === 'dev') {
//       if(/ARBI/i.test(pool.chain)) {
//         return `${prefix}_${pool.category}_${DeriEnv.get()}net_${pool.bTokenSymbol}`.toUpperCase() 
//       }
//       return `${prefix}_${pool.category}_${DeriEnv.get()}net_${pool.zone}_${pool.bTokenSymbol}`.toUpperCase() 
//     } else {
//       if(/ARBI/i.test(pool.chain)){
//         return `${prefix}_${pool.category}_${pool.bTokenSymbol}`.toUpperCase()
//       }
//     } 
//     symbol = `${prefix}_${pool.category}_${pool.zone}_${pool.bTokenSymbol}`
//   } else if(pool.category === POWER) {
//      if(DeriEnv.get() === 'dev'){
//        if(/ARBI/i.test(pool.chain)) {
//         return `${prefix}_${pool.category}_${DeriEnv.get()}net_${pool.bTokenSymbol}`.toUpperCase()
//        } else {
//         return `${prefix}_${pool.category}_${DeriEnv.get()}net_${pool.zone}_${pool.bTokenSymbol}`.toUpperCase()
//        }
//      } else {
//       if(/ARBI/i.test(pool.chain)){
//         return `${prefix}_${pool.category}_${pool.bTokenSymbol}`.toUpperCase()
//       } 
//     } 
//     symbol = `${prefix}_${pool.category}_${pool.zone}_${pool.bTokenSymbol}`
//   }
//   return `${prefix}-${suffix}`.toUpperCase()
// }



export function equalIgnoreCase(str1,str2){
  return  str1 === str2 || str1.toUpperCase() === str2.toUpperCase()
}

export function stripSymbol(symbol){
  if(!symbol){
    return symbol;
  }
  if(/-/.test(symbol)){
    symbol = symbol.split('-')[0]
  }
  return symbol
}


export const  secondsInRange = {
  '1' : 60,
  '5' : 300,
  '15' : 900,
  '30' : 1800,
  '60' : 3600,
  '1D' : 3600 * 24,
  '1W' : 3600 * 24 * 7
}
export const intervalRange = {
  '1' : 'min',
  '5' : '5min',
  '15' : '15min',
  '30' : '30min',
  '60' : 'hour',
  '1D' : 'day',
  '1W' : 'week'
}

 
export function calcRange(interval){
  const timestamp = new Date().getTime() /1000 ;
  let from,to;
  if(interval !== '1W') {
    to = Math.floor(timestamp / secondsInRange[interval] ) * secondsInRange[interval]
    from  = to - secondsInRange[interval] * 200
  } else {
    to = Math.floor((timestamp - 345600) /secondsInRange[interval]) * secondsInRange[interval] + 345600
    from = to - secondsInRange[interval] * 200
  }
  return [from,to]
 
}

export function groupByNetwork(pools){
  const all = []
  pools.reduce((total, pool) => {
    const find = total.find(item => eqInNumber(item['pool']['address'], pool['address']))
    if (find && find.list.length < 5) {
      find['list'].push(pool)
    } else {
      const poolInfo = {
        pool: {
          network: pool.network,
          symbol: pool.symbol,
          address: pool.address,
          formatAdd: pool.formatAdd,
          version: pool.version,
          // innoDisplay : pool.version=== 'v2_lite' ? Intl.get('mining','v2_lite') : pool.version,
          chainId: pool.chainId,
          airdrop: pool.airdrop,
          type: pool.type,
          bTokenSymbol: pool.bTokenSymbol,
          bTokenId: pool.bTokenId,
          symbolId: pool.symbolId
        },
        list: [pool]
      }
      total.push(poolInfo)
    }
    return total;
  }, all)
  return all;
}

export function combineSymbolfromPoolConfig(configs){
  return configs.reduce((total,config) => {
    const pos = total.findIndex(item => item.chainId === config.chainId && (item.pool === config.pool) && config.version === item.version)
    if((config.version === 'v2' || config.version === 'v2_lite' || config.version === 'option' || config.version === 'v2_lite_open' || config.version === 'v2_lite_dpmm')  
        && pos > -1) {
      if(total[pos].symbol.indexOf(config.symbol) === -1){
        total[pos].symbol += `,${config.symbol}` 
      } else if(total.findIndex(item => item.bTokenSymbol === config.bTokenSymbol) === -1) {
        total.push(config)
      }
    } else{
      total.push(config)
    }
    return total;
  },[]);
}

export async function mapPoolInfo(config,wallet,chainInfo){
  const pool = config.pool || ''
  const item = { 
    network : chainInfo[config.chainId] && chainInfo[config.chainId].name,
    formatAdd : formatAddress(pool),
    address : pool,
    type : 'perpetual',
    buttonText : 'STAKING',
    multiplier : 1
  }

  return Object.assign(config,item)

}

export function greaterThan(param1,param2){
  return (+param1) > (+param2)
}

export function percentTimesAmount(percent,value){
  let v = value
  if(/\d+\.(999999|099999|009999|000999|000099|000009)/.test(value)){
    v  = (+value).toFixed(5)
  }
  if(percent){
    const unPercent = percent.slice(0,-1) / 100 
    return bg(v).times(unPercent).toString();
  } else {
    return 0
  }
}

export function precision(a) {
  a = +a
  if (!isFinite(a)) return 0;
  var e = 1, p = 0;
  while (Math.round(a * e) / e !== a) { e *= 10; p++; }
  return p;
}

export function countDecimal(n){
  return -Math.floor( Math.log10(n) + 1);
}
//反科学计数法
export function toPlainString(num) {
  return (''+ +num).replace(/(-?)(\d*)\.?(\d*)e([+-]\d+)/,
    function(a,b,c,d,e) {
      return e < 0
        ? b + '0.' + Array(1-e-c.length).join(0) + c + d
        : b + c + d + Array(e-d.length+1).join(0);
    });
}

//ios don't suppport
// export function numberWithCommas(x) {
//   return  x && x.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
// }

export function isMobile(){
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

export function  isIE(){
  return /*@cc_on!@*/false || !!document.documentMode;
} 

export function isEdge(){
  return !isIE && !!window.StyleMedia;
}

export function storeSkipConfirmation(skipConfirmation){
  if(skipConfirmation){
    sessionStorage.setItem(SKIP_TRADE_CONFIRMATION,'1')
  } else {
    sessionStorage.setItem(SKIP_TRADE_CONFIRMATION,'0')
  }
}

export function isElementInViewport (el) {
  var rect = el ? el.getBoundingClientRect() : {}
  return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && /* or $(window).height() */
      rect.right <= (window.innerWidth || document.documentElement.clientWidth) /* or $(window).width() */
  );
}

export function isScrollBottom(offset = 0){
  return (window.innerHeight + window.scrollY) >= document.body.offsetHeight - offset
}

export function  dataFormater (number) {
  if(number > 1000000000){
    return (number/1000000000).toString() + 'B';
  }else if(number > 1000000){
    return (number/1000000).toString() + 'M';
  }else if(number > 1000){
    return (number/1000).toString() + 'K';
  }else{
    return number.toString();
  }
}

export function isSingleDomain(){
  return !process.env.NODE_ENV || process.env.NODE_ENV === 'development' || process.env.REACT_APP_SINGLE_DOMAIN === 'on'
}

export function camelize(str) {
  return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function(word, index) {
    return index === 0 ? word.toUpperCase() : word.toLowerCase();
  }).replace(/\s+/g, '');
}

export function formatNumber(number,decimal){
  let effectiveDecimal = decimal
  let value = number;
  if(/\d+\.0*[1-9]+/.test(value)  && (+bg(value).toFixed((decimal || 2))) === 0){
    effectiveDecimal = countDecimal(Math.abs(value)) + 2
  }
  value = bg(value).toFixed(effectiveDecimal)
}
export function setCookie(name,value,expires = 365 ,domain = COOKIE_DERI_DOMAIN,path = '/'){
  if(name && value){
    Cookies.set(name,value,{expires : expires,domain : domain,path : path})
  }
}

export function getCookie(name){
  return Cookies.get(name)
}
export function removeCookie(name,domain = COOKIE_DERI_DOMAIN, path = '/'){
  Cookies.remove(name,{domain,path})
}

export function numberWithCommas(x) {
  if(x){
    var parts =  x.toString().split(".");
    return parts[0].replace(/\B(?=(\d{3})+(?=$))/g, ",") + (parts[1] ? "." + parts[1] : "")
  }
  return x;
}