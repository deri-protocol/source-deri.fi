import { SlpPool } from '../../contract/lp_pool/slp_pool'
import { ClpPool } from '../../contract/lp_pool/clp_pool'
import { Clp2Pool } from '../../contract/lp_pool/clp2_pool'

export const slpPoolFactory = (function () {
  const slpPoolInstanceMap = {};
  return (chainId, contractAddress) => {
    let key = `${chainId}.${contractAddress}`;
    if (Object.keys(slpPoolInstanceMap).includes(key)) {
      return slpPoolInstanceMap[key];
    }
    const slpPool = new SlpPool(chainId, contractAddress);
    slpPoolInstanceMap[key] = slpPool;
    return slpPool;
  };
})();

export const clpPoolFactory = (function () {
  const clpPoolInstanceMap = {};
  return (chainId, contractAddress) => {
    let key = `${chainId}.${contractAddress}`;
    if (Object.keys(clpPoolInstanceMap).includes(key)) {
      return clpPoolInstanceMap[key];
    }
    const clpPool = new ClpPool(chainId, contractAddress);
    clpPoolInstanceMap[key] = clpPool;
    return clpPool;
  };
})();

export const clp2PoolFactory = (function () {
  const clp2PoolInstanceMap = {};
  return (chainId, contractAddress) => {
    let key = `${chainId}.${contractAddress}`;
    if (Object.keys(clp2PoolInstanceMap).includes(key)) {
      return clp2PoolInstanceMap[key];
    }
    const clp2Pool = new Clp2Pool(chainId, contractAddress);
    clp2PoolInstanceMap[key] = clp2Pool;
    return clp2Pool;
  };
})();

// export const lpPoolFactory = (function () {
//   const lpPoolInstanceMap = {};
//   return (chainId, contractAddress, isProvider = false) => {
//     let key;
//     if (isProvider) {
//       key = `${chainId}.${contractAddress}.isProvider`;
//     } else {
//       key = `${chainId}.${contractAddress}`;
//     }
//     if (Object.keys(lpPoolInstanceMap).includes(key)) {
//       return lpPoolInstanceMap[key];
//     } else {
//       let lpPool;
//       const { type } = getLpContractAddress(chainId, contractAddress);
//       console.log(`lp type: ${type}`);
//       if (type === 'slp') {
//         lpPool = new SlpPool(chainId, contractAddress, isProvider);
//       } else if (type === 'clp') {
//         lpPool = new ClpPool(chainId, contractAddress, isProvider);
//       }
//       lpPoolInstanceMap[key] = lpPool;
//       return lpPool;
//     }
//   };
// })();