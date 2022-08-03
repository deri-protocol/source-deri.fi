import { useEffect, useRef, useState, useCallback } from 'react';
import { useWallet } from "use-wallet";
import merge from 'deepmerge'
import { eqInNumber, getEnv, getMarkpriceSymbol, importAll } from '../utils/utils';

const poolConfig = importAll(require.context('../config/base/', true, /pool.*.json/));
const poolExtConfig = importAll(require.context('../config/', true, /symbol.*.json/));

const env = getEnv();

const symbolMerge = (target, source, clonedPool) => {
  return target.map(item => {
    const sourceSymbol = source.find(s => s.symbol === item.symbol);
    if (sourceSymbol) {
      if (item.powerSymbol && sourceSymbol.powerSymbol) {
        sourceSymbol.powerSymbol = Object.assign({}, item.powerSymbol, sourceSymbol.powerSymbol, mixin(sourceSymbol.powerSymbol, clonedPool))
      }
      return Object.assign(item, mixin(item, clonedPool), sourceSymbol)
    }
    return item;
  })
}

//minin some useful method
const mixin = (symbolInfo, clonedPool) => {
  const mixed = {
    markpriceSymbol: getMarkpriceSymbol(Object.assign(clonedPool, symbolInfo))
  }
  return mixed;
}

const arrayMerge = (target, source) => {
  return target.map(item => {
    const sourceConfig = source.find(s => s.chainId === item.chainId && s.name === item.name)
    if (sourceConfig) {
      return merge(item, sourceConfig, {
        customMerge: key => {
          if (key === 'symbols') {
            const clonedPool = Object.assign({}, item, sourceConfig)
            delete clonedPool.bTokens
            delete clonedPool.symbols;
            return (target, source) => symbolMerge(target, source, clonedPool)
          }
        }
      })
    }
    return item;
  })
}

const configs = merge(poolConfig[env], poolExtConfig[env], { arrayMerge: arrayMerge })

export default function usePool() {
  const wallet = useWallet();
  const [symbols, setSymbols] = useState([])
  const [bTokens, setBTokens] = useState([])

  const setValues = useCallback((filters) => {
    if (filters.length > 0) {
      const symbols = filters.reduce((total, item) => total.concat(item.symbols), [])
        .sort((s1, s2) => s1.order > s2.order ? 1 : s1.order < s2.order ? -1 : 0)
      const bTokens = filters[0].bTokens
      setSymbols(symbols)
      setBTokens(bTokens);
    }
  }, [])

  useEffect(() => {
    //如果链接不上或者链接错误的网络，用默认
    let filters = []
    if (wallet.isConnected()) {
      filters = configs.filter(c => eqInNumber(c.chainId, wallet.chainId));
      if (filters && filters.length > 0) {
        setValues(filters)
      }
    } else if (wallet.status === 'error' || wallet.status === 'disconnected') {
      filters = configs.filter(c => c.default);
      setValues(filters)
    }
  }, [wallet]);
  // config.bTokens;
  return [bTokens, symbols];
}