import { getChainIds } from '../config/chain';
import Web3 from 'web3';

// validate
export const normalizeChainId = (chainId) => {
  const chainIds = getChainIds()
  let res = chainId ? chainId.toString() : chainId;
  if (chainId && chainIds.includes(res)) {
    return res;
  } else {
    throw new Error(`invalid chainId: ${chainId}`);
  }
};

export const normalizeAddress = (address) => {
  if (typeof address === 'string' && address.startsWith('0x') && address.length == 42 ) {
    return Web3.utils.toChecksumAddress(address);
  } else {
    throw new Error(`invalid address: ${address}`);
  }
};

export const validateArgs = (...args) =>
  args.every((i) => !isNaN(parseFloat(i)));

export const validateObjectKeyExist = (keyList, val, valName) => {
  const keys = Object.keys(val);
  keyList.forEach((prop) => {
    if (!keys.includes(prop)) {
      throw new Error(
        `validateConfig(): property ${prop} is not exist in the ${valName} config.`
      );
    }
  });
};
export const validateIsArray = (val, valName) => {
  if (!Array.isArray(val)) {
    throw new Error(
      `validateConfig(): property ${valName} is an array in the config.`
    );
  }
};
