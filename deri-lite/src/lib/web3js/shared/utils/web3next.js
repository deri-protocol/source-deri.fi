// utils for derijsnext, combine in one file
import { fromWei, toWei, isObject, isArray } from './convert';
import any from 'promise.any'
import Web3 from 'web3'
import { checkChainId, debug, getChainProviderUrls } from '../config';

// factory
export const contractFactory = (klass) => {
  let instances = {}
  return (chainId, address, initialBlock='') => {
    const key = address
    if (Object.keys(instances).includes(key)) {
      return instances[key];
    } else {
      instances[key] = new klass(chainId, address, initialBlock);
      return instances[key];
    }
  }
}

const re = /^(0x|[a-zA-Z])/
const processObjectResult = (val, propList = []) => {
  return Object.keys(val).reduce((acc, prop) => {
    if (typeof val[prop] === "string" && propList.includes(prop)) {
      acc[prop] = fromWei(val[prop]);
    } else if (Array.isArray(val[prop])) {
      acc[prop] = processResult(val[prop], propList);
    } else if (isObject(val[prop])) {
      acc[prop] = processObjectResult(val[prop], propList);
    } else {
      acc[prop] = val[prop];
    }
    return acc;
  }, {});
};

export const processResult = (val, propList = []) => {
  if (isArray(val)) {
    return val.map((v) => processResult(v, propList));
  } else if (isObject(val)) {
    return processObjectResult(val, propList);
  } else if (typeof val === "string") {
    return re.test(val) ? val : fromWei(val);
  } else {
    return val;
  }
};

export const processMethod = (klass, methodName, propList = []) => {
  const originMethod = klass.prototype[methodName];
  klass.prototype[methodName] = async function (...args) {
    const res = await originMethod.apply(this, args);
    return processResult(res, propList);
  };
  return klass;
};

export const processTxMethod = (klass, methodName, toWeiArgPositions = []) => {
  const originMethod = klass.prototype[methodName];
  klass.prototype[methodName] = async function (...args) {
    const newArgs = args.map((arg, index) =>
      toWeiArgPositions.indexOf(index.toString()) !== -1 ? toWei(arg) : arg
    );
    return await originMethod.apply(this, newArgs);
  };
  return klass;
};

// api for v2_lite and option
export const getLiquidity = (klass) => {
  // init pool addresses, parameters, tokens and viewer
  klass.prototype['getPoolLiquidity'] = async function () {
    const res = await this._call('getPoolStateValues', []);
    this.stateValues = this.stateValues || {}
    this.stateValues.liquidity = fromWei(res[0]);
    return this.stateValues.liquidity
  };
  return klass
}

export const getLastTimestamp = (klass) => {
  // init pool addresses, parameters, tokens and viewer
  klass.prototype['getLastTimestamp'] = async function () {
    const res = await this._call('getPoolStateValues', []);
    this.stateValues = this.stateValues || {}
    this.stateValues.lastTimestamp = res[1];
    return this.stateValues.lastTimestamp
  };
  return klass
}
export const getProtocolFeeAccrued = (klass) => {
  // init pool addresses, parameters, tokens and viewer
  klass.prototype['getProtocolFeeAccrued'] = async function () {
    const res = await this._call('getPoolStateValues', []);
    this.stateValues = this.stateValues || {}
    this.stateValues.protocolFeeAccrued = fromWei(res[2]);
    return this.stateValues.protocolFeeAccrued;
  };
  return klass;
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// cached async function
export const asyncFactory = (fn, name) => {
  let cache = {};
  let pending = {};
  return async (...args) => {
    if (args.length === 0) {
      args = ['_'];
    }
    const key = args.reduce((acc, i) => (['string', 'number', 'boolean'].includes(typeof i) ? [...acc, i.toString()] : acc), []).join('_');
    if (Object.keys(cache).includes(key)) {
      return cache[key];
    } else {
      let res;
      if (pending[key]) {
        // wait for 6s
        for (let i = 0; i < 20; i++) {
          await delay(300);
          if (!pending[key]) {
            if (Object.keys(cache).includes(key)) {
              return cache[key];
            } else {
              break;
            }
          }
        }
        cache[key] = await fn(...args);
        return cache[key];
      } else {
        try {
          pending[key] = true;
          cache[key] = await fn(...args);
          res = cache[key];
        } catch (err) {
          console.log(err);
        } finally {
          delete pending[key];
        }
        return res;
      }
    }
  };
};

export const _getBlockNumber = async (provider) => {
  const web3 = new Web3(provider);
  try {
    const timeNow = Math.floor(Date.now() / 1000)
    const block = await web3.eth.getBlock('latest');
    if (Math.abs(timeNow - block.timestamp) <= 30 && block.number > 0) {
      return provider
    }
  } catch (err) {
    console.log(err.toString())
  }
  throw new Error(`the node is not synced: ${provider}`);
};

export const getLatestProvider = async (providers = []) => {
  // console.log('--- getLatestProvider(): ', providers);
  return await any(providers.map((p) => _getBlockNumber(p)));
};

// getWeb3 use only public providers, not using wallet build-in provider
export const getWeb3 = asyncFactory(async (chainId = '_') => {
  // use url/ws provider
  chainId = checkChainId(chainId)
  let web3 = new Web3();
  web3._chainId = chainId
  web3._update = async function () {
    const providers = getChainProviderUrls(this._chainId)
    let url = ''
    if (providers.length === 1) {
      url = providers[0]
    } else {
      url = await getLatestProvider(providers)
    }
    debug() &&  console.log(`--->> using provider for chain(${this._chainId}): ${url}`);
    this.setProvider(url)
    return this
  }
  return await web3._update()
}, 'getWeb3')