// utils for derijsnext, combine in one file
import { getChainIds } from '../config/chain';
import { fromWei, toWei, toChecksumAddress } from './convert';

export const checkChainId = (chainId) => {
  chainId = chainId != null ? chainId.toString() : chainId 
  if (getChainIds().includes(chainId)) {
    return chainId;
  }
  throw new Error(`invalid chainId '${chainId}'`);
};

export const checkAddress = (address) => {
  address = address != null ? address.toString() : address
  try {
    return toChecksumAddress(address)
  } catch(err) {
    // console.log('-- checkAddress(): ', err)
    throw new Error(`invalid eth address '${address}'`)
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
  throw new Error(`invalid tokenId '${tokenId}'`)
}

export const checkAmount = (amount) => {
  amount = amount != null ? amount.toString() : amount
  if (/^-?[\d\.]+$/.test(amount)) {
    return amount
  }
  throw new Error(`invalid amount '${amount}'`)
}

export const checkSymbolId = (symbolId, symbolIds) => {
  if (symbolId != null) {
    const index = symbolIds.indexOf(symbolId.toString())
    if (index > -1) {
      return index
    }
  }
  throw new Error(`invalid symbolId '${symbolId}' for symbolIds(${symbolIds.join(',')}) `);
};

// factory
export const contractFactory = (klass) => {
  let instances = {}
  return (chainId, address, initialBlock='') => {
    const key = address
    if (Object.keys(instances).includes(key)) {
      return instances[key];
    } else {
      instances[key] = new klass(chainId, address, initialBlock);
      return instances[key];
    }
  }
}

// contract
const processObjectResult = (val, propList = []) => {
  return Object.keys(val).reduce((acc, prop) => {
    if (typeof val[prop] === "string" && propList.includes(prop)) {
      acc[prop] = fromWei(val[prop]);
    } else {
      acc[prop] = val[prop];
    }
    return acc;
  }, {});
};

export const processResult = (val, propList = []) => {
  if (Array.isArray(val)) {
    return val.map((v) => processResult(v, propList));
  } else if (typeof val === 'object' && val !== null) {
    return processObjectResult(val, propList);
  } else if (typeof val === "string") {
    return fromWei(val);
  } else {
    return val;
  }
};

export const processMethod = (klass, methodName, propList = []) => {
  const originMethod = klass.prototype[methodName];
  klass.prototype[methodName] = async function (...args) {
    const res = await originMethod.apply(this, args);
    return processResult(res, propList);
  };
  return klass;
};

export const processTxMethod = (klass, methodName, toWeiArgPositions = []) => {
  const originMethod = klass.prototype[methodName];
  klass.prototype[methodName] = async function (...args) {
    const newArgs = args.map((arg, index) =>
      toWeiArgPositions.indexOf(index.toString()) !== -1 ? toWei(arg) : arg
    );
    return await originMethod.apply(this, newArgs);
  };
  return klass;
};

// api for v2_lite and option
export const getLiquidity = (klass) => {
  // init pool addresses, parameters, tokens and viewer
  klass.prototype['getPoolLiquidity'] = async function () {
    const res = await this._call('getPoolStateValues', []);
    this.stateValues = this.stateValues || {}
    this.stateValues.liquidity = fromWei(res[0]);
    return this.stateValues.liquidity
  };
  return klass
}

export const getLastTimestamp = (klass) => {
  // init pool addresses, parameters, tokens and viewer
  klass.prototype['getLastTimestamp'] = async function () {
    const res = await this._call('getPoolStateValues', []);
    this.stateValues = this.stateValues || {}
    this.stateValues.lastTimestamp = res[1];
    return this.stateValues.lastTimestamp
  };
  return klass
}
export const getProtocolFeeAccrued = (klass) => {
  // init pool addresses, parameters, tokens and viewer
  klass.prototype['getProtocolFeeAccrued'] = async function () {
    const res = await this._call('getPoolStateValues', []);
    this.stateValues = this.stateValues || {}
    this.stateValues.protocolFeeAccrued = fromWei(res[2]);
    return this.stateValues.protocolFeeAccrued;
  };
  return klass;
}