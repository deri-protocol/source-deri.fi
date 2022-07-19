import { debug } from "./env";

export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// contract factory
export const contractFactory = (klass) => {
  let instances = {}
  return (chainId, address, opts={}) => {
    const key = `${chainId}_${address}_${!!opts.isNodeEnv}`
    if (Object.keys(instances).includes(key)) {
      return instances[key];
    } else {
      instances[key] = new klass(chainId, address, opts);
      return instances[key];
    }
  }
}

// cached async function
export const factory = (fn, name) => {
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
        debug() &&  console.log('--- waiting cache updated', name, key);
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
        debug() && console.log('--- update cache after waiting timeout', name, key);
        cache[key] = await fn(...args);
        return cache[key];
      } else {
        try {
          debug() && console.log('--- create cache', name, key);
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