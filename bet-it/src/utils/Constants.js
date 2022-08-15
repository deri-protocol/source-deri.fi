
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

export const FUTURE = 'future'
export const OPTION = 'option'
export const POWER = 'power'
export const FUTURES = 'futures'


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
      chainId: 1,
      url: 'https://mainnet.eth.aragon.network/',
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

export const COOKIE_DERI_DOMAIN = '.deri.fi'

export const MODAL_OPTIONS = {
  key: 'confirmation',
  fading: true,
  style: {
    background: "rgba(0, 0, 0, 0.4)",
    zIndex: 1
  }
};

export const EVENT_TRANS_BEGIN = 'event_trans_begin'
export const EVENT_TRANS_END = 'event_trans_end'