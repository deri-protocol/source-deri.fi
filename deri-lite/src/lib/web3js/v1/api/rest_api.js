// const
import { getPoolV1Config } from '../../shared/config';
import { bg, deriToNatural, getHttpBase, fetchJson } from '../../shared/utils';
import {
  getTradeHistoryOnline,
} from './trade_history_api';
import { perpetualPoolFactory } from '../factory';

/**
 * Get specification from REST API, please refer {@link getSpecification}
 * @async
 * @method
 * @param {string} chainId
 * @param {string} poolAddress
 * @returns {Object}
 */
export const getSpecification2 = async (chainId, poolAddress) => {
  const res = await fetchJson(`${getHttpBase()}/specification/${poolAddress}`);
  if (res && res.success) {
    return res.data;
  }
  return res;
};

/**
 * Get funding rate from REST API, please refer {@link getFundingRate}
 * @async
 * @method
 * @param {string} chainId
 * @param {string} poolAddress
 * @returns {Object}
 */
export const getFundingRate2 = async (chainId, poolAddress) => {
  const res = await fetchJson(`${getHttpBase()}/funding_rate/${poolAddress}`);
  if (res && res.success) {
    return res.data;
  }
  return res;
};

/**
 * Get liquidity used from REST API, please refer {@link getLiquidityUsed}
 * @async
 * @method
 * @param {string} chainId
 * @param {string} poolAddress
 * @returns {Object}
 */
export const getLiquidityUsed2 = async (chainId, poolAddress) => {
  const res = await fetchJson(`${getHttpBase()}/liquidity_used/${poolAddress}`);
  if (res && res.success) {
    return res.data;
  }
  return res;
};

/**
 * Get funding rate cache from REST API, it used to 'fundingRateCache.update(chainId, poolAddress, result)'
 * @async
 * @method
 * @param {string} chainId
 * @param {string} poolAddress
 * @returns {Object}
 */
export const getFundingRateCache2 = async (chainId, poolAddress) => {
  const res = await fetchJson(
    `${getHttpBase()}/funding_rate_cache/${poolAddress}`
  );
  if (res && res.success) {
    let result = res.data;
    result.price = bg(result.price);
    result.fundingRate = bg(result.fundingRate);
    result.liquidityUsed = bg(result.liquidityUsed);
    return result;
  }
  return res;
};

/**
 * Get position info from REST API, please refer {@link getPositionInfo}
 * @async
 * @method
 * @param {string} chainId
 * @param {string} poolAddress
 * @param {string} accountAddress
 * @returns {Object}
 */
export const getPositionInfo2 = async (
  chainId,
  poolAddress,
  accountAddress
) => {
  const res = await fetchJson(
    `${getHttpBase()}/position_info/${chainId}/${poolAddress}/${accountAddress}`
  );
  if (res && res.success) {
    return res.data;
  }
  return res;
};

/**
 * Get liquidity info from REST API, please refer {@link getLiquidityInfo}
 * @async
 * @method
 * @param {string} chainId
 * @param {string} poolAddress
 * @param {string} accountAddress
 * @returns {Object}
 */
export const getLiquidityInfo2 = async (
  chainId,
  poolAddress,
  accountAddress
) => {
  const res = await fetchJson(
    `${getHttpBase()}/liquidity_info/${chainId}/${poolAddress}/${accountAddress}`
  );
  if (res && res.success) {
    return res.data;
  }
  return res;
};

/**
 * Get balance from REST API, please refer {@link getWalletBalance}
 * @async
 * @method
 * @param {string} chainId
 * @param {string} poolAddress
 * @param {string} accountAddress
 * @returns {Object}
 */
export const getWalletBalance2 = async (
  chainId,
  poolAddress,
  accountAddress
) => {
  const res = await fetchJson(
    `${getHttpBase()}/wallet_balance/${chainId}/${poolAddress}/${accountAddress}`
  );
  if (res && res.success) {
    return res.data;
  }
  return res;
};

/**
 * Get liquidity of the slp pool from REST API, please refer {@link getSlpLiquidityInfo}
 * @async
 * @method
 * @param {string} chainId
 * @param {string} poolAddress
 * @param {string} accountAddress
 * @returns {Object}
 */
export const getSlpLiquidityInfo2 = async (
  chainId,
  poolAddress,
  accountAddress
) => {
  const res = await fetchJson(
    `${getHttpBase()}/slp_liquidity_info/${chainId}/${poolAddress}/${accountAddress}`
  );
  if (res && res.success) {
    return res.data;
  }
  return res;
};

/**
 * Get balance of the slp pool from REST API, please refer {@link getSlpWalletBalance}
 * @async
 * @method
 * @param {string} chainId
 * @param {string} poolAddress
 * @param {string} accountAddress
 * @returns {Object}
 */
