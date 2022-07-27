import { debug } from "util";
import { asyncCache } from "./cache";
import { onChainSymbols } from "./chain";
import { isOptionSymbol, isPowerSymbol, normalizeOptionSymbol, normalizePowerSymbolForOracle, stringToId } from "./symbol";
import axios from "axios";
import { bg } from "./bignumber";

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

const addSymbolParam2 = (url, symbol) => `${url}?symbols=${symbol}`;
export const getOracleServerUrl2 = (symbolList, isSigned) => {
  //if (/^[0-9]+$/.test(symbolId.toString())) {
  let method = isSigned ?  "signed" : "unsigned"
  let baseUrl = `https://sig.oraclum.io/${method}`

  return addSymbolParam2(baseUrl, symbolList.join(','))
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
}, 'getOracleInfoFromRest', '', 3)

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
const _getOracleInfoFromRest2  = async (symbolList, isSigned=true) => {
  let url = getOracleServerUrl2(symbolList.map((s) => normalizeOracleSymbol(s)), isSigned);
  // console.log('-',url)
  let retry = 2;
  let res=[], symbolInfos;
  while (retry > 0) {
    try {
      res = await axios.get(url);
      if (res.status === 200) {
          symbolInfos = res.data;
          if (Array.isArray(symbolInfos)) {
            const values = symbolInfos
            res = symbolList.reduce((acc, s) => {
              const info = values.find((p) => p.symbol === s)
              if (info) {
                acc.push([
                  info.symbolId,
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
          } else if (typeof symbolInfos === 'object' && symbolInfos != null) {
            res = symbolList.reduce((acc, s) => {
              const oracleSymbol = normalizeOracleSymbol(s);
              acc.push([
                oracleSymbol,
                stringToId(oracleSymbol),
                symbolInfos[oracleSymbol]
                  ? bg(symbolInfos[oracleSymbol]).times(10**18).toString()
                  : undefined,
              ]);
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

export const getOracleInfosFromRest2 = asyncCache(_getOracleInfoFromRest2, 'getOracleInfosFromRest2', [], 3)
export const getOracleInfosFromRestForLens2 = asyncCache(_getOracleInfoFromRest2, 'getOracleInfosFromRest2', [], 5)

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
const oracleSymbolToPriceSymbol = (symbol) => {
  if (symbol.startsWith('VOL-')) {
    return symbol.replace('VOL-', '')
  }
  return symbol
}

export const getSymbolsOracleInfo = async (chainId, symbols) => {
  // const res = await getSignedPrices(this.chainId, this.symbolNames)
  symbols = symbols.filter((s) => !onChainSymbols(chainId).includes(s))
  const res = await getOracleInfosFromRest2([...new Set(symbols.map((s) => normalizeOracleSymbol(s)))])
  return res.filter((s) => s !== undefined)
};

export const getSymbolsOracleInfoForLens = async (chainId, symbols) => {
  symbols = symbols.filter((s) => !onChainSymbols(chainId).includes(s))

  const compactOracleSymbols = [...new Set(symbols.map((s) => normalizeOracleSymbol(s)))]
  const res = await getOracleInfosFromRestForLens2(compactOracleSymbols, false)
  const result = compactOracleSymbols.reduce((acc, symbol, index) => {
    if (res[index]) {
      const priceSymbol = oracleSymbolToPriceSymbol(symbol)
      if (!acc.find((s) => s[0] === priceSymbol)) {
        if (res[index][2]) {
          if (symbol.startsWith('VOL-')) {
            acc.push([priceSymbol, '0', res[index][2]])
          } else {
            acc.push([priceSymbol, res[index][2], '0'])
          }
        }
      }
      return acc
    }
  }, [])
  return result
};
