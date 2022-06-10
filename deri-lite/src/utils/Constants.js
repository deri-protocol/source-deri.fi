//for color
export const PRIMARY = 'primary';
export const SECONDARY = 'secondary'

//
export const DEPOSIT = 'deposit'
export const WITHDRAW = 'withdraw'

//
export const BUY = 'buy'
export const SELL = 'sell'

export const LONG = 'long'
export const SHORT = 'short'


export const BSC_CHAINID = 56
export const BSC_CHAINNAME= 'BSC'


export const ARROW_UP = 'up'
export const ARROW_DOWN = 'down'

export const FUTURE = 'future'
export const OPTION = 'option'
export const POWER = 'power'

export const FUTURES = 'futures'

export const CALL_OPTION = 'call'
export const PUT_OPTION = 'put'

export const VERSION_V2 = 'v2'
export const VERSION_V3 = 'v3'
export const VERSION_V2_LITE = 'v2_lite'
export const VERSION_V3_LITE = 'v3_lite'
export const VERSION_V2_OPEN = 'v2_lite_open'

//交易输入状态
export const TRADE_ENTRY_DOLLAR_STATUS = 'entry_by_dollar'
export const TRADE_ENTRY_VOLUME_STATUS = 'entry_by_volume'
export const TRADE_ENTRY_SLIDER_STATUS = 'entry_by_slider'
export const TRADE_ENTRY_PERCENTAGE_STATUS = 'entry_by_percentage'

//仓位交易状态
export const TRADING_CREATE_POSITION_STATUS = 'trading_create_position'
export const TRADING_APPEND_POSITION_STATUS = 'trading_append_position'
export const TRADING_CLOSE_POSITION_STATUS = 'trading_close_position'

export const SKIP_TRADE_CONFIRMATION = '_skip_trade_confirmation'

export const SUPPORTED_CHAINIDS = [1, 56,137,97]

export const SUPPORTED_WALLETS  = {
  injected: {
    connector: 'injected',
    name: 'MetaMask',
    icon: 'injected',
    description: 'Easy-to-use browser extension.',
  },
  walletconnect: {
    connector: 'walletconnect',
    name: 'Wallet Connect',
    icon: 'walletconnect',
    description: 'Connect to Trust Wallet, Rainbow Wallet and more...',
  },
  walletlink: {
    connector : 'walletlink',
    name: 'Coinbase Wallet',
    icon: 'walletlink',
    description: 'Open in Coinbase Wallet app.',
  },
}
export const COOKIE_DERI_DOMAIN='.deri.io'
export const COOKIE_DEFAULT_FUTURES_SYMBOL_KEY = 'deri_default_futures_symbol'
export const COOKIE_DEFAULT_OPTIONS_SYMBOL_KEY = 'deri_default_options_symbol'
export const COOKIE_DEFAULT_POWERS_SYMBOL_KEY = 'deri_default_powers_symbol'
export const NETWORK_MAP = {
  BSC:"BNB Chain"
}
export const SHORT_NAME_MAP = {
  'k' : 1000,
  'g' : 1000000000,
  'm' : 0.001,
  'n' : 0.000000001,
  'μ' : 0.000001
}
export const  MODAL_OPTIONS = {
  key  : 'confirmation',
  fading: true,
  style: {
    background: "rgba(0, 0, 0, 0.4)" ,
    zIndex : 1
  }
};
