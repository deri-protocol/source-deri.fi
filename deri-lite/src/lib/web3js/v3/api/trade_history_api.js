import { getJsonConfig } from '../../shared/api/config_api';
import {
  catchApiError,
  getBlockInfo,
  getPastEvents,
} from '../../shared/utils';
import { poolImplementationFactory } from '../contract/factory/pool';
import { deriSymbolScaleIn, deriSymbolScaleOut, normalizeDeriSymbol } from '../utils/power';

export const getTradeHistory = async (chainId, poolAddress, accountAddress) => {
  return catchApiError(async () => {
    const poolConfig = getJsonConfig().find((c) => c.pool === poolAddress)
    let tradeHistoryBlock = parseInt(poolConfig.initialBlock),
      tradeHistory = [];
    console.log('-- block', tradeHistoryBlock)
      const tradeHistoryOnline = await getTradeHistoryOnline(
        chainId,
        poolAddress,
        accountAddress,
        tradeHistoryBlock + 1
      );
      const result = tradeHistoryOnline.concat(tradeHistory);
      return result.sort((a, b) => parseInt(b.time) - parseInt(a.time));
  }, [], []);
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
