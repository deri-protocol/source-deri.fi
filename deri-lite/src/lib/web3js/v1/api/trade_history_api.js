import {
  //naturalToDeri,
  deriToNatural,
  hexToString,
  toChecksumAddress,
  hexToNumber,
  hexToNumberString,
  bg,
} from '../../shared/utils';
import { getPoolV1Config } from '../../shared/config';

import { databaseFactory } from '../../shared/factory';
import { perpetualPoolFactory } from '../factory';

const processTradeEvent = async (
  perpetualPool,
  bTokenSymbol,
  info,
  blockNumber,
  txHash,
  multiplier,
  feeRatio
) => {
  const tradeVolume = deriToNatural(info.tradeVolume);
  const timeStamp = await perpetualPool._getTimeStamp(blockNumber);

  const direction = tradeVolume.gt(0) ? 'LONG' : 'SHORT';
  const price = deriToNatural(info.price);
  const time = `${+timeStamp.timestamp}000`;
  const transactionFee = perpetualPool._calculateFee(
    tradeVolume,
    price,
    multiplier,
    feeRatio
  );
  const notional = tradeVolume.abs().times(price).times(multiplier);
  const volume = tradeVolume.abs();

  const res = {
    direction,
    baseToken: bTokenSymbol,
    price: price.toString(),
    notional: notional.toString(),
    volume: bg(volume).times(multiplier).toString(),
    transactionFee: transactionFee.toString(),
    transactionHash: txHash.toString(),
    time,
  };
  // console.log(JSON.stringify(res))
  return res;
};

const processLiquidateEvent = async (
  info,
  txHash,
  bTokenSymbol,
  multiplier
) => {
  // console.log(info)
  const volume = deriToNatural(info.volume).abs();
  // const cost = deriToNatural(info.cost).abs()
  // const margin = info.margin
  const timestamp = `${info.timestamp}000`;
  const price = deriToNatural(info.price);
  // const liquidator = info.liquidator
  // const reward = info.reward
  const national = volume.times(price).times(multiplier);
  // const transactionFee = volume.times(price).times(multiplier).times(feeRatio)

  const res = {
    direction: 'Liquidation',
    baseToken: bTokenSymbol,
    price: price.toString(),
    notional: national.toString(),
    volume: bg(volume).times(multiplier).toString(),
    transactionFee: '0',
    transactionHash: txHash.toString(),
    time: timestamp,
    // cost: naturalToDeri(cost).toString(),
    // margin: margin.toString(),
    // liquidator,
    // reward: reward.toString(),
  };
  return res;
};

/**
 * Get the user trade history
 * @async
 * @method
 * @param {string} chainId - Chain Id
 * @param {string} poolAddress - Pool Address
 * @param {string} accountAddress - Account Address
 * @returns {Object[]} response
 * @returns {string} response[].direction
 * @returns {string} response[].baseToken
 * @returns {string} response[].price
 * @returns {string} response[].notional
 * @returns {string} response[].volume
 * @returns {string} response[].transactionFee
 * @returns {string} response[].time - Timestamp of the trade
 */

