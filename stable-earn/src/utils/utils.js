
import Cookies from 'js-cookie'
import { COOKIE_DERI_DOMAIN } from './Constants'
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

export function isMobile() {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}