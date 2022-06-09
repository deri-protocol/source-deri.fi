import { processResult, toWei } from "../../../shared/utils/index.js";

export const range = (n) => [...Array(n).keys()];

export const addMethods = (klass, fns = []) => {
  if (fns.length > 0) {
    for (let i = 0; i < fns.length; i++) {
      klass = fns[i](klass);
    }
    return klass;
  } else {
    return klass;
  }
};
export const overrideMethods = (klass, fns = []) => {
  if (fns.length > 0) {
    for (let i = 0; i < fns.length; i++) {
      const fn = fns[i][0]
      const args = fns[i].slice(1)
      klass = fn(klass)(...args);
    }
    return klass;
  } else {
    return klass;
  }
};
export const processMethod = (klass) => (methodName, propList = []) => {
  const originMethod = klass.prototype[methodName];
  klass.prototype[methodName] = async function (...args) {
    const res = await originMethod.apply(this, args);
    return processResult(res, propList);
  };
  return klass;
};

export const processTxMethod = (klass) => (methodName, toWeiArgPositions = []) => {
  const originMethod = klass.prototype[methodName];
  klass.prototype[methodName] = async function (...args) {
    //const prices = await this._getSymbolPrices()
    let newArgs = args.map((arg, index) =>
      toWeiArgPositions.indexOf(index.toString()) !== -1 ? toWei(arg) : arg
    );
    //newArgs.push(prices)
    return await originMethod.apply(this, newArgs);
  };
  return klass;
};

export const classAdapter = (klass, fnName, fn) => {
  klass.prototype[fnName] = fn;
  return klass;
};

// config for bToken sort
// BUSD, BNB, BTCB, ETH, USDT, USDC, CAKE, XVS, ADA, XRP, DOT, MATIC, LINK, LTC, DAI, TRX, TUSD, SXP
const defaultOrder = 1000
export const getBTokenOrder = (chainId, bTokenSymbol) => {
  const configs = [
    {
      chainIds: ['56', '97'],
      orders: [
        'BUSD',
        'BNB',
        'BTCB',
        'ETH',
        'USDT',
        'USDC',
        'CAKE',
        'XVS',
        'UST',
        'LUNA',
        'ADA',
        'XRP',
        'DOT',
        'MATIC',
        'LINK',
        'DOGE',
        'LTC',
        'DAI',
        'TRX',
        'TUSD',
        'SXP',
        'AAVE',
      ]
    }, {
      chainIds: ['42161', '421611'],
      orders: [
        'USDC',
        'ETH',
        'WBTC',
        'USDT',
        'DAI',
        'AAVE',
        'LINK',
      ]
    }
  ]
  const config = configs.find((c) => c.chainIds.includes(chainId))
  if (config) {
    const index = config.orders.indexOf(bTokenSymbol)
    if (index > -1) {
      return index + 1
    }
  }
  // return a max value if bTokenSymbol is not in the configList
  // console.log(`Cannot find bToken order for ${bTokenSymbol}`);
  return defaultOrder;
};
