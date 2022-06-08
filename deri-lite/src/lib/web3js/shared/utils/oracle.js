import { getOracleConfig } from '../config/oracle';
import { normalizeChainId } from './validate';
import { DeriEnv } from '../config/env';
import { oracleFactory, wrappedOracleFactory } from '../factory/oracle';
import { deriToNatural, fromWei } from './convert';
import {
  mapToSymbolInternal,
  mapToBTokenInternal,
  normalizeOptionSymbol,
} from '../config/token';
import { PRESERVED_SYMBOLS } from '../config/version';
import { offChainOracleFactory } from '../contract/factory';


const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export const getPriceInfoForV1 = async(symbol) => {
  const env = DeriEnv.get();
  let method = 'get_signed_price'
  let url
  let baseUrl =
    env === 'prod'
      ? `https://oraclemainnet.deri.finance/${method}`
      : `https://oracletestnet.deri.finance/${method}`;
  const addSymbolParam = (url, symbol) =>
    `${url}?symbol=${symbol}`;
  if (symbol) {
    url = addSymbolParam(baseUrl, symbol);
  } else {
    url = baseUrl;
  }
  let retry = 3;
  let res, priceInfo;
  while (retry > 0) {
    res = await fetch(url, { mode: 'cors', cache: 'no-cache' });
    if (res.ok) {
      priceInfo = await res.json();
      if (priceInfo.status.toString() === '200' && priceInfo.data) {
        return priceInfo.data
        //return deriToNatural(priceInfo.data.price).toString()
      }
    }
    retry -= 1;
  }
  if (retry === 0) {
    throw new Error(`getPriceFromV1 exceed max retry(3): ${symbol} => ${JSON.stringify(priceInfo)}`);
  }
}


export const getOracleUrl = (symbol, type='futures') => {
  const env = DeriEnv.get();
  //if (/^[0-9]+$/.test(symbolId.toString())) {
  let method = 'get_signed_price'
  if (type === 'option') {
    method = 'get_signed_volatility'
  }
  if (PRESERVED_SYMBOLS.includes(symbol)) {
    method = 'get_price'
    symbol = `${symbol}_v2_bsc`
  }
  let baseUrl =
    env === 'prod'
      ? `https://oraclemainnet.deri.finance/${method}`
      : `https://oracletestnet.deri.finance/${method}`;
  const addSymbolParam = (url, symbol) =>
    `${url}?symbol=${symbol}`;

  if (symbol) {
    return addSymbolParam(baseUrl, symbol);
  } else {
    return baseUrl;
  }
};

export const getPriceFromRest = async(symbol, type='futures') => {
  const res = await getPriceInfo(symbol, type)
  if (type === 'futures' && res.price) {
    return PRESERVED_SYMBOLS.includes(symbol) ? res.price : deriToNatural(res.price).toString()
  } else if (type === 'option' && res.volatility) {
    return deriToNatural(res.volatility).toString()
  } else {
    throw new Error(`getPrice() invalid format: ${JSON.stringify(res)}`)
  }
}

// from oracle rest api
export const getPriceInfo = async (symbol, type='futures') => {
  symbol = mapToBTokenInternal(symbol)
  let url = getOracleUrl(symbol, type);
  let retry = 3;
  let res, priceInfo;
  while (retry > 0) {
    try {
      res = await fetch(url, { mode: 'cors', cache: 'no-cache' });
      if (res.ok) {
        priceInfo = await res.json();
        if (priceInfo.status.toString() === '200' && priceInfo.data) {
          return priceInfo.data
        }
      }
    } catch(err) {
      //console.log(err.toString())
      retry -= 1;
    }
  }
  if (retry === 0) {
    throw new Error(`fetch oracle info exceed max retry(3): ${symbol} => ${JSON.stringify(priceInfo)}`);
  }
};

export const getOracleInfosFromRest = async (symbolList, type = 'future') => {
  let url = getOracleUrl(null, type);
  let retry = 3;
  let res, priceInfo;
  while (retry > 0) {
    try {
      res = await fetch(url, {
        mode: "cors",
        cache: "no-cache",
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(symbolList),
      });
      if (res.ok) {
        priceInfo = await res.json();
        if (priceInfo.status.toString() === "200" && priceInfo.data) {
          return priceInfo.data;
        }
      }
    } catch (err) {}
    retry -= 1;
  }
  if (retry === 0) {
    throw new Error(`getOracleInfosFromRest exceed max retry(3): ${symbolList}`);
  }
};

