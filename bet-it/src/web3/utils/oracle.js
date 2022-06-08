import { debug } from "util";
import { asyncCache } from "./cache";
import { onChainSymbols } from "./chain";
import { isOptionSymbol, isPowerSymbol, normalizeOptionSymbol, normalizePowerSymbolForOracle, stringToId } from "./symbol";

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


export const getOracleInfosFromRest = asyncCache(_getOracleInfoFromRest, 'getOracleInfosFromRest', [], 3)
export const getOracleInfosFromRestForLens = asyncCache(_getOracleInfoFromRest, 'getOracleInfosFromRest', [], 10)

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

export const getSymbolsOracleInfo = async (chainId, symbols) => {
  // const res = await getSignedPrices(this.chainId, this.symbolNames)
  symbols = symbols.filter((s) => !onChainSymbols(chainId).includes(s))
  const res = await getOracleInfosFromRest([...new Set(symbols.map((s) => normalizeOracleSymbol(s)))])
  return res.filter((s) => s !== undefined)
};

export const getSymbolsOracleInfoForLens = async (chainId, symbols) => {
  symbols = symbols.filter((s) => !onChainSymbols(chainId).includes(s))
  const res = await getOracleInfosFromRestForLens(symbols.map((s) => normalizeOracleSymbol(s)))
  return symbols.reduce((acc, symbol, index) => {
    if (res[index]) {
      const oracleSymbol = normalizeOracleSymbol(symbol)
      if (!acc.find((s) => s[0] === oracleSymbol)) {
        if (oracleSymbol === symbol) {
          acc.push([oracleSymbol, res[index][2], '0'])
        } else {
          acc.push([oracleSymbol, '0', res[index][2]])
        }
      }
      return acc
    }
  }, [])
};
