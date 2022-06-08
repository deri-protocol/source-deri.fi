import { getOracleVolatilitiesForOption } from "../shared/utils/oracle"

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export const volatilitiesCache = (function() {
  const cache = {}
  const pending = {}
  return {
    async get(symbols=['BTCUSD']){
      const key = symbols.join('_')
      if (
        !Object.keys(cache).includes(key) ||
        Math.floor(Date.now() / 1000) - cache[key].timestamp > 30
      ) {
        const timestamp = Math.floor(Date.now() / 1000);
        // pending is exit
        if (Object.keys(pending).includes(key)) {
          let retry = 10;
          while (retry > 0) {
            await delay(390);
            if (!Object.keys(pending).includes(key)) {
              //console.log('hit pending with cache');
              return cache[key].data;
            }
          }
          if (retry === 0) {
            //console.log('hit pending expired');
            const data = await getOracleVolatilitiesForOption(symbols);
            cache[key] = {
              data,
              timestamp,
            };
            return cache[key].data;
          }
        } else {
          pending[key] = true;
          try {
            //console.log('hit new');
            const data = await getOracleVolatilitiesForOption(symbols);
            cache[key] = {
              data,
              timestamp,
            };
            return cache[key].data;
          } catch (err) {
          } finally {
            delete pending[key];
          }
        }
      } else {
        //console.log('hit cache');
        return cache[key].data;
      }
    }
  }
})()

// export const volatilityCache = (function() {
//   const cache = {}
//   return {
//     async get(symbol){
//       const key = symbol
//       if (!Object.keys(cache).includes(key) || (Math.floor(Date.now()/1000) - cache[key].timestamp > 30)) {
//         const timestamp = Math.floor(Date.now()/1000)
//         const res = await getPriceInfo(symbol, 'option')
//         const data = deriToNatural(res.volatility).toString()
//         cache[key] = {
//           data,
//           timestamp,
//         }
//         //console.log('new key')
//         return cache[key].data
//       } else {
//         return cache[key].data
//       }
//     }
//   }
// })()

// export const volatilitiesCache2 = async (symbols) => {
//   return await Promise.all(
//     symbols.reduce((acc, s) => acc.concat(volatilityCache.get(s)), [])
//   )
// }
