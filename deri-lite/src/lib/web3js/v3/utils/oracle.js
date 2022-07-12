import { stringToId } from "./misc.js";
import { oracleManagerFactory } from "../contract/factory/rest.js";
import { debug } from "../../shared/config/constant.js";
import { normalizeOptionSymbol } from "./config.js";
import { isPowerSymbol, normalizePowerSymbolForOracle } from "./power.js";
import { isArbiChain, isBSCChain, isOptionSymbol, onChainSymbols, onChainSymbolsArbi } from "../config.js";
import { asyncCache } from "./cache.js";

export const PRESERVED_SYMBOLS = ["BTCUSD", "ETHUSD", "BNBUSD", "NULSUSDT", "ONTUSD"];

const addSymbolParam = (url, symbol) => `${url}?symbol=${symbol}`;

export const getOracleServerUrl = (symbol) => {
  //if (/^[0-9]+$/.test(symbolId.toString())) {
  let method = "get_symbol_data"
  let baseUrl = `https://api.oraclum.io/${method}`

  if (symbol) {
    return addSymbolParam(baseUrl, symbol);
  } else {
    return baseUrl;
  }
};

const delayMs = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export const getOracleInfoFromRest = asyncCache(async (symbol) => {
  let url = getOracleServerUrl(symbol);
  let retry = 2;
  debug() && console.log('symbol oracle url: ', url)
  let res, priceInfo;
  while (retry > 0) {
    try {
      res = await fetch(url, {
        mode: "cors",
        cache: "no-cache",
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });
      if (res.ok) {
        priceInfo = await res.json();
        if (priceInfo.status.toString() === "200" && priceInfo.data) {
          return priceInfo.data;
        }
      }
      // delay
      await delayMs(100)
    } catch (err) {
      debug() && console.log(err)
    }
    retry -= 1;
  }
  if (retry === 0) {
    throw new Error(
      `getPriceInfoFromRest exceed max retry(3): ${symbol}`
    );
  }
}, 'getOracleInfoFromRest', undefined, 3)

const _getOracleInfoFromRest  = async (symbolList) => {
  let url = getOracleServerUrl();
  let retry = 2;
  let res=[], symbolInfos;
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
        symbolInfos= await res.json();
        if (symbolInfos.status.toString() === "200" && symbolInfos.data) {
          const values = Object.values(symbolInfos.data);
          res = symbolList.reduce((acc, s) => {
            const info = values.find((p) => p.symbolName === s)
            if (info) {
              acc.push([
                stringToId(s),
                info.timestamp,
                info.value,
                parseInt(info.v).toString(),
                info.r,
                info.s,
              ]);
            } else {
              acc.push(undefined)
            }
            return acc
          }, [])
          return res
        }
      }
    } catch (err) {
      console.log(err)
    }
    retry -= 1;
  }
  if (retry === 0) {
    throw new Error(`REST_API_CALL_TIMEOUT: ${url}`);
  }
}


export const getOracleInfosFromRest = asyncCache(_getOracleInfoFromRest, 'getOracleInfosFromRest', [], 3)
export const getOracleInfosFromRestForLens = asyncCache(_getOracleInfoFromRest, 'getOracleInfosFromRest', [], 10)

export const getSymbolPrice = async (chainId, oracleManagerAddress, symbol, version) => {
  if (oracleManagerAddress !== '') {
  const id = symbol.length === 66 ? symbol : stringToId(symbol)
  const oracleManager = oracleManagerFactory(chainId, oracleManagerAddress);
  return await oracleManager.getValue(id);
  } else {
    const priceInfo = await getOracleInfoFromRest(symbol);
    return priceInfo.value
  }
};

// need to add cache later
export const getSignedValues = async (symbols = []) => {
  let values = [];
  if (symbols.length > 0) {
    const valueInfos = await Promise.all(
      symbols.reduce((acc, s) => [
        ...acc,
        getOracleInfoFromRest(s),
      ], [])
    );
    values = Object.values(valueInfos).reduce((acc, p, index) => {
      if (p.value) {
        acc.push([
          stringToId(symbols[index]),
          p.timestamp,
          p.value,
          parseInt(p.v).toString(),
          p.r,
          p.s,
        ]);
      } else {
        acc.push(undefined)
      }
      return acc;
    }, []);
  }
  return values;
}

const normalizeOracleSymbol = (symbol) => {
  if (isPowerSymbol(symbol)) {
    return `VOL-${normalizePowerSymbolForOracle(symbol)}`
  } else if (isOptionSymbol(symbol)) {
    return `VOL-${normalizeOptionSymbol(symbol)}`
  }
  return symbol
}

const normalizePriceSymbol = (symbol) => {
  if (isPowerSymbol(symbol)) {
    return normalizePowerSymbolForOracle(symbol)
  } else if (isOptionSymbol(symbol)) {
    return normalizeOptionSymbol(symbol)
  }
  return symbol
}

export const getSymbolsOracleInfo = async (chainId, symbols) => {
  // const res = await getSignedPrices(this.chainId, this.symbolNames)
  if (isBSCChain(chainId)) {
    symbols = symbols.filter((s) => !onChainSymbols.includes(s))
  } else if (isArbiChain(chainId)) {
    symbols = symbols.filter((s) => !onChainSymbolsArbi.includes(s))
  }
  // return await getSignedValues(symbols.map((s) => normalizeOracleSymbol(s)))
  const res = await getOracleInfosFromRest([...new Set(symbols.map((s) => normalizeOracleSymbol(s)))])
  return res.filter((s) => s !== undefined)
  // return res.filter((s) => s !== undefined).reduce((acc, s) => { // for onchain oracle return undefined
  //   if (!acc.find((symbol) => symbol[0] === s[0])) {             //  remove duplicated info
  //     acc.push(s)
  //   }
  //   return acc
  // }, [])
};

export const getSymbolsOracleInfoForLens = async (chainId, symbols) => {
  if (isBSCChain(chainId)) {
    symbols = symbols.filter((s) => !onChainSymbols.includes(s))
  } else if (isArbiChain(chainId)) {
    symbols = symbols.filter((s) => !onChainSymbolsArbi.includes(s))
  }
  // const res = await getSignedValues(symbols.map((s) => normalizeOracleSymbol(s)))
  const res = await getOracleInfosFromRestForLens(symbols.map((s) => normalizeOracleSymbol(s)))
  return symbols.reduce((acc, symbol, index) => {
    if (res[index]) {
      // const oracleSymbol = normalizeOracleSymbol(symbol)
      const oracleSymbol = normalizeOracleSymbol(symbol)
      const priceSymbol = normalizePriceSymbol(symbol)
      if (!acc.find((s) => s[0] === priceSymbol)) {
        if (oracleSymbol === symbol) {
          acc.push([priceSymbol, res[index][2], '0'])
        } else {
          acc.push([priceSymbol, '0', res[index][2]])
        }
      }
      return acc
    }
  }, [])
};
