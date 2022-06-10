import Web3 from 'web3';
import { DeriEnv, Env } from './env';
import { getChainIds } from './chain';

const toChecksumAddress = (value) => Web3.utils.toChecksumAddress(value);

export const checkEnv = (env) => {
  if (env == null) {
    return DeriEnv.get()
  } else if (Object.values(Env).includes(env)) {
    return env
  }
  throw new Error('INVALID_DERI_ENV', env)
}

export const checkChainId = (chainId) => {
  chainId = chainId != null ? chainId.toString() : chainId 
  if (getChainIds().includes(chainId)) {
    return chainId;
  }
  throw new Error('INVALID_CHAIN_ID', chainId);
};

export const checkAddress = (address) => {
  address = address != null ? address.toString() : address
  try {
    return toChecksumAddress(address)
  } catch(err) {
    // console.log('-- checkAddress(): ', err)
    throw new Error('INVALID_ADDRESS', address);
  }
}
export const checkApiInput = (chainId, poolAddress, accountAddress) => {
  return [
    checkChainId(chainId),
    checkAddress(poolAddress),
    checkAddress(accountAddress),
  ];
};

export const checkApiInputWithoutAccount = (chainId, poolAddress) => {
  return [checkChainId(chainId), checkAddress(poolAddress)];
};

export const checkTokenId = (tokenId) => {
  tokenId = tokenId != null ? tokenId.toString() : tokenId
  if (/^\d+$/.test(tokenId)) {
    return tokenId
  }
  throw new Error('INVALID_TOKEN_ID', tokenId);
}

export const checkTokenIdInRange = (tokenId, tokenIds, name='symbol id') => {
  tokenId = tokenId != null ? tokenId.toString() : tokenId
  if (tokenId != null) {
    const index = tokenIds.indexOf(tokenId.toString())
    if (index > -1) {
      return tokenId
    }
  }
  throw new Error('INVALID_TOKEN_ID_IN_RANGE', {tokenId, tokenIds, name});
};
export const checkSymbolId = checkTokenIdInRange

export const checkAmount = (amount) => {
  amount = amount != null ? amount.toString() : amount
  if (/^-?[\d\.]+$/.test(amount)) {
    return amount
  }
  throw new Error('INVALID_AMOUNT',amount)
}