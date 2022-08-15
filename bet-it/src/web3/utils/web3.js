import any from 'promise.any'
import { debug } from './env';
import Web3 from 'web3';
import { checkChainId, getChainConfig } from './chain.js';
import { isArray, isObject, stringToUint8Array } from './lang.js'
import { factory } from './factory';


// utils
export const padLeft = (val, length) => Web3.utils.padLeft(val, length)
export const toHex = (val) => Web3.utils.toHex(val)
export const HextoNumber = (val) => Web3.utils.hexToNumber(val)
export const HextoNumberString = (val) => Web3.utils.hexToNumberString(val)

export const _getBlockNumber = async (provider) => {
  try {
    const web3 = new Web3(provider);
    // const start = Date.now();
    const block = await web3.eth.getBlock('latest');
    const timeNow = Math.floor(Date.now() / 1000)
    if (Math.abs(timeNow - block.timestamp) <= 30 && block.number > 0) {
      return provider
    }
  } catch (err) {
    console.log(err.toString())
  }
  throw new Error(`the node is not synced: ${provider}`);
};

export const getLatestProvider = async (providers = []) => {
  debug() && console.log('--- getLatestProvider(): ', providers);
  return await any(providers.map((p) => _getBlockNumber(p)));
};


export const getWeb3 = factory(async (chainId = '_', isTx=false) => {
  if (typeof window !== 'undefined' && window.ethereum && isTx) {
    // using wallet provider
    let web3 = new Web3(window.ethereum);
    web3._chainId = chainId
    web3._update = async () => {}  // placeholder
    return web3
  } else if (typeof window !== 'undefined' && chainId === '_') {
    console.log(`Ethereum wallet plugin is not installed, please check`);
  } else {
    // use url/ws provider
    chainId = checkChainId(chainId)
    let web3 = new Web3();
    web3._chainId = chainId
    web3._update = async function(){
      const providers = getChainConfig(this._chainId).providers
      let url = ''
      if (providers.length === 1) {
        url = providers[0]
      } else {
        url = await getLatestProvider(providers)
      }
      debug() && console.log(`--- using provider for chain(${this._chainId}): ${url}`);
      this.setProvider(url)
      return this
    }
    return await web3._update()
  }
}, 'getWeb3')

export const getWeb3WithSigner = async (chainId) => {
  //if (typeof TextEncoder === 'function') {
    if (!process.env.PKEY) {
      throw new Error('the env variable PKEY is not set for getWebWithSigner')
    } else {
      // const encoder = new TextEncoder()
      const web3 = await getWeb3(chainId)
      //web3.eth.accounts.wallet.add(process.env.PKEY)
      const account = web3.eth.accounts.wallet.add(process.env.PKEY)
      web3.eth.defaultAccount = account.address
      debug() && console.log(`-- getWeb3WithSigner: ${account.address}`)
      return web3
    }
  //}
}

export const getChainId = async (web3) => {
  return await web3.eth.getChainId();
};

export const requestAccounts = async (web3) => {
  return await web3.eth.requestAccounts();
};

export const getContract = factory(async (chainId, address, Klass) => {
  const web3 = await getWeb3(chainId);
  return new Klass(web3, address);
}, 'getContract');

export const getBlockInfo = async (chainId, blockNumber='latest') => {
  const web3 = await getWeb3(chainId)
  return await web3.eth.getBlock(blockNumber);
}

export const getContractFromAbi = factory(async (chainId, address, abi) => {
  const web3 = await getWeb3(chainId);
  return new web3.eth.Contract(abi, address)
}, 'getContractFromAbi');

const intRex = /^\d+$/
export const normalizeResponse = (obj) => {
  //console.log(obj)
  if (!(typeof obj === 'object' && obj !== null)) {
    return obj
  }
  const objectKeys = Object.keys(obj)
  const indexKeyLength = objectKeys.filter((k) =>intRex.test(k)).length
  if (objectKeys.length < 2 || indexKeyLength * 2 !== objectKeys.length ) {
    return obj
  } else {
    let res = {}
    objectKeys.forEach(((key) => {
      if (!intRex.test(key)) {
        if (isObject(obj[key])) {
          res[key] = normalizeResponse(obj[key])
        } else if (isArray(obj[key])) {
          res[key] = obj[key].map((v) => normalizeResponse(v))
        } else {
          res[key] = obj[key]
        }
      }
    }))
    return res
  }
}
