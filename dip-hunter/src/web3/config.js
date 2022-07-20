export const getDeriLensAddress = (chainId) => {
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
      chainId: "42161",
      address: "0x74F8acC86D93052557752E9D0B0c7b89b53ef100",
      env: "prod",
    },
    {
      chainId: "421611",
      address: "0x39096E1D96D40C6aBe70F4fdB41fbE01fa61c51B",
      env: "dev",
    },
  ];
  const config = configs.find((c) => c.chainId === chainId)
  if (config && config.address) {
    return config.address
  }
  throw new Error(`cannot find deri lens config for chainId(${chainId})`)
}

export const normalizeBTokenSymbol = (chainId, bTokenSymbol) => {
  const config = {
    "56": {
      "BTC": "BTCB",
    }
  }
  if (config[chainId] && config[chainId][bTokenSymbol]) {
    return config[chainId][bTokenSymbol];
  }
  return bTokenSymbol
}