export const getSlpWalletBalance2 = async (
  chainId,
  poolAddress,
  accountAddress
) => {
  const res = await fetchJson(
    `${getHttpBase()}/slp_wallet_balance/${chainId}/${poolAddress}/${accountAddress}`
  );
  if (res && res.success) {
    return res.data;
  }
  return res;
};

/**
 * Get balance of the clp pool from REST API, please refer {@link getClpWalletBalance}
 * @async
 * @method
 * @param {string} chainId
 * @param {string} poolAddress
 * @param {string} accountAddress
 * @returns {Object}
 */
export const getClpLiquidityInfo2 = async (
  chainId,
  poolAddress,
  accountAddress
) => {
  const res = await fetchJson(
    `${getHttpBase()}/clp_liquidity_info/${chainId}/${poolAddress}/${accountAddress}`
  );
  if (res && res.success) {
    return res.data;
  }
  return res;
};

/**
 * Get balance of the clp pool from REST API, please refer {@link getSlpWalletBalance}
 * @async
 * @method
 * @param {string} chainId
 * @param {string} poolAddress
 * @param {string} accountAddress
 * @returns {Object}
 */
export const getClpWalletBalance2 = async (
  chainId,
  poolAddress,
  accountAddress
) => {
  const res = await fetchJson(
    `${getHttpBase()}/clp_wallet_balance/${chainId}/${poolAddress}/${accountAddress}`
  );
  if (res && res.success) {
    return res.data;
  }
  return res;
};

/**
 * Get balance of the deri pool from REST API, please refer {@link getDeriBalance}
 * @async
 * @method
 * @param {string} chainId
 * @param {string} poolAddress
 * @param {string} accountAddress
 * @returns {Object}
 */
export const getDeriBalance2 = async (chainId, poolAddress, accountAddress) => {
  const res = await fetchJson(
    `${getHttpBase()}/deri_balance/${chainId}/${poolAddress}/${accountAddress}`
  );
  if (res && res.success) {
    return res.data;
  }
  return res;
};

/**
 * Get the user trade history from REST API, please refer {@link getTradeHistory}
 * @async
 * @method
 * @param {string} chainId - Chain Id
 * @param {string} poolAddress - Pool Address
 * @param {string} accountAddress - Account Address
 * @returns {Object[]} response
 */
export const getTradeHistory2 = async (
  chainId,
  poolAddress,
  accountAddress
) => {
  let tradeFromBlock, liquidateFromBlock, tradeHistory;
  const { bTokenSymbol } = getPoolV1Config(chainId, poolAddress);
  const res = await fetchJson(
    `${getHttpBase()}/trade_history/${chainId}/${poolAddress}/${accountAddress}`
  );
  if (res && res.success) {
    tradeFromBlock = parseInt(res.data.tradeHistoryBlock);
    liquidateFromBlock = parseInt(res.data.liquidateHistoryBlock);
    tradeHistory = res.data.tradeHistory;
  }

  const perpetualPool = perpetualPoolFactory(chainId, poolAddress);
  const {
    multiplier,
  } = await perpetualPool.getParameters();
  tradeHistory = tradeHistory.filter((i) => i).map((i) => {
    return {
      direction: i.direction.trim(),
      baseToken: bTokenSymbol,
      price: deriToNatural(i.price).toString(),
      notional: deriToNatural(i.notional).toString(),
      volume: deriToNatural(i.volume).times(multiplier).toString(),
      transactionFee: deriToNatural(i.transactionFee).toString(),
      transactionHash: i.transactionHash,
      time: i.time.toString(),
    };
  });
  if (tradeFromBlock !== 0 && liquidateFromBlock !== 0) {
    // console.log(tradeFromBlock, liquidateFromBlock)
    const [tradeHistoryOnline ] = await Promise.all([
      getTradeHistoryOnline(
        chainId,
        poolAddress,
        accountAddress,
        tradeFromBlock + 1
      )
    ]);
    const result = tradeHistoryOnline.concat(tradeHistory);
    return result.sort((a, b) => parseInt(b.time) - parseInt(a.time));
  } else {
    const { initialBlock } = getPoolV1Config(chainId, poolAddress);
    tradeFromBlock = parseInt(initialBlock);
    liquidateFromBlock = parseInt(initialBlock);
    const [tradeHistoryOnline] = await Promise.all([
      getTradeHistoryOnline(
        chainId,
        poolAddress,
        accountAddress,
        tradeFromBlock + 1
      ),
    ]);
    const result = tradeHistoryOnline
    return result.sort((a, b) => parseInt(b.time) - parseInt(a.time));
  }
};
