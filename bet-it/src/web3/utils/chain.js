import Web3 from "web3";
import { DeriEnv, Env } from "./env";

// configs
const infuraAccount = "ec73e2f0c79a42c0997ee535364de584"
const chainConfigList = [
  {
    chainId: '1',
    name: 'ethereum',
    providers: [
      `https://mainnet.infura.io/v3/${infuraAccount}`
    ],
    scanapi: "",
  },
  {
    chainId: '3',
    name: 'ropsten',
    providers: [
      `https://ropsten.infura.io/v3/${infuraAccount}`
    ],
    scanapi: "",
  },
  {
    chainId: '56',
    name: 'bsc',
    providers: [
      'https://bsc-dataseed.binance.org/',
      'https://bsc-dataseed1.defibit.io/',
      // 'https://bsc-dataseed1.ninicoin.io/',
    ],
    scanapi: 'https://api.bscscan.com/api',
  },
  {
    chainId: '97',
    name: 'bsctestnet',
    providers: [
      'https://data-seed-prebsc-1-s1.binance.org:8545/',
      'https://data-seed-prebsc-2-s1.binance.org:8545/',
      'https://data-seed-prebsc-1-s2.binance.org:8545/',
      'https://data-seed-prebsc-2-s2.binance.org:8545/',
      // 'https://data-seed-prebsc-1-s3.binance.org:8545/',
      // 'https://data-seed-prebsc-2-s3.binance.org:8545/',
    ],
    scanapi: "",
  },
  {
    chainId: '42161',
    name: 'arbitrum',
    providers: [
      "https://arb1.arbitrum.io/rpc",
    ],
    scanapi: "https://api.arbiscan.io/api",
  },
  {
    chainId: '421611',
    name: 'arbitrumtestnet',
    providers: [
      "https://rinkeby.arbitrum.io/rpc",
    ],
    scanapi: "",
  },
];

export const getChainConfig = (chainId) => {
  chainId = checkChainId(chainId);
  const config = chainConfigList.find((c) => c.chainId === chainId);
  return config ? config : new Error(`Cannot find config for chainId(${chainId})`)
};

// utils
export const checkChainId = (chainId) => {
  chainId = chainId != null ? chainId.toString() : chainId;
  if (chainConfigList.map((c) => c.chainId).includes(chainId)) {
    return chainId;
  }
  throw new Error(`Invalid chainId: ${chainId}`);
};
export const checkAddress = (address) => {
  return Web3.utils.toChecksumAddress(address)
}
// export const fromWei = (val) => Web3.utils.fromWei(val.toString())
// export const toWei = (val) => Web3.utils.toWei(val.toString())


export const isBSCChain = (chainId) => {
  return ['56', '97'].includes(chainId)
}
export const isArbiChain = (chainId) => {
  return ['42161', '421611'].includes(chainId)
}
export const onChainSymbols = (chainId) => {
  if (isBSCChain(chainId) && DeriEnv.get() === Env.PROD) {
    return ["BTCUSD", "ETHUSD", "BNBUSD"]
  } else if (isArbiChain(chainId)) {
    return ["BTCUSD", "ETHUSD"]
  } else {
    return []
  }
}

