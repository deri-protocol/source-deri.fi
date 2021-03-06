export const nativeCoinSymbols = (chainId) => {
  if (['56', '97'].includes(chainId)) {
    return ["BNB"];
  } else if (['42161', '421611'].includes(chainId)) {
    return ["ETH"];
  } else {
    return []
  }
}

export const onChainSymbols = ["BTCUSD", "ETHUSD", "BNBUSD"]
export const onChainSymbolsArbi = ["BTCUSD", "ETHUSD"]

export const checkToken = (token) => {
  if (token) {
    return token.toUpperCase()
  }
  return new Error(`Token is invalid: ${token}`)
}
export const getSymbolInfo = (symbolName, symbols) => {
  const res = symbols.find((s) => s.symbol === symbolName)
  if (res) {
    return res
  }
  throw new Error(`cannot find symbol(${symbolName}) in symbols: ${JSON.stringify(symbols)}`)
}
export const getBTokenInfo = (bToken, bTokens) => {
  const res = bTokens.find((s) => s.bTokenSymbol === bToken)
  if (res) {
    return res
  }
  throw new Error(`cannot find bTokenSymbol(${bToken}) in bTokens`)
}
export const getBTokenAddress = (bToken, bTokens) => {
  return getBTokenInfo(bToken, bTokens).bTokenAddress;
};
export const isOptionSymbol = (symbolInfo) =>
  typeof symbolInfo === "object"
    ? symbolInfo.category === "option"
    : symbolInfo.split("-").length === 3;

export const getVenusControllerConfig = (env, chainId) => {
  const configs = [
    {
      chainId: '56',
      address: '0xfD36E2c2a6789Db23113685031d7F16329158384',
      env: 'prod',
    },
    {
      chainId: '97',
      address: '0x94d1820b2D1c7c7452A163983Dc888CEC546b77D',
      env: 'dev',
    },
    {
      chainId: '97',
      address: '0x94d1820b2D1c7c7452A163983Dc888CEC546b77D',
      env: 'testnet',
    },
  ];
  const config = configs.find((c) => c.env === env && c.chainId === chainId);
  if (config && config.address) {
    return config;
  }
  throw new Error(
    `cannot find venus controller config for env(${env}) and chainId(${chainId})`
  );
};
export const getXvsConfig = (env, chainId) => {
  const configs = [
    {
      chainId: "56",
      address: "0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63",
      env: "prod",
    },
    {
      chainId: "97",
      address: "0xB9e0E753630434d7863528cc73CB7AC638a7c8ff",
      env: "dev",
    },
    {
      chainId: "97",
      address: "0xB9e0E753630434d7863528cc73CB7AC638a7c8ff",
      env: "testnet",
    },
  ];
  const config = configs.find((c) => c.env === env && c.chainId === chainId)
  if (config && config.address) {
    return config
  }
  throw new Error(`cannot find xvx config for env(${env}) and chainId(${chainId})`)
}

export const getDeriLensConfig = (env, chainId) => {
  const configs = [
    {
      chainId: "56",
      address: "0xDe80Af93fB29f58f44601dfA270777b6785D0D08",
      env: "prod",
    },
    {
      chainId: "97",
      address: "0x82f664B37dD8Ba1ef6dBC624e880C4B1B1BC9FAE",
      env: "dev",
    },
    {
      chainId: "97",
      address: "0x82f664B37dD8Ba1ef6dBC624e880C4B1B1BC9FAE",
      env: "testnet",
    },
    {
      chainId: "42161",
      address: "0x74F8acC86D93052557752E9D0B0c7b89b53ef100",
      env: "prod",
    },
    {
      chainId: "421611",
      address: "0x39096E1D96D40C6aBe70F4fdB41fbE01fa61c51B",
      env: "dev",
    },
    {
      chainId: "421611",
      address: "0x39096E1D96D40C6aBe70F4fdB41fbE01fa61c51B",
      env: "testnet",
    },
  ];
  const config = configs.find((c) => c.env === env && c.chainId === chainId)
  if (config && config.address) {
    return config
  }
  throw new Error(`cannot find deri view config for env(${env}) and chainId(${chainId})`)
}

