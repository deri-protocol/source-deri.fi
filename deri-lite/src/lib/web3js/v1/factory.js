import { PerpetualPool } from './contract/perpetual_pool';
//import { BTokenContract } from './contract/bToken';
import { PTokenContract } from './contract/p_token';
import { LTokenContract } from './contract/l_token';

export const perpetualPoolFactory = (() => {
  const perpetualPoolInstanceMap = {};
  return (chainId, contractAddress) => {
    let key = `${chainId}.${contractAddress}`;
    if (Object.keys(perpetualPoolInstanceMap).includes(key)) {
      return perpetualPoolInstanceMap[key];
    }
    const perpetualPool = new PerpetualPool(
      chainId,
      contractAddress,
    );
    // console.log("new PerpetualPoolContract");
    perpetualPoolInstanceMap[key] = perpetualPool;
    return perpetualPool;
  };
})();

export const pTokenFactory = (function () {
  const pTokenInstanceMap = {};
  return (chainId, contractAddress) => {
    let key = `${chainId}.${contractAddress}`;
    if (Object.keys(pTokenInstanceMap).includes(key)) {
      return pTokenInstanceMap[key];
    }
    const pToken = new PTokenContract(
      chainId,
      contractAddress,
    );
    // console.log("new PTokenContract")
    pTokenInstanceMap[key] = pToken;
    return pToken;
  };
})();

export const lTokenFactory = (function () {
  const lTokenInstanceMap = {};
  return (chainId, contractAddress) => {
    let key = `${chainId}.${contractAddress}`;
    if (Object.keys(lTokenInstanceMap).includes(key)) {
      return lTokenInstanceMap[key];
    }
    const lToken = new LTokenContract(
      chainId,
      contractAddress,
    );
    lTokenInstanceMap[key] = lToken;
    return lToken;
  };
})();

