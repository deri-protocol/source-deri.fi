import Web3 from "web3";
import { bg } from "./bignumber";

export const stringToId = (symbolName) => {
  return Web3.utils.keccak256(symbolName);
};

export const tokenToName = (symbol) => {
  return symbol.replace(/[-]/g, '').toLowerCase()
}

export const checkToken = (token) => {
  if (token != null) {
    return token.toUpperCase()
  }
  return new Error(`Token is invalid: ${token}`)
}

export const nativeCoinSymbols = (chainId) => {
  if (['56', '97'].includes(chainId)) {
    return ["BNB"];
  } else if (['42161', '421611'].includes(chainId)) {
    return ["ETH"];
  } else {
    return []
  }
}

// option symbol
export const isOptionSymbol = (symbolInfo) =>
  typeof symbolInfo === "object"
    ? symbolInfo.category === "option"
    : symbolInfo.split("-").length === 3;

export const normalizeOptionSymbol = (optionSymbol) => {
  const res = optionSymbol.split("-");
  if (res.length === 3) {
    return res[0];
  } else {
    return optionSymbol
  }
};

export const getVolatilitySymbol = (symbol) => {
  return `VOL-${symbol}`;
};

export const getNormalizedOptionSymbols = (symbols) => {
  let res = [];
  symbols.forEach((s) => {
    const volSymbol = normalizeOptionSymbol(s);
    if (!res.includes(volSymbol)) {
      res.push(volSymbol);
    }
  });
  return res;
};

// power symbol
export const powerSymbolTransformPairs = {
  BTC: "BTCUSD",
  ETH: "ETHUSD",
  BNB: "BNBUSD",
};
export const isPowerSymbol = (symbol) =>
  typeof symbol === "object"
    ? symbol.category === "power"
    : /^[A-Z]+\^\d$/.test(symbol);

// ETH^2 => ETH
export const normalizePowerSymbol = (symbol) =>
  isPowerSymbol(symbol) ? symbol.split("^")[0] : symbol;

// ETH^2 => ETHUSD
export const normalizePowerSymbolForOracle = (symbol) => {
  if (isPowerSymbol(symbol)) {
    const baseSymbol = symbol.split("^")[0]
    if (Object.keys(powerSymbolTransformPairs).includes(baseSymbol)) {
      return powerSymbolTransformPairs[baseSymbol]
    }
    return baseSymbol
  } else {
    return symbol
  }
}

// deri power symbol
export const normalizeDeriSymbol = (symbol) => {
  const res = isPowerSymbol(symbol) ? `m${symbol}` : symbol;
  return res
}
// for power symbol,  oracle use only
export const deriSymbolMultiplierPairs = {
  "BTC^2": 10 ** 3,
  "ETH^2": 10 ** 3,
};
export const getDeriSymbolMultiplier = (symbol) => {
  if (Object.keys(deriSymbolMultiplierPairs).includes(symbol)) {
    return deriSymbolMultiplierPairs[symbol];
  } else {
    return 1;
  }
};

export const deriSymbolScaleIn = (symbol, value) => {
  return bg(value).div(getDeriSymbolMultiplier(symbol)).toString()
}

export const deriSymbolScaleOut = (symbol, value) => {
  return bg(value).times(getDeriSymbolMultiplier(symbol)).toString()
}

// WETH => ETH, WBNB => BNB
export const normalizeBNB = (chainId, symbol) => {
  if (symbol.toUpperCase() === "WBNB" && ['56', '97'].includes(chainId)) {
    return "BNB";
  }
  if (symbol.toUpperCase() === "WETH" && ['1', '3', '4', '42161', '421611'].includes(chainId)) {
    return "ETH";
  }
  return symbol.toUpperCase();
};