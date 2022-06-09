// for convert
const bTokenPairs = {
  AMUSDC: 'amUSDC',
};

// for convert
const symbolPairs = {
  IBSCDEFI: 'iBSCDEFI',
  IGAME: 'iGAME',
};

// todo: it's old, will clean later
const offchainSymbolPairs = {
  AXSUSDT: 'AXSUSDT',
  MANAUSDT: 'MANAUSDT',
  MBOXUSDT: 'MBOXUSDT',
  IBSCDEFI: 'iBSCDEFI',
  IGAME: 'iGAME',
  ALICEUSDT: 'ALICEUSDT',
  SANDUSDT: 'SANDUSDT',
  QUICKUSDT: 'QUICKUSDT',
  GHSTUSDT: 'GHSTUSDT',
  AGLDUSDT: 'AGLDUSDT',
  SHIBUSDT: 'SHIBUSDT',
};

const symbolDecimalPairs = {
  'BTCUSD-40000-P': '5',
  SHIBUSDT: '6',
};

// for power symbol,  oracle use only
export const powerSymbolTransformPairs = {
  BTC: "BTCUSD",
  ETH: "ETHUSD",
  BNB: "BNBUSD",
};
// for power symbol,  oracle use only
export const deriSymbolMultiplierPairs = {
  "BTC^2": 10 ** 3,
  "ETH^2": 10 ** 3,
};


export const OnChainOracleSymbols = ["BTCUSD", "ETHUSD", "BNBUSD"];

export const getSymbolDecimals = (symbol) => {
  if (Object.keys(symbolDecimalPairs).includes(symbol)) {
    return symbolDecimalPairs[symbol];
  }
  // default symbol decimals
  return '2'
};

export const normalizeOptionSymbol = (optionSymbol) => {
  const res = optionSymbol.split('-')
  if (res.length >= 2) {
    return res[0]
  } else {
    throw new Error(`invalid option symbol:${optionSymbol}`)
  }
};

export const getNormalizedOptionSymbols = (symbols) => {
  let res = []
  symbols.forEach((s) => {
    const volSymbol = normalizeOptionSymbol(s)
    if (!res.includes(volSymbol)) {
      res.push(volSymbol)
    }
  })
  return res
}

export const getVolatilitySymbols = (symbols) => {
  return getNormalizedOptionSymbols(symbols).map((s) => `VOL-${s}`)
}

export const isUsedRestOracle = (symbol) => {
  return Object.keys(offchainSymbolPairs).includes(symbol);
};

export const mapToSymbol = (symbol) => {
  if (Object.keys(symbolPairs).includes(symbol)) {
    return symbolPairs[symbol];
  }
  return symbol;
}

export const mapToSymbolInternal = (symbol) => {
  const index = Object.values(symbolPairs).indexOf(symbol)
  if (index > -1) {
    return Object.keys(symbolPairs)[index];
  }
  return symbol;
}

export const mapToBToken = (bToken) => {
  if (Object.keys(bTokenPairs).includes(bToken)) {
    return bTokenPairs[bToken];
  }
  return bToken;
};

export const mapToBTokenInternal = (bToken) => {
  const index = Object.values(bTokenPairs).indexOf(bToken);
  if (index !== -1) {
    return Object.keys(bTokenPairs)[index];
  }
  return bToken;
};

export const normalizeSymbolUnit = (symbol) => {
  if (symbol.indexOf('-') > -1) {
    symbol = symbol.split('-')[0]
  }
  const prefix = ['USD', 'USDT'];
  const re = new RegExp(`(${prefix.join('|')})$`);
  if (typeof symbol === 'string') {
    return mapToSymbol(symbol).replace(re, '');
  }
};

export const getIndexInfo = (symbol) => {
  const internalSymbol = mapToSymbolInternal(symbol);
  const customIndexs = {
    IGAME: {
      tokens: ['AXS', 'MANA', 'SAND', 'ALICE', 'TLM', 'DPET', 'SKILL'],
      url: 'https://docs.deri.io/products/index/game-index',
    },
    IBSCDEFI: {
      tokens: ['CAKE', 'XVS', 'MDX', 'AUTO', 'BAKE', 'BUNNY'],
      url: 'https://docs.deri.io/products/index/bsc-defi-index',
    },
    IMEME: {
      tokens: ['DOGE', 'SHIB', 'ELON', 'LOWB', 'PIG', 'SAFEMOON', 'MONA'],
      url: 'https://docs.deri.io/products/index/meme-index',
    },
  };
  if (Object.keys(customIndexs).includes(internalSymbol)) {
    return customIndexs[internalSymbol];
  } else {
    return { tokens: [], url: '' };
  }
};