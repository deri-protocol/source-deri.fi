import {
  getSlpLiquidityInfo,
  getSlpWalletBalance,
  isSlpUnlocked,
} from './slp_pool_api';
import {
  getClp2LiquidityInfo,
  getClp2WalletBalance,
  isClp2Unlocked,
} from './clp2_pool_api';
import {
  getClpLiquidityInfo,
  getClpWalletBalance,
  isClpUnlocked,
} from './clp_pool_api';
import { getLpConfig } from '../config'

/**
 * Get liquidity info of LP pool
 * @async
 * @method
 * @param {string} chainId
 * @param {string} poolAddress
 * @param {string} accountAddress
 * @returns {Object} response
 * @returns {string} response.liquidity
 * @returns {string} response.bTokenBalance
 * @returns {string} response.shares
 */
export const getLpLiquidityInfo = async (
  chainId,
  poolAddress,
  accountAddress
) => {
  const { type } = getLpConfig(chainId, poolAddress);
  if (type === 'slp') {
    return await getSlpLiquidityInfo(chainId, poolAddress, accountAddress);
  } else if (type === 'clp') {
    return await getClpLiquidityInfo(chainId, poolAddress, accountAddress);
  } else if (type === 'clp2') {
    return await getClp2LiquidityInfo(chainId, poolAddress, accountAddress);
  } else {
    console.log(`getLpLiquidityInfo(): invalid lp type ${type}`);
  }
};


/**
 * Check account is unlocked in the lp pool
 * @async
 * @method
 * @param {string} chainId
 * @param {string} poolAddress
 * @param {string} accountAddress
 * @returns {bool}
 */
export const isLpUnlocked = async (chainId, poolAddress, accountAddress) => {
  const { type } = getLpConfig(chainId, poolAddress);
  if (type === 'slp') {
    return await isSlpUnlocked(chainId, poolAddress, accountAddress);
  } else if (type === 'clp') {
    return await isClpUnlocked(chainId, poolAddress, accountAddress);
  } else if (type === 'clp2') {
    return await isClp2Unlocked(chainId, poolAddress, accountAddress);
  } else {
    console.log(`isLpLiquidity(): invalid lp type ${type}`);
  }
};

/**
 * Get account balance in lp pool
 * @async
 * @method
 * @param {string} chainId
 * @param {string} accountAddress
 * @returns {string} Account balance
 */
export const getLpWalletBalance = async (
  chainId,
  poolAddress,
  accountAddress
) => {
  const { type } = getLpConfig(chainId, poolAddress);
  if (type === 'slp') {
    return await getSlpWalletBalance(chainId, poolAddress, accountAddress);
  } else if (type === 'clp') {
    return await getClpWalletBalance(chainId, poolAddress, accountAddress);
  } else if (type === 'clp2') {
    return await getClp2WalletBalance(chainId, poolAddress, accountAddress);
  } else {
    console.log(`getLpWalletBalance(): invalid lp type ${type}`);
  }
};
