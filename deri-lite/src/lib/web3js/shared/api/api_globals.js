export const priceCache = (function(){
  let _prices = {}
  return {
    get(poolAddress, symbolId) {
      const key = `${poolAddress}.${symbolId}`
      if (Object.keys(_prices).includes(key)) {
        const [price, ] = _prices[key].split('|')
        //if (parseInt(timestamp) - Date.now() < 10000) {
          return price
        //}
      }
      console.log('please init priceCache first')
    },
    // update(chainId, poolAddress, symbolId) {
    //   // place holder
    // },
    set(poolAddress, symbolId, val) {
      if (!isNaN(parseFloat(val))) {
        const timestamp = Date.now().toString()
        _prices[`${poolAddress}.${symbolId}`] = `${val}|${timestamp}`
      }
    }
  }
})()

export const fundingRateCache = (function () {
  let resourceMap = {};
  return {
    get(chainId, contractAddress, symbolId) {
      const key = `${chainId}.${contractAddress}.${symbolId}`;
      if (Object.keys(resourceMap).includes(key)) {
        return resourceMap[key];
      }
      console.log(`fundingRateCache: key is not in exist: ${key}`);
      return undefined;
    },
    set(chainId, contractAddress, symbolId, resource) {
      const key = `${chainId}.${contractAddress}.${symbolId}`;
      resourceMap[key] = resource;
    },
  };
})();

export const liquidatePriceCache = (function() {
  let _cache = {}
  return {
    get(address) {
      if (Object.keys(_cache).includes(address)) {
        return _cache[address]
      } else {
        return {}
      }
    },
    set(address, val) {
      _cache[address] = val
    },
  }
})()
