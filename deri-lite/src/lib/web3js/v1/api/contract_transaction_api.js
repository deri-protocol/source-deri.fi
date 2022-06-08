import {
  bTokenFactory,
  bg,
  formatBN,
  naturalToDeri,
  getPoolV1Config,
  deriToNatural,
} from '../../shared';
import {
  lTokenFactory,
  pTokenFactory,
  perpetualPoolFactory,
} from '../factory';
import { getPriceInfoForV1 } from '../../shared/utils/oracle'
import {
  calculateMaxRemovableShares,
  calculateMaxWithdrawMargin,
  isOrderValid,
} from '../calculation';

/**
 * Unlock the account in the perpetual pool
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
export const unlock = async (chainId, poolAddress, accountAddress) => {
  const { bTokenAddress } = getPoolV1Config(chainId, poolAddress);
  const bToken = bTokenFactory(chainId, bTokenAddress, poolAddress);
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
 * Deposit margin in the perpetual pool
 * @async
 * @method
 * @param {string} chainId
 * @param {string} poolAddress
 * @param {string} accountAddress
 * @param {string|number} amount
 * @returns {Object} response
 * @returns {boolean} response.success
 * @returns {boolean} response.[error] - error message when request failed
 * @returns {Object} response.transaction - eth transaction receipt object
 */
export const depositMargin = async (
  chainId,
  poolAddress,
  accountAddress,
  amount
) => {
  const pPool = perpetualPoolFactory(chainId, poolAddress);
  return await pPool.depositMargin(accountAddress, naturalToDeri(amount));
};

/**
 * Withdraw margin in the perpetual pool
 * @async
 * @method
 * @param {string} chainId
 * @param {string} poolAddress
 * @param {string} accountAddress
 * @param {string} amount
 * @returns {Object} response
 * @returns {boolean} response.success
 * @returns {boolean} response.[error] - error message when request failed
 * @returns {Object} response.transaction - eth transaction receipt object
 */
export const withdrawMargin = async (
  chainId,
  poolAddress,
  accountAddress,
  amount
) => {
  let res;
  const { pTokenAddress, symbol } = getPoolV1Config(chainId, poolAddress);
  const pPool = perpetualPoolFactory(chainId, poolAddress);
  //pPool.setAccount(accountAddress);
  const pToken = pTokenFactory(chainId, pTokenAddress, poolAddress);
  //pToken.setAccount(accountAddress);

  const price = deriToNatural((await getPriceInfoForV1(symbol)).price).toString();
  const { volume, margin, cost } = await pToken.getPositionInfo(accountAddress);
  const { multiplier, minInitialMarginRatio } = await pPool.getParameters();

  const maxWithdrawMargin = calculateMaxWithdrawMargin(
    price,
    volume,
    margin,
    cost,
    multiplier,
    minInitialMarginRatio
  );
  if (bg(amount).lte(maxWithdrawMargin)) {
    try {
      const tx = await pPool._transact(
        'withdrawMargin(uint256,uint256,uint256,uint8,bytes32,bytes32)',
        [naturalToDeri(amount)],
        accountAddress
      );
      res = { success: true, transaction: tx };
    } catch (err) {
      res = { success: false, error: err };
    }
  } else {
    res = { success: false, error: 'amount exceeds allowed' };
  }
  return res;
};

/**
 * Mint in the perpetual pool
 * @async
 * @method
 * @param {string} chainId
 * @param {string} poolAddress
 * @param {string} accountAddress
 * @param {string} amount
 * @returns {Object} response
 * @returns {boolean} response.success
 * @returns {boolean} response.[error] - error message when request failed
 * @returns {Object} response.transaction - eth transaction receipt object
 */
export const mint = async (chainId, poolAddress, accountAddress, amount) => {
  const { bTokenAddress } = getPoolV1Config(chainId, poolAddress);
  //const pPool = perpetualPoolFactory(chainId, poolAddress);
  //pPool.setAccount(accountAddress);
  const bToken = bTokenFactory(chainId, bTokenAddress, poolAddress);
  //bToken.setAccount(accountAddress);
  const decimals = await bToken.decimals();
  const BONE = 10 ** decimals;
  amount = formatBN(bg(amount).multipliedBy(BONE));
  let res;
  try {
    const tx = await bToken._transact('mint', [amount], accountAddress);
    res = { success: true, transaction: tx };
  } catch (error) {
    res = { success: false, error };
  }
  return res;
};

/**
 * Add liquidity in the perpertual pool
 * @async
 * @method
 * @param {string} chainId
 * @param {string} poolAddress
 * @param {string} accountAddress
 * @param {string} amount
 * @returns {Object} response
 * @returns {boolean} response.success
 * @returns {boolean} response.[error] - error message when request failed
 * @returns {Object} response.transaction - eth transaction receipt object
 */
export const addLiquidity = async (
  chainId,
  poolAddress,
  accountAddress,
  amount
) => {
  const pPool = perpetualPoolFactory(chainId, poolAddress);
  //pPool.setAccount(accountAddress);
  let res;
  try {
    const tx = await pPool._transact(
      'addLiquidity(uint256,uint256,uint256,uint8,bytes32,bytes32)',
      [naturalToDeri(amount)],
      accountAddress
    );
    res = { success: true, transaction: tx };
  } catch (err) {
    res = { success: false, error: err };
  }
  return res;
};

