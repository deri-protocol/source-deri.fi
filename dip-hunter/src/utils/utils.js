
import Cookies from 'js-cookie'
import { COOKIE_DERI_DOMAIN, FUTURES, POWER } from './Constants'
import { BigNumber as bg } from 'bignumber.js';

export function setCookie(name, value, expires = 365, domain = COOKIE_DERI_DOMAIN, path = '/') {
  if (name && value) {
    Cookies.set(name, value, { expires: expires, domain: domain, path: path })
  }
}

export function getCookie(name) {
  return Cookies.get(name)
}


export function removeCookie(name, domain = COOKIE_DERI_DOMAIN, path = '/') {
  Cookies.remove(name, { domain, path })
}
//反科学计数法
export function toPlainString(num) {
  return ('' + +num).replace(/(-?)(\d*)\.?(\d*)e([+-]\d+)/,
    function (a, b, c, d, e) {
      return e < 0
        ? b + '0.' + Array(1 - e - c.length).join(0) + c + d
        : b + c + d + Array(e - d.length + 1).join(0);
    });
}


export function formatNumber(number, decimal) {
  let effectiveDecimal = decimal
  let value = number;
  if (/\d+\.0*[1-9]+/.test(value) && (+bg(value).toFixed((decimal || 2))) === 0) {
    effectiveDecimal = countDecimal(Math.abs(value)) + 2
  }
  value = bg(value).toFixed(effectiveDecimal)
}


export function countDecimal(n) {
  return -Math.floor(Math.log10(n) + 1);
}

export function formatAddress(address) {
  return address && `${address.substr(0, 6)}...${address.substr(-4)}`
}

export function isElementInViewport(el) {
  var rect = el ? el.getBoundingClientRect() : {}
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && /* or $(window).height() */
    rect.right <= (window.innerWidth || document.documentElement.clientWidth) /* or $(window).width() */
  );
}

export function isStartScroll(offset = 82) {
  const st = window.pageYOffset || document.documentElement.scrollTop;
  return st > offset ? true : false
}

export function eqInNumber(str1, str2) {
  return (+str1) === (+str2)
}

export function importAll(r, config = {}) {
  r.keys().forEach(key => {
    const path = key.split('.')
    const env = path[2]
    if (!config[env]) {
      config[env] = {}
    }
    config[env] = r(key)
  });
  return config;
}

export function getEnv() {
  return "prod"
  // return process.env.REACT_APP_NETWORK === 'mainnet' || process.env.NODE_ENV === 'production' ? 'prod' : 'dev';
}


export async function switchChain(chain, successCb, errorCb) {
  const chainId = `0x${(parseInt(chain.chainId)).toString(16)}`
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId }],
    })
    successCb && successCb()
  } catch (error) {
    if (error.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{ chainId, ...chain.metamask }],
        });
      } catch (addError) {
        console.error('err', addError)
      }
    } else if (error.code === 4001) {
      errorCb && errorCb(40001)
    }
  }
}

export function hasParent(parent, current) {
  if (parent === current) {
    return true
  } else if (current.parentElement) {
    return hasParent(parent, current.parentElement)
  }
  return false
}

export function getMarkpriceSymbol(symbolInfo) {
  const env = getEnv()
  if (symbolInfo.category === FUTURES) {
    if (env === 'dev') {
      if (/ARBI/i.test(symbolInfo.chain)) {
        return `MARKPRICE_${symbolInfo.symbol}_V3_${symbolInfo.chain}_${symbolInfo.name}_${env}net_${symbolInfo.b0Token}`.toUpperCase()
      }
      return `MARKPRICE_${symbolInfo.symbol}_V3_${symbolInfo.chain}_future_${env}net_${symbolInfo.zone}_${symbolInfo.b0Token}`.toUpperCase()
    } else {
      if (/ARBI/i.test(symbolInfo.chain)) {
        return `MARKPRICE_${symbolInfo.symbol}_V3_${symbolInfo.chain}_${symbolInfo.name}_${symbolInfo.b0Token}`.toUpperCase()
      }
    }
    return `MARKPRICE_${symbolInfo.symbol}_V3_${symbolInfo.chain}_${symbolInfo.name}_${symbolInfo.b0Token}`.toUpperCase()
  } else if (symbolInfo.category === POWER) {
    if (env === 'dev') {
      if (/ARBI/i.test(symbolInfo.chain)) {
        return `MARKPRICE_m${symbolInfo.symbol}_V3_${symbolInfo.chain}_${symbolInfo.name}_${env}net_${symbolInfo.b0Token}`.toUpperCase()
      } else {
        return `MARKPRICE_m${symbolInfo.symbol}_V3_${symbolInfo.chain}_${symbolInfo.category}_${env}net_${symbolInfo.zone}_${symbolInfo.b0Token}`.toUpperCase()
      }
    } else {
      if (/ARBI/i.test(symbolInfo.chain)) {
        return `MARKPRICE_m${symbolInfo.symbol}_V3_${symbolInfo.chain}_${symbolInfo.name}_${symbolInfo.b0Token}`.toUpperCase()
      }
    }
    return `MARKPRICE_m${symbolInfo.symbol}_V3_${symbolInfo.chain}_${symbolInfo.category}_${symbolInfo.zone}_${symbolInfo.b0Token}`.toUpperCase()
  }
}
export function isMobile() {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}
export function getBtokenAmount(token) {
  const arr = {
    "BNB": {
      max: 0.5,
      decimalScale: 3
    },
    "BUSD": {
      max: 100,
      decimalScale: 0
    },
    "BTC": {
      max: 0.005,
      decimalScale: 5
    },
    "USDT": {
      max: 100,
      decimalScale: 0
    },
    "USDC": {
      max: 100,
      decimalScale: 0
    },
    "CAKE": {
      max: 20,
      decimalScale: 1
    },
    "XVS": {
      max: 20,
      decimalScale: 1
    },
    "XRP": {
      max: 200,
      decimalScale: 0
    },
    "DOT": {
      max: 10,
      decimalScale: 1
    },
    "MATIC": {
      max: 100,
      decimalScale: 0
    },
    "LTC": {
      max: 2,
      decimalScale: 2
    },
    "TRX": {
      max: 200,
      decimalScale: 0
    },
    "TUSD": {
      max: 100,
      decimalScale: 0
    },
    "SXP": {
      max: 200,
      decimalScale: 0
    },
    "USDC": {
      max: 100,
      decimalScale: 0
    },
    "ETH": {
      max: 0.05,
      decimalScale: 4
    },
    "WBTC": {
      max: 0.005,
      decimalScale: 5
    },
    "DAI": {
      max: 100,
      decimalScale: 0
    },
    "LINK": {
      max: 20,
      decimalScale: 1
    },
  }
  return arr[token]
}