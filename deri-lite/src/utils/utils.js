

import BigNumber from 'bignumber.js'
import version from '../model/Version';
import type from '../model/Type';
import config from '../config.json'

import {
  DeriEnv,
  getPoolLiquidity,
  getPoolInfoApy,
  getUserInfoAll,
  getLiquidityInfo
} from '../lib/web3js/indexV2'
import Type from '../model/Type';
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

export function sessionStorageKey(version){
  return `${version}-current-trading-pool`
}

export function convertToInternationalCurrencySystem (labelValue) {
  
  // Nine Zeroes for Billions
  return Number.isNaN(labelValue) ? ''
  : Math.abs(Number(labelValue)) >= 1.0e+9

  ? (Math.abs(Number(labelValue)) / 1.0e+9).toFixed(2) + "B"
  // Six Zeroes for Millions 
  : Math.abs(Number(labelValue)) >= 1.0e+6

  ? (Math.abs(Number(labelValue)) / 1.0e+6).toFixed(2) + "M"
  // Three Zeroes for Thousands
  : Math.abs(Number(labelValue)) >= 1.0e+3

  ? (Math.abs(Number(labelValue)) / 1.0e+3).toFixed(2) + "K"

  : Math.abs(Number(labelValue).toFixed(2));

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

export function getFormatSymbol(symbol){
  symbol = symbol.toUpperCase();
  const curChain = restoreChain();
  const chain = curChain ? curChain.code.toUpperCase() : 'BSC'
  if(type.isOption){
    if(symbol.indexOf('-MARKPRICE') !== -1) {
      symbol = symbol.substr(0,symbol.indexOf('-MARKPRICE'))
    }
    return  `${symbol}_V2_${chain}`
  } else {
    if(version.isV1){
      return symbol
    } else {
      if(symbol.indexOf('MARKPRICE') !== -1) {
        return symbol;
      } else {
        return `${symbol}_V2_${chain}`
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
  return ids.map(id => Object.assign(chainInfo[id],{id}))
}


//
// export function formatSymbolInputParam(symbol,spec){
//   const curChain = restoreChain();
//   const chain = curChain ? curChain.code.toUpperCase() : 'BSC'
//   const baseToken = Array.isArray(spec.bTokenSymbol) ? spec.bTokenSymbol[0] : spec.bTokenSymbol
//   if(type.isFuture){
//     return {
//       indexPrice : version.isV1 ? symbol : `${symbol}_V2_${chain}`,
//       markPrice : `MARKPRICE_${symbol}_${chain}_FUTURE_${version.zone}_${baseToken}`
//     }
//   } else {
//     return {
//       indexPrice : `${symbol}_V2_${chain}`,
//       markPrice : `MARKPRICE_${symbol}_V2_${chain}`
//     }
//   }
// }

export function getMarkpriceSymbol(config){
  const curChain = restoreChain();
  const chain = curChain ? curChain.code.toUpperCase() : 'BSC'
  const baseToken = Array.isArray(config.bTokenSymbol) ? config.bTokenSymbol[0] : config.bTokenSymbol
  if(config.isOption) {
    return `${config.symbol}-MARKPRICE`
  }  else {
    return `MARKPRICE_${config.symbol}_${chain}_${Type.current.toUpperCase()}_${version.zone}_${baseToken}`
  }
}



export function equalIgnoreCase(str1,str2){
  return str1 && str1.toUpperCase() === str2 && str2.toUpperCase()
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
  // const liqPool = await getPoolLiquidity(config.chainId,config.pool,config.bTokenId) || {}
  // const apyPool = await getPoolInfoApy(config.chainId,config.pool,config.bTokenId) || {}
  const pool = config.pool || ''
  const item = { 
    network : chainInfo[config.chainId] && chainInfo[config.chainId].name,
    // liquidity : liqPool.liquidity,
    // apy :  ((+apyPool.apy) * 100).toFixed(2),
    formatAdd : formatAddress(pool),
    address : pool,
    type : 'perpetual',
    buttonText : 'STAKING',
    multiplier : 1
  }
  // if(wallet && wallet.isConnected()){
  //   const info = await getLiquidityInfo(config.chainId,config.pool,wallet.detail.account,config.bTokenId).catch(e => console.log(e));
  //   const claimInfo = await getUserInfoAll(wallet.detail.account);
  //   if(info){
  //     item['pnl'] = info.pnl
  //   }
  //   if(claimInfo){
  //     item['claimed'] = claimInfo.total;
  //     item['unclaimed'] = claimInfo.amount
  //   }
  // }

  return Object.assign(config,item)
}



