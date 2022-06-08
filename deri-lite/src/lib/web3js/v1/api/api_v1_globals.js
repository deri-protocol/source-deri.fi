import { perpetualPoolFactory } from '../factory';
import { getPriceFromRest } from '../../shared/utils/oracle';
import { io } from 'socket.io-client';

/** @module apiCache */
/**
 * fundingRateCache Object
 * @name fundingRateCache
 * @property {function} get - Get the funding rate from cache
 * @property {function} set - set the funding rate cache
 */
export const fundingRateCache = (function () {
  let resourceMap = {};
  return {
    get(chainId, contractAddress) {
      const key = `${chainId}.${contractAddress}`;
      if (Object.keys(resourceMap).includes(key)) {
        return resourceMap[key];
      }
      console.log(`Cache key is not in resourceMap: ${key}`);
      return undefined;
    },
    set(chainId, contractAddress, resource) {
      const key = `${chainId}.${contractAddress}`;
      resourceMap[key] = resource;
    },
  };
})();

export const accountAddressCache = (function () {
  let _accountAddress = '';
  return {
    get() {
      if (_accountAddress === '') {
        console.log("please init 'accountAddress' first");
      }
      return _accountAddress;
    },
    set(value) {
      if (typeof value === 'string' && value !== '') {
        _accountAddress = value;
      }
    },
  };
})();

/**
 * priceCache Object
 * @name priceCache
 * @property {function} get - Get the price from cache
 * @property {function} update - Set the price to automatic update during a time interval
 * @property {function} clear - Clear the the automatic update of the price
 */
export const priceCache = (function () {
  let _price = '';
  let _interval = null;
  return {
    get() {
      if (_price === '') {
        console.log("please init 'price' first");
      }
      return _price;
    },
    async _update(poolAddress, symbol) {
      try {
        const res = await getPriceFromRest(symbol);
        if (res !== '') {
          _price = res;
        }
      } catch (err) {
        console.log(`priceCache.update: ${err}`)
      }
    },
    update(poolAddress, symbol) {
      const self = this;
      _interval = setInterval(() => {
        // console.log('tick')
        self._update(poolAddress, symbol);
      }, 3000);
    },
    clear() {
      if (_interval) {
        clearInterval(_interval);
      }
      _price = '';
    },
  };
})();

/**
 * PerpetualPoolParametersCache Object
 * @name PerpetualPoolParametersCache
 * @property {function} get - Get the perpetualPoolParameters from cache
 * @property {function} update - Set the perpetualPoolParameters
 */

export const PerpetualPoolParametersCache = (function () {
  let _parameters = {};
  return {
    get() {
      if (!_parameters.multiplier) {
        console.log("please init 'perpetual pool parameters' first");
      }
      return _parameters;
    },
    async update(chainId, poolAddress) {
      const perpetualPool = perpetualPoolFactory(chainId, poolAddress);
      const res = await perpetualPool.getParameters();
      if (res.multiplier) {
        _parameters = res;
      }
      return res;
    },
  };
})();

// websocket instance
export const wsInstance = (function(){
  let _ws = null;
  return {
    get() {
      if (_ws) {
        return _ws
      } else {
        console.log('wsInstance.get() error: ws instance is not init')
      }
    },
    set(url) {
      try {
        const ws = io(url, {
          transports: ['websocket'],
          path: '/ws',
        });
        ws.on('connect', () => {
          console.log('hello from ws:', ws.id);
        })
        if (ws) {
          _ws = ws
        } else {
          console.log('wsInstance.get() error: ws instance is not init')
        }
      } catch (err) {
        console.log('wsInstance.set():', err)
      }
    },
    getOrSet(url) {
      if (!_ws) {
        this.set(url)
      }
      return _ws
    }
  }
})();
