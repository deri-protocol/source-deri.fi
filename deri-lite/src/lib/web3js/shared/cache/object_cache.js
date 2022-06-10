
export const ObjectCache = (function () {
  let _cache = {};
  return {
    get(poolAddress, name) {
      const key = `${poolAddress}.${name}`;
      if (Object.keys(_cache).includes(key)) {
        return _cache[key];
      }
      return null
    },
    set(poolAddress, name, val) {
      const key = `${poolAddress}.${name}`;
      const timestamp = Math.floor(Date.now() / 1000);
      if (typeof val === 'object' && val != null && !Array.isArray(val)) {
        val.timestamp = timestamp;
        _cache[key] = val;
      }
    },
  };
})();