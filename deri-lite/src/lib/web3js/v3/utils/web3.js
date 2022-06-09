// import any from 'promise.any'
// import Web3 from 'web3'
// import { checkChainId, debug, getChainProviderUrls } from '../../shared/config';

// const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// // cached async function
// export const factory = (fn, name) => {
//   let cache = {};
//   let pending = {};
//   return async (...args) => {
//     if (args.length === 0) {
//       args = ['_'];
//     }
//     const key = args.reduce((acc, i) => (['string', 'number', 'boolean'].includes(typeof i) ? [...acc, i.toString()] : acc), []).join('_');
//     if (Object.keys(cache).includes(key)) {
//       return cache[key];
//     } else {
//       let res;
//       if (pending[key]) {
//         // wait for 6s
//         for (let i = 0; i < 20; i++) {
//           await delay(300);
//           if (!pending[key]) {
//             if (Object.keys(cache).includes(key)) {
//               return cache[key];
//             } else {
//               break;
//             }
//           }
//         }
//         cache[key] = await fn(...args);
//         return cache[key];
//       } else {
//         try {
//           pending[key] = true;
//           cache[key] = await fn(...args);
//           res = cache[key];
//         } catch (err) {
//           console.log(err);
//         } finally {
//           delete pending[key];
//         }
//         return res;
//       }
//     }
//   };
// };

// export const _getBlockNumber = async (provider) => {
//   const web3 = new Web3(provider);
//   try {
//     const timeNow = Math.floor(Date.now() / 1000)
//     const block = await web3.eth.getBlock('latest');
//     if (Math.abs(timeNow - block.timestamp) <= 30 && block.number > 0) {
//       return provider
//     }
//   } catch (err) {
//     console.log(err.toString())
//   }
//   throw new Error(`the node is not synced: ${provider}`);
// };

// export const getLatestProvider = async (providers = []) => {
//   // console.log('--- getLatestProvider(): ', providers);
//   return await any(providers.map((p) => _getBlockNumber(p)));
// };

// // getWeb3 use only public providers, not using wallet build-in provider
// export const getWeb3 = factory(async (chainId = '_') => {
//   // use url/ws provider
//   chainId = checkChainId(chainId)
//   let web3 = new Web3();
//   web3._chainId = chainId
//   web3._update = async function () {
//     const providers = getChainProviderUrls(this._chainId)
//     let url = ''
//     if (providers.length === 1) {
//       url = providers[0]
//     } else {
//       url = await getLatestProvider(providers)
//     }
//     debug() &&  console.log(`--->> using provider for chain(${this._chainId}): ${url}`);
//     this.setProvider(url)
//     return this
//   }
//   return await web3._update()
// }, 'getWeb3')