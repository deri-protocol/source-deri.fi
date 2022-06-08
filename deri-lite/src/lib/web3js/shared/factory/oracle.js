import { isUsedRestOracle } from '../config/token';
import { RestOracle } from '../utils/oracle';
import { WrappedOracle } from '../contract/oracle/wrapped_oracle';
import { factory } from '../utils/factory';
import { SymbolOracleOffChain } from '../contract/oracle/symbol_oracle_off_chain';
import { WooOracle } from '../contract/oracle/woo_oracle';

const wooOracleAddresses = [
  '0xC686B6336c0F949EAdFa5D61C4aAaE5Fe0687302',
  '0x60Dda0aD29f033d36189bCe4C818fe9Ce3a95206',
  '0xa356c0559e0DdFF9281bF8f061035E7097a84Fa4',
]

export const oracleFactory = (function () {
  const instanceMap = {};
  return (chainId, address, symbol, decimal = '18') => {
    const key = address;
    if (Object.keys(instanceMap).includes(key)) {
      return instanceMap[key];
    } else {
      if (isUsedRestOracle(symbol)) {
        instanceMap[key] = RestOracle(symbol);
      } else if (wooOracleAddresses.includes(address)) {
        instanceMap[key] = wooOracleFactory(chainId, address, symbol, decimal);
      } else if (['56', '137', '97', '80001'].includes(chainId)) {
        instanceMap[key] = wrappedOracleFactory(chainId, address, symbol, decimal);
      } else {
        throw new Error(
          `please setup oracle contract for the chain(${chainId})`
        );
      }
      return instanceMap[key];
    }
  };
})();

export const wrappedOracleFactory = factory(WrappedOracle);
export const wooOracleFactory = factory(WooOracle);
export const symbolOracleOffChainFactory = factory(SymbolOracleOffChain);
