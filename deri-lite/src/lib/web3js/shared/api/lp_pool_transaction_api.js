import { getLpConfig } from '../config';
import { unlockSlp, addSlpLiquidity, removeSlpLiquidity } from './slp_pool_api';
import { unlockClp, addClpLiquidity, removeClpLiquidity } from './clp_pool_api';
import {
  unlockClp2,
  addClp2Liquidity,
  removeClp2Liquidity,
} from './clp2_pool_api';

/**
 * Unlock the account in the lp pool
 * @async
 * @method
 * @param {string} chainId
 * @param {string} poolAddress
 * @param {string} accountAddress
 * @returns {Object} response
 * @returns {boolean} response.success
 * @returns {string} response.[error]
 * @returns {Object} response.transaction - eth transaction receipt object
 */
export const unlockLp = async (chainId, poolAddress, accountAddress) => {
  const { type } = getLpConfig(chainId, poolAddress);
  if (type === 'slp') {
    return await unlockSlp(chainId, poolAddress, accountAddress);
  } else if (type === 'clp') {
    return await unlockClp(chainId, poolAddress, accountAddress);
  } else if (type === 'clp2') {
    return await unlockClp2(chainId, poolAddress, accountAddress);
  } else {
    console.log(`unlockLp(): invalid lp type ${type}`);
  }
};

/**
 * Add liquidity to LP pool
 * @async
 * @method
 * @param {string} chainId
 * @param {string} poolAddress
 * @param {string} accountAddress
 * @param {number} amount
 * @returns {Object} response
 * @returns {boolean} response.success
 * @returns {string} response.[error]
 * @returns {Object} response.transaction - eth transaction receipt object
 */
export const addLpLiquidity = async (
  chainId,
  poolAddress,
  accountAddress,
  amount
) => {
  const { type } = getLpConfig(chainId, poolAddress);
  if (type === 'slp') {
    return await addSlpLiquidity(chainId, poolAddress, accountAddress, amount);
  } else if (type === 'clp') {
    return await addClpLiquidity(chainId, poolAddress, accountAddress, amount);
  } else if (type === 'clp2') {
    return await addClp2Liquidity(chainId, poolAddress, accountAddress, amount);
  } else {
    console.log(`addLpLiquidity(): invalid lp type ${type}`);
  }
};

/**
 * Remove liquidity to LP pool
 * @async
 * @method
 * @param {string} chainId
 * @param {string} poolAddress
 * @param {string} accountAddress
 * @param {number} amount
 * @returns {Object} response
 * @returns {boolean} response.success
 * @returns {string} response.[error]
 * @returns {Object} response.transaction - eth transaction receipt object
 */
export const removeLpLiquidity = async (
  chainId,
  poolAddress,
  accountAddress,
  amount
) => {
  const { type } = getLpConfig(chainId, poolAddress);
  if (type === 'slp') {
    return await removeSlpLiquidity(
      chainId,
      poolAddress,
      accountAddress,
      amount
    );
  } else if (type === 'clp') {
    return await removeClpLiquidity(
      chainId,
      poolAddress,
      accountAddress,
      amount
    );
  } else if (type === 'clp2') {
    return await removeClp2Liquidity(
      chainId,
      poolAddress,
      accountAddress,
      amount
    );
  } else {
    console.log(`removeLpLiquidity(): invalid lp type ${type}`);
  }
};
