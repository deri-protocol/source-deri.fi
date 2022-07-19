import { debug } from "./env";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const asyncCache = (fn, fnName, defaultValue='', timeout = 60) => {
  let cache = {};
  let pending = {};
  return async function (...args) {
    // first arg is the cache key
    const keyList = args.reduce((acc, a) => ![undefined].includes(typeof a) ? [...acc, a.toString()] : acc, [])
    const key = `${fnName}_${keyList.join('_')}`;
    if (
      Object.keys(cache).includes(key) && 
      Math.floor(Date.now() / 1000) - cache[key].timestamp < timeout
    ) {
      // return the cached data
      return cache[key].data;
    } else {
      let res = defaultValue;
      try {
        if (Object.keys(pending).includes(key)) {
          debug() &&  console.log('--- waiting cache updated', fnName, key);
          let retry = 10
          let delayMs = 300 + Math.floor(Math.random() * 300);
          while (retry > 0) {
            await delay(delayMs);
            if (!Object.keys(pending).includes(key)) {
              return cache[key].data;
            }
          }
          if (retry === 0) {
            debug() && console.log('--- update cache after waiting timeout', fnName, key);
            res = await fn(...args);
            const timestamp = Math.floor(Date.now() / 1000);
            cache[key] = { data: res, timestamp };
            return res;
          }
        } else {
          debug() && console.log('--- update cache', fnName, key);
          pending[key] = true;
          res = await fn(...args);
          const timestamp = Math.floor(Date.now() / 1000);
          cache[key] = { data: res, timestamp };
          return res;
        }
      } catch (err) {
        debug() && console.log(err)
        if (cache[key]) {
          // return old data
          return cache[key].data;
        } else {
          // return default value
          return res;
        }
      } finally {
        delete pending[key];
      }
    }
  };
};

export const ObjectCache = (function () {
  let _cache = {};
  return {
    get(key) {
      if (Object.keys(_cache).includes(key)) {
        return _cache[key];
      }
      return null
    },
    set(key, val) {
      const timestamp = Math.floor(Date.now() / 1000);
      if (typeof val === 'object' && val != null) {
        val.timestamp = timestamp;
        _cache[key] = val;
      }
    },
  };
})();