// cache
// export const getOraclePriceFromCache = (function () {
//   console.log('-- getOraclePriceFromCache will remove in next version ' )
//   let cache = {};
//   return {
//     async get(chainId, symbol = '_', version = 'v2') {
//       const key = `${chainId}_${symbol}_${version}`
//       if (
//         Object.keys(cache).includes(key) &&
//         Math.floor(Date.now() / 1000) - cache[key].timestamp < 5
//       ) {
//         return cache[key].data;
//       } else {
//         const data = await getOraclePrice(chainId, symbol, version);
//         cache[key] = {
//           data,
//           timestamp: Math.floor(Date.now() / 1000),
//         };
//         return cache[key].data;
//       }
//     },
//   };
// })();

export const getPriceInfos = async (symbolList) => {
  let url = getOracleUrl();
  let retry = 3;
  let res, priceInfo;
  while (retry > 0) {
    res = await fetch(url, {
      mode: 'cors',
      cache: 'no-cache',
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(symbolList),
    });
    if (res.ok) {
      priceInfo = await res.json();
      if (priceInfo.status.toString() === '200' && priceInfo.data) {
        return priceInfo.data
      }
    }
    retry -= 1;
  }
  if (retry === 0) {
    throw new Error(`fetch oracle infos exceed max retry(3): ${symbolList} ${JSON.stringify(priceInfo)}`);
  }
};

export const oraclePricesCache = (function(){
  const cache = {}
  const pending = {}
  return {
    async get(symbols=[]) {
      const key = symbols.join('_')
      if (
        !Object.keys(cache).includes(key) ||
        Math.floor(Date.now() / 1000) - cache[key].timestamp > 3
      ) {
        const timestamp = Math.floor(Date.now() / 1000);
        // pending is exit
        if (Object.keys(pending).includes(key)) {
          let retry = 10;
          while (retry > 0) {
            await delay(390);
            if (!Object.keys(pending).includes(key)) {
              //console.log('hit pending with cache');
              return cache[key].data;
            }
          }
          if (retry === 0) {
            //console.log('hit pending expired');
            const data = await getPriceInfos(symbols);
            cache[key] = {
              data,
              timestamp,
            };
            return cache[key].data;
          }
        } else {
          pending[key] = true;
          try {
            //console.log('hit new');
            const data = await getPriceInfos(symbols);
            cache[key] = {
              data,
              timestamp,
            };
            return cache[key].data;
          } catch (err) {
          } finally {
            delete pending[key];
          }
        }
      } else {
        //console.log('hit cache');
        return cache[key].data;
      }
    }
  }
})()

export const RestOracle = (symbol) => {
  return {
    getPrice: async function () {
      return getPriceFromRest(symbol)
    }
  }
};

export const getOraclePrice = async (chainId, symbol, version='v2') => {
  chainId = normalizeChainId(chainId);
  symbol = mapToSymbolInternal(symbol)
  const config = getOracleConfig(version, chainId, symbol);
  if (config && config.address) {
    const oracle = oracleFactory(
      chainId,
      config.address,
      symbol,
      config.decimal,
    );
    return await oracle.getPrice();
  } else {
    // for new added symbol and not updated to config yet
    const priceInfo = await getPriceInfo(symbol, version);
    return deriToNatural(priceInfo.price).toString();
  }
};

export const getOraclePrice2 = async (chainId, symbol, oracleAddress, version='v2_lite') => {
  chainId = normalizeChainId(chainId);
  symbol = mapToSymbolInternal(symbol)
  if (oracleAddress !== '') {
    const oracle = wrappedOracleFactory(chainId, oracleAddress)
    return await oracle.getPrice();
  } else {
    // for new added symbol and not updated to config yet
    const priceInfo = await getPriceInfo(symbol, version);
    return deriToNatural(priceInfo.price).toString();
  }
};

