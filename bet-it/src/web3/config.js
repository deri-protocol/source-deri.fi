export const getDeriLensAddress = (chainId) => {
  const configs = [
    {
      chainId: "56",
      // address: "0xDe80Af93fB29f58f44601dfA270777b6785D0D08",
      address: "0xBF9ECF8d496438D651484527a8Bd6ffecf1b5730",
      env: "prod",
    },
    {
      chainId: "97",
      // address: "0x82f664B37dD8Ba1ef6dBC624e880C4B1B1BC9FAE",
      address: "0x0a4Df7413ff9Fb1542bdDc744670A5AFc4FD4458",
      env: "dev",
    },
    {
      chainId: "42161",
      // address: "0x74F8acC86D93052557752E9D0B0c7b89b53ef100",
      address: "0x7D3568236C84452A163c85b545AFA3b812da7A54",
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