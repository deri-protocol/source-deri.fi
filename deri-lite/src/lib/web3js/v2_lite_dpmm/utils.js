//import { getOracleServerUrl } from "../shared/utils/index.js";

export const isProdChain = (chainId) => {
  return ["1", "56", "128", "137"].includes(chainId.toString());
};

export const PRESERVED_SYMBOLS = ["BTCUSD", "ETHUSD", "BNBUSD"];

export const getOracleServerUrl = (chainId, symbol, type = "futures") => {
  //if (/^[0-9]+$/.test(symbolId.toString())) {
  let method = "get_signed_price";
  if (type === "option") {
    method = "get_signed_volatility";
  }
  if (PRESERVED_SYMBOLS.includes(symbol)) {
    method = "get_price";
    symbol = `${symbol}_v2_bsc`;
  }
  let baseUrl = isProdChain(chainId)
    ? `https://oraclemainnet.deri.finance/${method}`
    : `https://oracletestnet.deri.finance/${method}`;
  const addSymbolParam = (url, symbol) => `${url}?symbol=${symbol}`;

  if (symbol) {
    return addSymbolParam(baseUrl, symbol);
  } else {
    return baseUrl;
  }
};

export const getPriceInfos = async (chainId, symbolList) => {
  let url = getOracleServerUrl(chainId);
  let retry = 3;
  //console.log('url', url)
  let res, priceInfo;
  while (retry > 0) {
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
    retry -= 1;
  }
  if (retry === 0) {
    throw new Error(
      `!! getPriceInfos exceed max retry(3): ${symbolList} ${JSON.stringify(
        priceInfo
      )}`
    );
  }
};
