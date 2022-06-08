import {
  getChainProviderUrls,
  getDailyBlockNumberConfig,
} from '../config/chain';
import { normalizeChainId } from './validate';
import { getLatestRPCServer } from './network';

export const getChainProviderUrl = async (chainId) => {
  chainId = normalizeChainId(chainId);
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
  chainId = normalizeChainId(chainId);
  let poolNetwork;
  switch (chainId) {
    case '1':
      poolNetwork = 'ethereum';
      break;
    case '56':
      poolNetwork = 'bsc';
      break;
    case '128':
      poolNetwork = 'heco';
      break;
    case '3':
      poolNetwork = 'ropsten';
      break;
    case '42':
      poolNetwork = 'kovan';
      break;
    case '97':
      poolNetwork = 'bsctestnet';
      break;
    case '256':
      poolNetwork = 'hecotestnet';
      break;
    case '137':
      poolNetwork = 'matic';
      break;
    case '80001':
      poolNetwork = 'mumbai';
      break;
    default:
      throw new Error(`The networkId is not valid for chainId ${chainId}`);
  }
  return poolNetwork;
};