export const getTradeHistory = async (chainId, poolAddress, accountAddress) => {
  const keyMeta = `${chainId}.${poolAddress}`;
  const db = databaseFactory();
  let [tradeFromBlock, liquidateFromBlock] = await Promise.all([
    db.getValues([`${keyMeta}.tradeHistoryBlock`]),
    db.getValues([`${keyMeta}.liquidateHistoryBlock`]),
  ]);
  tradeFromBlock = hexToNumber(tradeFromBlock[0]);
  liquidateFromBlock = hexToNumber(liquidateFromBlock[0]);
  if (tradeFromBlock !== 0 && liquidateFromBlock !== 0) {
    // console.log(tradeFromBlock, liquidateFromBlock)
    const [
      tradeHistoryOffline,
      tradeHistoryOnline,
      liquidateHistoryOffline,
      liquidateHistoryOnline,
    ] = await Promise.all([
      getTradeHistoryOffline(chainId, poolAddress, accountAddress),
      getTradeHistoryOnline(
        chainId,
        poolAddress,
        accountAddress,
        tradeFromBlock + 1
      ),
      getLiquidateHistoryOffline(chainId, poolAddress, accountAddress),
      getLiquidateHistoryOnline(
        chainId,
        poolAddress,
        accountAddress,
        liquidateFromBlock + 1
      ),
    ]);
    const result = tradeHistoryOnline
      .concat(liquidateHistoryOnline)
      .concat(tradeHistoryOffline)
      .concat(liquidateHistoryOffline);
    return result.sort((a, b) => parseInt(b.time) - parseInt(a.time));
  } else {
    const { initialBlock } = getPoolV1Config(chainId, poolAddress);
    tradeFromBlock = parseInt(initialBlock);
    liquidateFromBlock = parseInt(initialBlock);
    const [tradeHistoryOnline, liquidateHistoryOnline] = await Promise.all([
      getTradeHistoryOnline(
        chainId,
        poolAddress,
        accountAddress,
        tradeFromBlock + 1
      ),
      getLiquidateHistoryOnline(
        chainId,
        poolAddress,
        accountAddress,
        liquidateFromBlock + 1
      ),
    ]);
    const result = tradeHistoryOnline.concat(liquidateHistoryOnline);
    return result.sort((a, b) => parseInt(b.time) - parseInt(a.time));
  }
};

// get trade history combined from cache and from online pull
const getTradeHistoryOffline = async (chainId, poolAddress, accountAddress) => {
  // console.log(chainId, poolAddress, accountAddress)
  let result = [];
  // use dev database
  const db = databaseFactory();
  const keyBlock = `${chainId}.${poolAddress}.tradeHistoryBlock`;
  const keyMeta = `${chainId}.${poolAddress}.${toChecksumAddress(
    accountAddress
  )}.trade`;
  //const [res, fromBlock] = await db.getValues([`${keyMeta}.count`, keyBlock]);
  const [res] = await db.getValues([`${keyMeta}.count`, keyBlock]);
  const count = hexToNumber(res);

  const perpetualPool = perpetualPoolFactory(chainId, poolAddress);
  const {
    multiplier,
  } = await perpetualPool.getParameters();
  try {
    if (count && count >= 0) {
      let keyArray = [];
      for (let i = count; i > 0; i--) {
        const key = `${keyMeta}.${i.toString()}`;
        keyArray = keyArray.concat([
          `${key}.direction`,
          `${key}.baseToken`,
          `${key}.price`,
          `${key}.notional`,
          `${key}.volume`,
          `${key}.transactionFee`,
          `${key}.transactionHash`,
          `${key}.time`,
        ]);
      }
      // console.log(keyArray)
      const tradeHistoryLength = keyArray.length / 8;
      // console.log(`trade history length: ${tradeHistoryLength}`)
      const resp = await db.getValues(keyArray);
      for (let i = 0; i < tradeHistoryLength; i++) {
        const indexBase = i * 8;
        //console.log(resp[indexBase + 6].trim());
        const item = {
          direction: hexToString(resp[indexBase]).trim(),
          baseToken: hexToString(resp[indexBase + 1]).trim(),
          price: deriToNatural(resp[indexBase + 2]).toString(),
          notional: deriToNatural(resp[indexBase + 3]).toString(),
          volume: bg(deriToNatural(resp[indexBase + 4])).times(multiplier).toString(),
          transactionFee: deriToNatural(resp[indexBase + 5]).toString(),
          transactionHash: resp[indexBase + 6],
          time: hexToNumberString(resp[indexBase + 7]).toString(),
        };
        result.push(item);
      }
    } else {
      result = [];
    }
  } catch (err) {
    console.log(err);
    result = [];
  }
  return result;
};

