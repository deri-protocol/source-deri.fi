
const SUPPORTED_CHAIN_LIST = {
  "1": "https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
  "56": "https://bsc-dataseed.binance.org/",
  "137": "https://polygon-rpc.com",
  "43114": "https://rpc.ankr.com/avalanche",
  "250": "https://rpc.ftm.tools",
  "25": "https://cronosrpc-1.xstaking.sg",
  "42161": "https://arb1.arbitrum.io/rpc",
  "8217": "https://public-node-api.klaytnapi.com/v1/cypress",
  "1666600000": "https://rpc.hermesdefi.io",
  "1313161554": "https://mainnet.aurora.dev",
  "42220": "https://forno.celo.org",
  "1088": "https://andromeda.metis.io/?owner=1088",
  "10": "https://mainnet.optimism.io",
  "128": "https://pub001.hg.network/rpc",
  "361": "https://eth-rpc-api.thetatoken.org/rpc",
  "1285": "https://rpc.api.moonriver.moonbeam.network",
  "100": "https://xdai-rpc.gateway.pokt.network",
  "42262": "https://emerald.oasis.dev",
  "32659": "https://mainnet.anyswap.exchange",
  "30": "https://mycrypto.rsk.co",
  "40": "https://rpc1.eu.telos.net/evm",
  "1284": "https://rpc.api.moonbeam.network",
  "4689": "https://babel-api.mainnet.iotex.one",
  "321": "https://rpc-mainnet.kcc.network",
  "888": "https://gwan-ssl.wandevs.org:56891",
  "288": "https://mainnet.boba.network",
  "66": "https://exchainrpc.okex.org",
  "200": "https://arbitrum.xdaichain.com"
}

export const USE_WALLET_OPTIONS = {
  connectors: {
    injected: {
      rpc: SUPPORTED_CHAIN_LIST
    },
    walletconnect: {
      // chainId: supportChainIds,
      rpc: SUPPORTED_CHAIN_LIST
    },
    walletlink: {
      chainId: 56,
      url: 'https://bsc-dataseed.binance.org/',
    },
  },
  autoConnect: true
}
//for color
export const PRIMARY = 'primary';
export const SECONDARY = 'secondary'

export const NETWORK_MAP = {
  BSC: "BNB Chain"
}



export const BSC_RPC_PROVIDERS = [
  "https://bsc-dataseed.binance.org",
  "https://bsc-dataseed1.defibit.io",
  "https://bsc-dataseed1.ninicoin.io",
  "https://bsc-dataseed2.defibit.io",
  "https://bsc-dataseed3.defibit.io",
  "https://bsc-dataseed4.defibit.io",
  "https://bsc-dataseed2.ninicoin.io",
  "https://bsc-dataseed3.ninicoin.io",
  "https://bsc-dataseed4.ninicoin.io",
  "https://bsc-dataseed1.binance.org",
  "https://bsc-dataseed2.binance.org",
  "https://bsc-dataseed3.binance.org",
  "https://bsc-dataseed4.binance.org",
]
export const ARBITRUM_RPC_PROVIDERS = [
  "https://arb1.arbitrum.io/rpc"
]

export const RPC_PROVIDERS = {
  56: BSC_RPC_PROVIDERS,
  42161: ARBITRUM_RPC_PROVIDERS
};
export const ARBITRUM_MAINNET_NETWORK = {
  chainId: 42161,
  name: "arbitrum",
  icon: "arbitrum-chain-logo",
  scan: "Arbiscan",
  scanUrl: "https://arbiscan.io/",
  isDefault: true,
  chainName: "Arbitrum",
  nativeCurrency: {
    name: "Arbitrum One",
    symbol: "ETH",
    decimals: 18
  },
  rpcUrls: ["https://arb1.arbitrum.io/rpc"]
};

export const BNBCHAIN_MAINNET_NETWORK = {
  chainId: 56,
  name: "bsc",
  icon: "bsc-chain-logo",
  chainName: "BNB Chain",
  scan: "Bscscan",
  scanUrl: "https://bscscan.com/",
  nativeCurrency: {
    name: "BNB Chain",
    symbol: "BNB",
    decimals: 18
  },
  rpcUrls: ["https://bsc-dataseed1.ninicoin.io", "https://bsc-dataseed2.ninicoin.io"]
};

export const SUPPORTED_MAINNET_NETWORKS = [
  ARBITRUM_MAINNET_NETWORK,
  BNBCHAIN_MAINNET_NETWORK,
]

export const MAX_GAS_LIMIT = 812731 * 5

export const GAS_PRICE_ADJUSTMENT_MAP = {
  42161: "0",
  56: "3000000000", // 3 gwei
};

export const MAX_GAS_PRICE_MAP = {
  56: "200000000000", // 200 gwei
};

export const DEFAULT_RETRY_OPTIONS = { n: 100, minWait: 0, maxWait: 200 };

export const COOKIE_DERI_DOMAIN = '.deri.fi'

export const FLP_TOKEN_ADDRESS = "0xEB47F807865AE53F6b2cB67296A986A7FE96a552"

export const EVENT_TRANS_BEGIN = 'event_trans_begin'
export const EVENT_TRANS_END = 'event_trans_end'
