
import Cookies from 'js-cookie'
import { COOKIE_DERI_DOMAIN } from './Constants'
import { BigNumber } from 'bignumber.js';
import {BigNumber as eBigNumber} from 'ethers'
import { STABLE_EARN_CONTRACT, TOKEN } from '../abi/contractAddress';

export function setCookie(name, value, expires = 365, domain = COOKIE_DERI_DOMAIN, path = '/') {
  if (name && value) {
    Cookies.set(name, value, { expires: expires, domain: domain, path: path })
  }
}

export function bg(value, base){
  if (base === 0) {
    return new BigNumber(value);
  } else if (base > 0) {
    return new BigNumber(value).times(new BigNumber("1" + "0".repeat(base)));
  } else {
    return new BigNumber(value).div(new BigNumber("1" + "0".repeat(-base)));
  }
}

export function getCookie(name) {
  return Cookies.get(name)
}

export function bigNumberify(n) {
  try {
    return eBigNumber.from(n)
  } catch (e) {
    console.error('bigNumberify error', e)
    return undefined
  }
}
export function random(min, max) {
  return Math.round(Math.random() * Math.max(0, max - min));
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

export function getToken(chainId) {
  const token = TOKEN[chainId]
  if (token) {
    const { tokenAddress, tokenName } = token
    return [tokenAddress, tokenName]
  } else {
    return ["0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56", "BUSD"]
  }
}

export function getContractAddress(chainId){
  const contract = STABLE_EARN_CONTRACT[chainId]
  if (contract) {
    return contract
  } else {
    return "0xEB47F807865AE53F6b2cB67296A986A7FE96a552"
  }
}

export function toFixed(value, decaiml = 18){
  return bg(value).toFixed(decaiml);
}