/**
 * Remove liquidity in the perpertual pool
 * @async
 * @method
 * @param {string} chainId
 * @param {string} poolAddress
 * @param {string} accountAddress
 * @param {string} shares
 * @returns {Object} response
 * @returns {boolean} response.success
 * @returns {boolean} response.[error] - error message when request failed
 * @returns {Object} response.transaction - eth transaction receipt object
 */
export const removeLiquidity = async (
  chainId,
  poolAddress,
  accountAddress,
  shares
) => {
  const { lTokenAddress, symbol } = getPoolV1Config(chainId, poolAddress);
  const pPool = perpetualPoolFactory(chainId, poolAddress);
  //pPool.setAccount(accountAddress);
  const lToken = lTokenFactory(chainId, lTokenAddress, poolAddress);
  //lToken.setAccount(accountAddress);
  const price = deriToNatural((await getPriceInfoForV1(symbol)).price).toString();

  const [lTokenBalance, lTokenTotalSupply] = await Promise.all([
    lToken.balance(accountAddress),
    lToken.totalSupply(),
  ]);
  const { multiplier, minPoolMarginRatio } = await pPool.getParameters();
  const {
    liquidity,
    tradersNetVolume,
    tradersNetCost,
  } = await pPool.getStateValues();

  const maxRemovableShares = calculateMaxRemovableShares(
    lTokenBalance,
    lTokenTotalSupply,
    liquidity,
    tradersNetVolume,
    tradersNetCost,
    multiplier,
    minPoolMarginRatio,
    price
  );
  let res;
  if (bg(shares).lte(maxRemovableShares)) {
    try {
      const tx = await pPool._transact(
        'removeLiquidity(uint256,uint256,uint256,uint8,bytes32,bytes32)',
        [naturalToDeri(shares)],
        accountAddress
      );
      res = { success: true, transaction: tx };
    } catch (err) {
      res = { success: false, error: err };
    }
  } else {
    res = { success: false, error: 'shares exceeds allowed' };
  }
  return res;
};

/**
 * Trade with margin in the perpertual pool
 * @async
 * @method
 * @param {string} chainId
 * @param {string} poolAddress
 * @param {string} accountAddress
 * @param {string} newVolume
 * @param {string} amount
 * @returns {Object} response
 * @returns {boolean} response.success
 * @returns {boolean} response.[error] - error message when request failed
 * @returns {Object} response.transaction - eth transaction receipt object
 */
export const tradeWithMargin = async (
  chainId,
  poolAddress,
  accountAddress,
  newVolume,
  amount = '0'
) => {
  const { pTokenAddress, symbol } = getPoolV1Config(chainId, poolAddress);
  const pPool = perpetualPoolFactory(chainId, poolAddress);
  const pToken = pTokenFactory(chainId, pTokenAddress, poolAddress);
  const price = deriToNatural((await getPriceInfoForV1(symbol)).price).toString();
  const {
    multiplier,
    minInitialMarginRatio,
    minPoolMarginRatio,
  } = await pPool.getParameters();
  const { liquidity, tradersNetVolume } = await pPool.getStateValues();
  const { volume, margin } = await pToken.getPositionInfo(accountAddress);
  let res;
  const orderValidation = isOrderValid(
    price,
    margin,
    volume,
    liquidity,
    tradersNetVolume,
    multiplier,
    minPoolMarginRatio,
    minInitialMarginRatio,
    bg(newVolume),
    bg(amount)
  );
  if (orderValidation.success) {
    try {
      const tx = await pPool._transact(
        'tradeWithMargin(int256,uint256,uint256,uint256,uint8,bytes32,bytes32)',
        [naturalToDeri(newVolume), naturalToDeri(amount)],
        accountAddress
      );
      res = { success: true, transaction: tx };
    } catch (err) {
      res = { success: false, error: err };
    }
  } else {
    res = { success: false, error: orderValidation.message };
  }
  return res;
};

/**
 * Close position in the perpertual pool
 * @async
 * @method
 * @param {string} chainId
 * @param {string} poolAddress
 * @param {string} accountAddress
 * @returns {Object} response
 * @returns {boolean} response.success
 * @returns {boolean} response.[error] - error message when request failed
 * @returns {Object} response.transaction - eth transaction receipt object
 */
export const closePosition = async (chainId, poolAddress, accountAddress) => {
  const { pTokenAddress } = getPoolV1Config(chainId, poolAddress);
  const pPool = perpetualPoolFactory(chainId, poolAddress);
  //pPool.setAccount(accountAddress);
  const pToken = pTokenFactory(chainId, pTokenAddress, poolAddress);
  //pToken.setAccount(accountAddress);
  let { volume } = await pToken.getPositionInfo(accountAddress);
  volume = volume.negated();
  let res;
  if (!volume.eq(0)) {
    try {
      const tx = await pPool._transact(
        'tradeWithMargin(int256,uint256,uint256,uint256,uint8,bytes32,bytes32)',
        [naturalToDeri(volume), '0'],
        accountAddress
      );
      res = { success: true, transaction: tx };
    } catch (err) {
      res = { success: false, error: err };
    }
  } else {
    res = { success: false, error: 'no position to close' };
  }
  return res;
};
