import Web3 from 'web3';
import { normalizeChainId } from '../utils/validate';
import { getChainProviderUrl } from '../utils/chain';
import { isBrowser, isJsDom } from '../utils/convert';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export const web3Factory = (function () {
  const web3InstanceMap = {};
  let pending = {}
  let walletChainId = null
  return {
    async get(chainId) {
      chainId = normalizeChainId(chainId)
      if (Object.keys(web3InstanceMap).includes(chainId)) {
        //console.log('hit web3 cache')
        return web3InstanceMap[chainId];
      }
      // for mining page should not depends wallet network
      if (!walletChainId && typeof window === 'object' && window.ethereum) {
        walletChainId = await window.ethereum.request({ method: 'net_version' })
      }
      // using metaMask ethereum object
      if (
        isBrowser() &&
        !isJsDom() &&
        typeof window.ethereum === 'object' &&
        walletChainId &&
        chainId === walletChainId.toString()
      ) {
        //console.log('new ethereum web3 cache')
        web3InstanceMap[chainId] = new Web3(window.ethereum);
        return web3InstanceMap[chainId];
      } else {
        if (pending[chainId]) {
          // wait for init
          let retry = 8
          while (retry > 0) {
            await delay(500)
            if (Object.keys(web3InstanceMap).includes(chainId)) {
              // console.log('hit web3 cache')
              return web3InstanceMap[chainId];
            } else {
              retry -= 1
            }
          }
          // timeout
          const providerUrl = await getChainProviderUrl(chainId);
          //console.log('new web3 cache')
          web3InstanceMap[chainId] = new Web3(
            new Web3.providers.HttpProvider(providerUrl)
          );
          return web3InstanceMap[chainId];
        } else {
          // first init
          pending[chainId] = true
          try {
            const providerUrl = await getChainProviderUrl(chainId);
            //console.log('new web3 cache')
            web3InstanceMap[chainId] = new Web3(
              new Web3.providers.HttpProvider(providerUrl)
            );
          } catch(err) {
            console.log(err.toString())
          } finally {
            delete pending[chainId]
          }
          return web3InstanceMap[chainId];
        }
      }
    },
  };
})();