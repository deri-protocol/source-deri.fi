import {
  PerpetualPool,
  PerpetualPoolRouter,
  LToken,
  PToken,
} from './contract';

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

export const perpetualPoolFactory = factory(PerpetualPool)

export const perpetualPoolRouterFactory = factory(PerpetualPoolRouter)

export const lTokenFactory = factory(LToken)

export const pTokenFactory = factory(PToken)