import Web3 from "web3";

export const stringToId = (symbolName) => {
  return Web3.utils.keccak256(symbolName);
};

export const tokenToName = (symbol) => {
  return symbol.replace(/[-]/g, '').toLowerCase()
}


export const contractFactoryWithOpts = (klass) => {
  let instances = {}
  return (chainId, address, opts = {}) => {
    const key = `${chainId}_${address}${opts.useProvider ? '_provider' : ''}`
    if (Object.keys(instances).includes(key)) {
      return instances[key];
    } else {
      instances[key] = new klass(chainId, address, opts);
      return instances[key];
    }
  }
}
