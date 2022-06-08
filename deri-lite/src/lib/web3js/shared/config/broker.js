import { getJsonConfig } from './config';
import { DeriEnv } from './env';

export const getBrokerConfigList = (version) => {
  const config = getJsonConfig(version, DeriEnv.get())
  if (config.brokerManager) {
    return config.brokerManager
  } else {
    // default value
    return []
  }
};

export const getBrokerConfig = (version='v2', chainId) => {
  const filteredByChainId = getBrokerConfigList(version).filter((c) =>c.chainId === chainId);
  if (filteredByChainId.length > 0) {
    return filteredByChainId[0];
  }
  throw new Error(`getBrokerConfig(): invalid chainId(${chainId}).`);
};
