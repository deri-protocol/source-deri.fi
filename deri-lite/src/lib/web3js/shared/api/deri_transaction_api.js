import {
  miningVaultPoolFactory,
  miningVaultRouterFactory,
  wormholeFactory,
  deriFactory,
  databaseWormholeFactory,
} from '../factory';
import { getUserInfoAll, getUserInfoAllForAirDrop } from '../api/database_api';
import {
  getDeriConfig,
  getMiningVaultRouterConfig,
  getMiningVaultConfig,
} from '../config';
import { naturalToDeri } from '../../shared/utils';

/**
 * Mint DToken in the perpertual pool
 * @async
 * @method
 * @param {string} chainId
 * @param {string} poolAddress
 * @returns {Object} response
 * @returns {boolean} response.success
 * @returns {boolean} response.[error] - error message when request failed
 * @returns {Object} response.transaction - eth transaction receipt object
 */
export const mintDToken = async (chainId, accountAddress) => {
  let res;
  const userInfo = await getUserInfoAll(accountAddress);
  const amount = naturalToDeri(userInfo.amount);
  const { deadline, nonce, v, r, s } = userInfo;
  // const { nonce } = userInfo;
  // const { v } = userInfo;
  // const { r } = userInfo;
  // const { s } = userInfo;
  if (userInfo.valid) {
    const miningVaultAddress = getMiningVaultConfig(chainId);
    if (miningVaultAddress) {
      const miningVault = miningVaultPoolFactory(chainId, miningVaultAddress);
      //miningVault.setAccount(accountAddress);
      try {
        const tx = await miningVault.mintDToken(
          accountAddress,
          amount,
          deadline,
          nonce,
          v,
          r,
          s
        );
        res = { success: true, transaction: tx };
      } catch (err) {
        res = { success: false, error: err };
      }
    } else {
      res = {
        success: false,
        error: `cannot find the mining vault address in chain ${chainId}`,
      };
    }
  } else {
    res = {
      success: false,
      error: 'userinfo is not valid',
    };
  }
  return res;
};

/**
 * freeze Deri in current wormhole pool to the specified chain
 * @async
 * @method
 * @param {string} chainId
 * @param {string} accountAddress
 * @param {string} toChainId
 * @param {string} amount
 * @returns {Object} response
 * @returns {boolean} response.success
 * @returns {boolean} response.[error] - error message when request failed
 * @returns {Object} response.transaction - eth transaction receipt object
 */
export const freeze = async (chainId, accountAddress, toChainId, amount) => {
  const { wormholeAddress } = getDeriConfig(chainId);
  const wormhole = wormholeFactory(chainId, wormholeAddress);
  //wormhole.setAccount(accountAddress);
  let res;
  try {
    const tx = await wormhole.freeze(accountAddress, amount, toChainId);
    res = { success: true, transaction: tx };
  } catch (error) {
    res = { success: false, error };
  }
  return res;
};

/**
 * Mint Deri in wormhole pool
 * @async
 * @method
 * @param {string} toChainId
 * @param {string} accountAddress
 * @returns {Object} response
 * @returns {boolean} response.success
 * @returns {boolean} response.[error] - error message when request failed
 * @returns {Object} response.transaction - eth transaction receipt object
 */
export const mintDeri = async (toChainId, accountAddress) => {
  let res;
  const databaseWormhole = databaseWormholeFactory(true);
  // const userInfo = await getUserInfoAll(accountAddress);
  const userInfo = await databaseWormhole.signature(accountAddress);
  // console.log(userInfo)
  const {
    amount,
    fromChainId,
    fromWormhole,
    nonce: fromNonce,
    v,
    r,
    s,
  } = userInfo;
  // const { fromChainId } = userInfo;
  // const { fromWormhole } = userInfo;
  // const fromNonce = userInfo.nonce;
  // const { v } = userInfo;
  // const { r } = userInfo;
  // const { s } = userInfo;
  if (userInfo.valid) {
    const { wormholeAddress } = getDeriConfig(toChainId);
    if (wormholeAddress) {
      const wormhole = wormholeFactory(toChainId, wormholeAddress);
      //wormhole.setAccount(accountAddress);
      try {
        const tx = await wormhole.mintDeri(
          accountAddress,
          amount,
          fromChainId,
          fromWormhole,
          fromNonce,
          v,
          r,
          s
        );
        res = { success: true, transaction: tx };
      } catch (err) {
        res = { success: false, error: err };
      }
    } else {
      res = {
        success: false,
        error: `cannot find the wormhole address in chain ${fromChainId}`,
      };
    }
  } else {
    res = {
      success: false,
      error: 'userinfo is not valid',
    };
  }
  return res;
};

/**
 * Unlock the account in the deri pool
 * @async
 * @method
 * @param {string} chainId
 * @param {string} accountAddress
 * @returns {Object} response
 * @returns {boolean} response.success
 * @returns {string} response.[error]
 * @returns {Object} response.transaction - eth transaction receipt object
 */
export const unlockDeri = async (chainId, accountAddress) => {
  const { wormholeAddress, deriAddress } = getDeriConfig(chainId);
  const deri = deriFactory(chainId, deriAddress);
  //deri.setAccount(accountAddress).setPool(wormholeAddress);
  let res;
  try {
    const tx = await deri.unlock(accountAddress, wormholeAddress);
    res = { success: true, transaction: tx };
  } catch (error) {
    res = { success: false, error };
  }
  return res;
};

/**
 * Mint Airdrop in the perpertual pool
 * @async
 * @method
 * @param {string} chainId
 * @param {string} poolAddress
 * @returns {Object} response
 * @returns {boolean} response.success
 * @returns {boolean} response.[error] - error message when request failed
 * @returns {Object} response.transaction - eth transaction receipt object
 */
export const mintAirdrop = async (chainId, accountAddress) => {
  let res;
  const userInfo = await getUserInfoAllForAirDrop(accountAddress);
  const amount = naturalToDeri(userInfo.amount).toString();
  const { deadline, nonce, v1, r1, s1, v2, r2, s2 } = userInfo;
  if (userInfo.valid) {
    const miningVaultAddress = getMiningVaultRouterConfig(chainId);
    // console.log("miningVaultAddress", miningVaultAddress)
    // console.log("userInfo", userInfo)
    if (miningVaultAddress) {
      const miningVaultRouter = miningVaultRouterFactory(
        chainId,
        miningVaultAddress
      );
      try {
        const tx = await miningVaultRouter.mint(
          accountAddress,
          amount,
          deadline,
          nonce,
          v1,
          r1,
          s1,
          v2,
          r2,
          s2
        );
        res = { success: true, transaction: tx };
      } catch (err) {
        res = { success: false, error: err };
      }
    } else {
      res = {
        success: false,
        error: `cannot find the mining vault router address in chain ${chainId}`,
      };
    }
  } else {
    res = {
      success: false,
      error: 'userinfo is not valid',
    };
  }
  return res;
};