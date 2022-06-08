import { getDeriConfig } from '../config';
import {
  deriFactory,
  databaseWormholeFactory,
} from '../factory';
/**
 * Get user signature of the wormhole pool
 * @async
 * @method
 * @param {string} accountAddress
 * @returns {Object}
 */
export const getUserWormholeSignature = async (accountAddress) => {
  const databaseWormhole = databaseWormholeFactory(true);
  return await databaseWormhole.signature(accountAddress);
};

/**
 * Check account is unlocked in the deri pool
 * @async
 * @method
 * @param {string} chainId
 * @param {string} accountAddress
 * @returns {bool}
 */
export const isDeriUnlocked = async (chainId, accountAddress) => {
  const { wormholeAddress, deriAddress } = getDeriConfig(chainId);
  const deri = deriFactory(chainId, deriAddress);
  //deri.setAccount(accountAddress).setPool(wormholeAddress);
  return await deri.isUnlocked(accountAddress, wormholeAddress);
};

/**
 * Get deri balance in the deri pool
 * @async
 * @method
 * @param {string} chainId
 * @param {string} accountAddress
 * @returns {string}
 */
export const getDeriBalance = async (chainId, accountAddress) => {
  const { deriAddress } = getDeriConfig(chainId);
  const deri = deriFactory(chainId, deriAddress);
  return (await deri.balanceOf(accountAddress)).toString();
};