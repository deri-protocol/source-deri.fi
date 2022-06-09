import {
  getChainProviderUrls,
  getDailyBlockNumberConfig,
  chainConfigList,
} from '../config/chain';
import { getLatestRPCServer } from './network';

export const getChainProviderUrl = async (chainId) => {
  const urls = getChainProviderUrls(chainId);
  if (urls.length > 0) {
   const url =  await getLatestRPCServer(urls);
   // console.log('url', url)
   return url
  } else {
    throw new Error(
      `Cannot find the chain provider url with chainId: ${chainId}`
    );
  }
};

export const getDailyBlockNumber = (chainId) => {
  const blockNumbers = getDailyBlockNumberConfig();
  if (blockNumbers[chainId]) {
    return parseInt(blockNumbers[chainId]);
  } else {
    throw new Error(`Invalid annual block number with chainId: ${chainId}`);
  }
};

export const getNetworkName = (chainId) => {
  const config = chainConfigList.find((c) => c.chainId === chainId)
  if (config && config.name)  {
    return config.name
  }
  throw new Error('CONFIG_NOT_FOUND', {
    name: 'getNetworkName',
    args: [chainId],
  });
};

export const getChainGasUnit= (chainId) => {
  const config = chainConfigList.find((c) => c.chainId === chainId)
  if (config && config.unit)  {
    return config.unit
  }
  throw new Error('CONFIG_NOT_FOUND', {
    name: 'getChainGasUnit',
    args: [chainId],
  });
};