const venusTokenData = [
  { symbol: 'BUSD', supplyApy: 4.6, xvsApy: 0.83, factor: 0.8 },
  { symbol: 'SXP', supplyApy: 0.05, xvsApy: 0.13, factor: 0.5 },
  { symbol: 'USDC', supplyApy: 7.05, xvsApy: 1.49, factor: 0.8 },
  { symbol: 'USDT', supplyApy: 5.95, xvsApy: 0.69, factor: 0.8 },
  { symbol: 'BNB', supplyApy: 1.4, xvsApy: 0.98, factor: 0.8 },
  { symbol: 'XVS', supplyApy: 0, xvsApy: 0, factor: 0.6 },
  { symbol: 'BTCB', supplyApy: 0.5, xvsApy: 0.51, factor: 0.8 },
  { symbol: 'ETH', supplyApy: 0.32, xvsApy: 0.32, factor: 0.8 },
  { symbol: 'LTC', supplyApy: 0.48, xvsApy: 0.77, factor: 0.6 },
  { symbol: 'XRP', supplyApy: 3.81, xvsApy: 0.27, factor: 0.6 },
  { symbol: 'BCH', supplyApy: 0.75, xvsApy: 0.31, factor: 0.6 },
  { symbol: 'DOT', supplyApy: 5.68, xvsApy: 0.13, factor: 0.6 },
  { symbol: 'LINK', supplyApy: 0.3, xvsApy: 0.6, factor: 0.6 },
  { symbol: 'DAI', supplyApy: 7.26, xvsApy: 0.64, factor: 0.6 },
  { symbol: 'FIL', supplyApy: 0.73, xvsApy: 0.9, factor: 0.6 },
  { symbol: 'BETH', supplyApy: 0.47, xvsApy: 0.81, factor: 0.6 },
  { symbol: 'ADA', supplyApy: 0.29, xvsApy: 0.53, factor: 0.6 },
  { symbol: 'DOGE', supplyApy: 0.19, xvsApy: 0.45, factor: 0.4 },
  { symbol: 'MATIC', supplyApy: 12.56, xvsApy: 1.19, factor: 0.6 },
  { symbol: 'CAKE', supplyApy: 24.17, xvsApy: 0.76, factor: 0.55 },
  { symbol: 'AAVE', supplyApy: 2.17, xvsApy: 1.95, factor: 0.55 },
  { symbol: 'TUSD', supplyApy: 4.85, xvsApy: 0.68, factor: 0.8 },
  { symbol: 'TRX', supplyApy: 2.75, xvsApy: 3.68, factor: 0.6 },
];

const aaveTokenData = [
  { symbol: 'DAI', supplyApy:  0.59, factor: 0.75 },
  { symbol: 'LINK', supplyApy: 0.13, factor: 0.7 },
  { symbol: 'USDC', supplyApy: 0.60, factor: 0.8 },
  { symbol: 'USDT', supplyApy: 2.96, factor: 0.75 },
  { symbol: 'WBTC', supplyApy: 0.05, factor: 0.7 },
  { symbol: 'ETH', supplyApy: 0.07, factor: 0.8 },
  { symbol: 'AAVE', supplyApy: 0, factor: 0.5 },
];

const getBTokenApyInfoForBsc = async (poolAddress, tokenList) => {
  tokenList = tokenList.map((t) => t.toUpperCase());
  // default
  return tokenList.map((t) => {
    return (
      venusTokenData.find((v) => v.symbol === t) || {
        symbol: t,
        supplyApy: "",
        xvsApy: "",
        factor: 0.6,
      }
    );
  });
};

const getBTokenApyInfoForArbi = async (poolAddress, bTokens) => {
  return bTokens.map((t) => {
    const res = aaveTokenData.find((v) => v.symbol === t.bTokenSymbol)
    if (t.collateralFactor && res) {
      res.factor = t.collateralFactor
      res.xvsApy = '0'
    }
    return res ? res : { symbol: t.symbol, factor: '0', supplyApy: '0', xvsApy: '0'}
  });
}

export const getBTokenApyAndDiscounts = async (chainId, poolAddress, bTokens) => {
  if (isBSCChain(chainId)) {
    return await getBTokenApyInfoForBsc(poolAddress, bTokens.map((s) => s.bTokenSymbol))
  } else if (isArbiChain(chainId)) {
    return await getBTokenApyInfoForArbi(poolAddress, bTokens)
  } else {
    // unsupported chain
    return []
  }
}

export const isBSCChain = (chainId) => {
  return ['56', '97'].includes(chainId)
}
export const isArbiChain = (chainId) => {
  return ['42161', '421611'].includes(chainId)
}