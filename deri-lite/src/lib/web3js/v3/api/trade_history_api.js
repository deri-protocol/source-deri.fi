import {
  catchApiError,
  fetchJson,
  fromWei,
  getBlockInfo,
  getHttpBase,
  getPastEvents,
} from '../../shared/utils';
import { poolImplementationFactory } from '../contract/factory/pool';
import { deriSymbolScaleIn, deriSymbolScaleOut, normalizeDeriSymbol } from '../utils/power';

export const getTradeHistory = async (chainId, poolAddress, accountAddress) => {
  return catchApiError(async () => {
    let tradeHistoryBlock = 0,
      tradeHistory = [];
    //if (tradeHistoryBlock !== 0) {
      const tradeHistoryOnline = await getTradeHistoryOnline(
        chainId,
        poolAddress,
        accountAddress,
        tradeHistoryBlock + 1
      );
      const result = tradeHistoryOnline.concat(tradeHistory);
      return result.sort((a, b) => parseInt(b.time) - parseInt(a.time));
    // } else {
    //   // trade history is not sync
    //   return []
    // }
  });
};

const getTradeHistoryOnline = async (
  chainId,
  poolAddress,
  accountAddress,
  fromBlock
) => {
  let result = [];
  const pool = poolImplementationFactory(chainId, poolAddress);
  await pool.init();
  const pTokenId = await pool.pToken.getTokenIdOf(accountAddress);
  const toBlock = await getBlockInfo(chainId, 'latest');
  fromBlock = parseInt(fromBlock);
  const filters = { pTokenId };
  //console.log(fromBlock, toBlock.number, filters);
  let events = await getPastEvents(
    chainId,
    pool.symbolManager.contract,
    'Trade',
    filters,
    fromBlock,
    toBlock.number
  );
  for (let event of events) {
    const res = await pool.symbolManager.formatTradeEvent(event, pool.symbols, accountAddress);
    //console.log('th', res)
    result.push({
      direction: res.direction.trim(),
      baseToken: "",
      symbolId: "",
      symbol: res.symbol,
      displaySymbol: normalizeDeriSymbol(res.symbol),
      price: deriSymbolScaleIn(res.symbol, res.price),
      indexPrice: res.indexPrice || "-",
      notional: res.notional,
      volume: deriSymbolScaleOut(res.symbol, res.volume),
      transactionFee: res.transactionFee,
      transactionHash: res.transactionHash,
      time: res.time.toString(),
    });
  }
  return result
};
