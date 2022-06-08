import { catchApiError } from '../../shared/utils/api';

import {
  deriToNatural,
  getBlockInfo,
  getPastEvents,
  getHttpBase,
  fetchJson,
  bg,
} from '../../shared/utils';
import {
  getPoolConfig,
} from '../../shared/config';
import { perpetualPoolDpmmFactory, } from '../contract/factory';

const getTradeHistoryOnline = async (
  chainId,
  poolAddress,
  accountAddress,
  symbolId,
  fromBlock
) => {

  const perpetualPool = perpetualPoolDpmmFactory(chainId, poolAddress);
  await perpetualPool.init()
  const toBlock = await getBlockInfo(chainId, 'latest');
  fromBlock = parseInt(fromBlock);

  const filters = { trader: accountAddress };
  let events = await getPastEvents(
    chainId,
    perpetualPool.contract,
    'Trade',
    filters,
    fromBlock,
    toBlock.number
  );

  const result = [];
  //events = events.filter((i) => i.returnValues.symbolId === symbolId);
  //console.log("events length:", events.length);
  for (let i = 0; i < events.length; i++) {
    const item = events[i];
    const res = await perpetualPool.formatTradeEvent(item);
    if (res) {
      const symbolIndex = perpetualPool.activeSymbolIds.indexOf(res.symbolId);
      result.unshift({
        baseToken: '',
        direction: res.direction,
        volume: bg(res.volume)
          .times(perpetualPool.symbols[symbolIndex].multiplier)
          .toString(),
        price: res.price,
        indexPrice: res.indexPrice,
        notional: res.notional,
        symbol: res.symbol,
        symbolId: res.symbolId,
        time: res.time,
        transactionFee: res.transactionFee,
        transactionHash: res.transactionHash,
      });
    }
  }
  return result;
};

export const getTradeHistory = async (
  chainId,
  poolAddress,
  accountAddress,
  symbolId
) => {
  try {
    let tradeFromBlock,
      tradeHistory = [];
    const res = await fetchJson(
      `${getHttpBase()}/trade_history/${chainId}/${poolAddress}/${accountAddress}/${symbolId}`
    );
    if (res && res.success) {
      tradeFromBlock = parseInt(res.data.tradeHistoryBlock);
      if (res.data.tradeHistory && Array.isArray(res.data.tradeHistory)) {
        tradeHistory = res.data.tradeHistory;
      }
    }
    const perpetualPool = perpetualPoolDpmmFactory(chainId, poolAddress);
    await perpetualPool.init()
    if (tradeHistory.length > 0) {
      tradeHistory = tradeHistory
        .map((i) => {
          const symbolIndex = perpetualPool.activeSymbolIds.indexOf(i.symbolId)
          if (symbolIndex > -1) {
            return {
              direction: i.direction.trim(),
              baseToken: '',
              symbolId: i.symbolId,
              symbol: i.symbol,
              price: deriToNatural(i.price).toString(),
              notional: deriToNatural(i.notional).toString(),
              volume: deriToNatural(i.volume).times(perpetualPool.symbols[symbolIndex].multiplier).toString(),
              transactionFee: deriToNatural(i.transactionFee).toString(),
              transactionHash: i.transactionHash,
              time: i.time.toString(),
            };
          } else if (i.direction === 'LIQUIDATION') {
            return {
              direction: i.direction.trim(),
              baseToken: '',
              symbolId: i.symbolId ? i.symbolId : '',
              symbol: i.symbol ? i.symbol : '',
              price: i.price ? deriToNatural(i.price).toString() : '',
              notional: i.notional ? deriToNatural(i.notional).toString() : '',
              volume: i.volume ? deriToNatural(i.volume).times(perpetualPool.symbols[symbolIndex].multiplier).toString() : '',
              transactionFee: deriToNatural(i.transactionFee).toString(),
              transactionHash: i.transactionHash,
              time: i.time.toString(),
            }
          } else {
            return null
          }
        }).filter((i) => i != null)
    }
    //console.log('tradeHistory1',tradeHistory)
    if (tradeFromBlock !== 0) {
      const [tradeHistoryOnline] = await Promise.all([
        getTradeHistoryOnline(
          chainId,
          poolAddress,
          accountAddress,
          symbolId,
          tradeFromBlock + 1
        ),
      ]);
      const result = tradeHistoryOnline.concat(tradeHistory);
      return result.sort((a, b) => parseInt(b.time) - parseInt(a.time));
    } else {
      const { initialBlock } = getPoolConfig(poolAddress);
      tradeFromBlock = parseInt(initialBlock);
      const [tradeHistoryOnline] = await Promise.all([
        getTradeHistoryOnline(
          chainId,
          poolAddress,
          accountAddress,
          symbolId,
          tradeFromBlock + 1
        ),
      ]);
      const result = tradeHistoryOnline;
      return result.sort((a, b) => parseInt(b.time) - parseInt(a.time));
    }
  } catch (err) {
    console.log(
      `getTradeHistory(${chainId}, ${poolAddress}, ${accountAddress}, ${symbolId}): ${err}`
    );
  }
  return [];
};
