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

export const normalizeBNB = (chainId, symbol) => {
  if (symbol.toUpperCase() === "WBNB" && ['56', '97'].includes(chainId)) {
    return "BNB";
  }
  if (symbol.toUpperCase() === "WETH" && ['1', '3', '4', '42161', '421611'].includes(chainId)) {
    return "ETH";
  }
  return symbol.toUpperCase();
};