// cache
export const getOraclePriceFromCache2 = (function () {
  let cache = {};
  return {
    async get(chainId, symbol = '_', oracleAddress, version = 'v2_lite') {
      const key = `${chainId}_${symbol}_${oracleAddress}`
      if (
        Object.keys(cache).includes(key) &&
        Math.floor(Date.now() / 1000) - cache[key].timestamp < 5
      ) {
        return cache[key].data;
      } else {
        const data = await getOraclePrice2(chainId, symbol, oracleAddress, version);
        cache[key] = {
          data,
          timestamp: Math.floor(Date.now() / 1000),
        };
        return cache[key].data;
      }
    },
  };
})();

// export const getOraclePriceForOption = async (chainId, symbol) => {
//   return await getOraclePrice(chainId, normalizeOptionSymbol(symbol), 'option');
// };

// for viewer use
// export const getOraclePricesForOption = async (chainId, symbols) => {
//   const oracleSymbols = symbols
//     .map((i) => normalizeOptionSymbol(i))
//     .filter((value, index, self) => self.indexOf(value) === index);
//   const oracleSymbolPrices = await Promise.all(
//     oracleSymbols.reduce(
//       (acc, i) => acc.concat([getOraclePrice(chainId, i, 'option')]),
//       []
//     )
//   );
//   return symbols.map((s) => {
//     return toWei(oracleSymbolPrices[oracleSymbols.indexOf(normalizeOptionSymbol(s))]);
//   });
// };

// // for tx use
// export const getOracleVolatilityForOption = async (symbols) => {
//   const volSymbols = getVolatilitySymbols(symbols)
//   //volSymbols.map((s) => `VOL-${s.toUpperCase()}`)

//   const volatilities = await Promise.all(
//     volSymbols.reduce((acc, i) => acc.concat([getPriceInfo(i, 'option')]), [])
//   );
//   //return volatilities;
//   return symbols.map((s) => {
//     return volatilities[volSymbols.indexOf(`VOL-${normalizeOptionSymbol(s)}`)];
//   });
// };

// for viewer use
export const getOracleVolatilitiesForOption = async (symbols) => {
  const oracleSymbols = symbols
    .map((i) => normalizeOptionSymbol(i))
    .filter((value, index, self) => self.indexOf(value) === index);
  const res = await getOracleInfosFromRest(oracleSymbols.map((os) => `VOL-${os}`), 'option')
  const volatilities = oracleSymbols.map((s) => res[`VOL-${s}`])
  return symbols.map((s) => {
    return volatilities[oracleSymbols.indexOf(normalizeOptionSymbol(s))];
  });
};

// check symbol is used offchain oracle
export const checkOffChainOracleSymbol = async (chainId, oracleAddress, symbol) => {
  try {
    await offChainOracleFactory(chainId, oracleAddress).signer()
    return symbol
  } catch (err) {
  }
  try {
    await offChainOracleFactory(chainId, oracleAddress).signatory()
    return symbol
  } catch (err) {
  }
  return ""
};

export const getSymbolPrices = async (chainId, symbols, offChainSymbolIds, offChainSymbolNames) => {
  const onChainOracleAddressWithPlaceHolder = symbols.map((s) =>
    offChainSymbolIds.indexOf(s.symbolId) > -1
      ? ''
      : s.oracleAddress
  );

  const onChainSymbolPrices = await Promise.all(
    onChainOracleAddressWithPlaceHolder
      .reduce((acc, address, index) => {
        const _symbol = symbols.map((s) => s.symbol)[index];
        if (address !== '') {
          return acc.concat(
            getOraclePriceFromCache2.get(chainId, _symbol, address)
          );
        } else {
          return acc.concat('');
        }
      }, [])
      .filter((f) => f !== '')
  );

  const res =  await oraclePricesCache.get(offChainSymbolNames)
  const offChainSymbolPrices = offChainSymbolNames.map((s) => fromWei(res[s].price))

  // combine offChain and onChain symbol prices
  const symbolPrices = onChainOracleAddressWithPlaceHolder.map((o) => {
    if (o !== '') {
      return onChainSymbolPrices.shift();
    } else {
      return offChainSymbolPrices.shift();
    }
  });
  return symbolPrices
};