// get trade history online from the Block number
export const getTradeHistoryOnline = async (
  chainId,
  poolAddress,
  accountAddress,
  fromBlock
) => {
  const { bTokenSymbol } = getPoolV1Config(chainId, poolAddress);
  // console.log(poolAddr, bTokenAddress);
  const perpetualPool = perpetualPoolFactory(chainId, poolAddress);
  //perpetualPool.setAccount(accountAddress);
  const toBlock = await perpetualPool._getBlockInfo('latest');
  fromBlock = parseInt(fromBlock);
  const filters = { owner: accountAddress };
  const events = await perpetualPool._getPastEvents(
    'Trade',
    filters,
    fromBlock,
    toBlock.number
  );
  const {
    multiplier,
    feeRatio,
    minInitialMarginRatio,
  } = await perpetualPool.getParameters();

  const result = [];
  // console.log("events length:", events.length);
  for (let i = 0; i < events.length; i++) {
    const item = events[i];
    // const info = item.returnValues;
    const res = await processTradeEvent(
      perpetualPool,
      bTokenSymbol,
      item.returnValues,
      item.blockNumber,
      item.transactionHash,
      multiplier,
      feeRatio,
      minInitialMarginRatio
    );
    result.unshift(res);
  }
  return result;
};

// get liquidate history online from the Block number
export const getLiquidateHistoryOnline = async (
  chainId,
  poolAddress,
  accountAddress,
  fromBlock
) => {
  const { bTokenSymbol } = getPoolV1Config(chainId, poolAddress);
  // console.log(poolAddr, bTokenAddress);
  const perpetualPool = perpetualPoolFactory(chainId, poolAddress);
  //perpetualPool.setAccount(accountAddress);
  const toBlock = await perpetualPool._getBlockInfo('latest');
  fromBlock = parseInt(fromBlock);
  const filters = { owner: accountAddress };
  const events = await perpetualPool._getPastEvents(
    'Liquidate',
    filters,
    fromBlock,
    toBlock.number
  );
  const { multiplier } = await perpetualPool.getParameters();

  const result = [];
  // console.log("events length:", events.length);
  for (let i = 0; i < events.length; i++) {
    const item = events[i];
    // const info = item.returnValues;
    const res = await processLiquidateEvent(
      item.returnValues,
      item.transactionHash,
      bTokenSymbol,
      multiplier
    );
    result.unshift(res);
  }
  return result;
};

// get trade history combined from cache and from online pull
const getLiquidateHistoryOffline = async (
  chainId,
  poolAddress,
  accountAddress
) => {
  let result = [];
  // use dev database
  const db = databaseFactory();
  const keyBlock = `${chainId}.${poolAddress}.liquidateHistoryBlock`;
  const keyMeta = `${chainId}.${poolAddress}.${toChecksumAddress(
    accountAddress
  )}.liquidate`;
  //const [res, fromBlock] = await db.getValues([`${keyMeta}.count`, keyBlock]);
  const [res] = await db.getValues([`${keyMeta}.count`, keyBlock]);
  const count = hexToNumber(res);

  const perpetualPool = perpetualPoolFactory(chainId, poolAddress);
  const {
    multiplier,
  } = await perpetualPool.getParameters();
  try {
    if (count && count >= 0) {
      let keyArray = [];
      for (let i = count; i > 0; i--) {
        const key = `${keyMeta}.${i.toString()}`;
        keyArray = keyArray.concat([
          `${key}.direction`,
          `${key}.baseToken`,
          `${key}.price`,
          `${key}.notional`,
          `${key}.volume`,
          `${key}.transactionFee`,
          `${key}.transactionHash`,
          `${key}.time`,
        ]);
      }
      // console.log(keyArray)
      const liquidateHistoryLength = keyArray.length / 8;
      const resp = await db.getValues(keyArray);
      for (let i = 0; i < liquidateHistoryLength; i++) {
        const indexBase = i * 8;
        const item = {
          direction: hexToString(resp[indexBase]).trim(),
          baseToken: hexToString(resp[indexBase + 1]).trim(),
          price: deriToNatural(resp[indexBase + 2]).toString(),
          notional: deriToNatural(resp[indexBase + 3]).toString(),
          volume: bg(deriToNatural(resp[indexBase + 4])).times(multiplier).toString(),
          transactionFee: deriToNatural(resp[indexBase + 5]).toString(),
          transactionHash: resp[indexBase + 6],
          time: hexToNumberString(resp[indexBase + 7]).toString(),
        };
        result.push(item);
      }
    } else {
      result = [];
    }
  } catch (err) {
    console.log(err);
    result = [];
  }
  return result;
};
