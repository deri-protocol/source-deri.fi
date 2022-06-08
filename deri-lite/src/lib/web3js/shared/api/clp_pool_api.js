import {
  bTokenFactory,
  clpPoolFactory,
} from '../factory/contract';
import { lTokenFactory } from '../../v1/factory';
import { bg } from '../utils';
import { getLpConfig } from '../config';

/**
 * Get liquidity Info of the CLP pool
 * @async
 * @method
 * @param {string} chainId
 * @param {string} poolAddress
 * @param {string} accountAddress
 * @returns {Object} response
 * @returns {string} response.totalSupply
 * @returns {string} response.poolLiquidity
 * @returns {string} response.shares
 * @returns {string} response.shareValue
 * @returns {string} response.maxRemovableShares
 */
export const getClpLiquidityInfo = async (
  chainId,
  poolAddress,
  accountAddress
) => {
  const { lTokenAddress } = getLpConfig(chainId, poolAddress);
  const clpPool = clpPoolFactory(chainId, poolAddress);
  //pPool.setAccount(accountAddress);
  const lToken = lTokenFactory(chainId, lTokenAddress);
  //lToken.setAccount(accountAddress);

  const [lTokenBalance, lTokenTotalSupply] = await Promise.all([
    lToken.balanceOf(accountAddress),
    lToken.totalSupply(),
  ]);
  const { liquidity } = await clpPool.getStateValues();
  //console.log(liquidity);

  return {
    totalSupply: lTokenTotalSupply.toString(),
    poolLiquidity: liquidity.toString(),
    shares: lTokenBalance.toString(),
    shareValue: (lTokenTotalSupply.eq(0)
      ? bg(0)
      : liquidity.div(lTokenTotalSupply)
    ).toString(),
    maxRemovableShares: lTokenBalance.toString(),
  };
};

/**
 * Add liquidity to the CLP pool
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
export const addClpLiquidity = async (
  chainId,
  poolAddress,
  accountAddress,
  amount
) => {
  let res;
  const { bTokenAddress } = getLpConfig(chainId, poolAddress);
  if (bTokenAddress) {
    const clpPool = clpPoolFactory(chainId, poolAddress);
    //const bToken = bTokenFactory(chainId, bTokenAddress, poolAddress);
    try {
      const tx = await clpPool.addLiquidity(accountAddress, amount);
      console.log(tx, typeof tx);
      res = { success: true, transaction: tx };
    } catch (err) {
      res = { success: false, error: err };
    }
  } else {
    res = { success: false, error: 'unable to get bToken address of clp pool' };
  }
  return res;
};

/**
 * Remove liquidity of the CLP pool
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
export const removeClpLiquidity = async (
  chainId,
  poolAddress,
  accountAddress,
  amount
) => {
  let res;
  const { bTokenAddress } = getLpConfig(chainId, poolAddress);
  if (bTokenAddress) {
    const clpPool = clpPoolFactory(chainId, poolAddress);
    try {
      const tx = await clpPool.removeLiquidity(accountAddress, amount);
      res = { success: true, transaction: tx };
    } catch (err) {
      res = { success: false, error: err };
    }
  } else {
    res = { success: false, error: 'unable to get bToken address of clp pool' };
  }
  return res;
};

/**
 * Check account is unlocked in the Clp pool
 * @async
 * @method
 * @param {string} chainId
 * @param {string} poolAddress
 * @param {string} accountAddress
 * @returns {bool}
 */
export const isClpUnlocked = async (chainId, poolAddress, accountAddress) => {
  const { bTokenAddress } = getLpConfig(chainId, poolAddress);
  const bToken = bTokenFactory(chainId, bTokenAddress);
  //bToken.setAccount(accountAddress);
  return await bToken.isUnlocked(accountAddress, poolAddress);
};

/**
 * Unlock the account in the Clp pool
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
export const unlockClp = async (chainId, poolAddress, accountAddress) => {
  const { bTokenAddress } = getLpConfig(chainId, poolAddress);
  const bToken = bTokenFactory(chainId, bTokenAddress);
  //bToken.setAccount(accountAddress);

  let res;
  try {
    const tx = await bToken.unlock(accountAddress, poolAddress);
    res = { success: true, transaction: tx };
  } catch (err) {
    res = { success: false, error: err };
  }
  return res;
};

/**
 * Get account balance in Clp pool
 * @async
 * @method
 * @param {string} chainId
 * @param {string} accountAddress
 * @returns {string} Account balance
 */
export const getClpWalletBalance = async (
  chainId,
  poolAddress,
  accountAddress
) => {
  const { bTokenAddress } = getLpConfig(chainId, poolAddress);
  const bToken = bTokenFactory(chainId, bTokenAddress);
  //bToken.setAccount(accountAddress);
  const balance = await bToken.balanceOf(accountAddress);
  return balance.toString();
};
