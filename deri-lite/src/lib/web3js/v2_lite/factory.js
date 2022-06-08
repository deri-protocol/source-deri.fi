import {
  LTokenLite,
  PTokenLite,
  PerpetualPoolLiteViewer 
} from './contract';
import { PerpetualPoolLiteOld } from './contract/perpetual_pool_old';

const factory = (klass) => {
  let instances = {}
  return (chainId, address) => {
    const key = address
    if (Object.keys(instances).includes(key)) {
      return instances[key];
    } else {
      instances[key] = new klass(chainId, address);
      return instances[key];
    }
  }
}

// const factoryWithUpgrade = (klass, klassOld, newPoolList) => {
//   let instances = {}
//   return (chainId, address, initialBlock='') => {
//     const key = address
//     if (Object.keys(instances).includes(key)) {
//       return instances[key];
//     } else {
//       if (Array.isArray(newPoolList) && newPoolList.includes(address)) {
//         instances[key] = new klass(chainId, address, initialBlock);
//         return instances[key];
//       } else {
//         instances[key] = new klassOld(chainId, address, initialBlock);
//         return instances[key];
//       }
//     }
//   }
// }

export const perpetualPoolLiteFactory = factory(PerpetualPoolLiteOld);

export const lTokenLiteFactory = factory(LTokenLite)

export const pTokenLiteFactory = factory(PTokenLite)

export const perpetualPoolLiteViewerFactory = factory(PerpetualPoolLiteViewer)