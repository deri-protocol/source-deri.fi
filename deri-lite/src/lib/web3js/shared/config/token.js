const bTokenPairs = {
  AMUSDC: 'amUSDC',
};

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
  if (Object.keys(offchainSymbolPairs).includes(symbol)) {
    return offchainSymbolPairs[symbol]
  } else {
    return symbol
  }
}

export const mapToSymbolInternal = (symbol) => {
  const index = Object.values(offchainSymbolPairs).indexOf(symbol)
  if (index > -1) {
    return Object.keys(offchainSymbolPairs)[index]
  } else {
    return symbol
  }
}

export const mapToBToken = (bToken) => {
  if (Object.keys(bTokenPairs).includes(bToken)) {
    return bTokenPairs[bToken]
  } else {
    return bToken
  }
}

export const mapToBTokenInternal = (bToken) => {
  const index = Object.values(bTokenPairs).indexOf(bToken)
  if (index !== -1) {
    return Object.keys(bTokenPairs)[index]
  } else {
    return bToken
  }
}

export const normalizeSymbolUnit = (symbol) => {
  const prefix = ['USD', 'USDT'];
  const re = new RegExp(`(${prefix.join('|')})$`);
  if (typeof symbol === 'string') {
    return mapToSymbol(symbol).replace(re, '');
  }
  console.log(`symbol(${symbol}) is not a string type`);
  return symbol;
};

export const getIndexInfo = (symbol) => {
  const internalSymbol = mapToSymbolInternal(symbol);
  const customIndexs = {
    IGAME: {
      tokens: ['AXS', 'MANA', 'SAND', 'ALICE', 'TLM', 'DPET', 'SKILL'],
      url: 'https://docs.deri.finance/products/index/game-index',
    },
    IBSCDEFI: {
      tokens: ['CAKE', 'XVS', 'MDX', 'AUTO', 'BAKE', 'BUNNY'],
      url: 'https://docs.deri.finance/products/index/bsc-defi-index',
    },
    IMEME: {
      tokens: ['DOGE', 'SHIB', 'ELON', 'LOWB', 'PIG', 'SAFEMOON', 'MONA'],
      url: 'https://docs.deri.finance/products/index/meme-index',
    },
  };
  if (Object.keys(customIndexs).includes(internalSymbol)) {
    return customIndexs[internalSymbol];
  } else {
    return { tokens: [], url: '' };
  }
};