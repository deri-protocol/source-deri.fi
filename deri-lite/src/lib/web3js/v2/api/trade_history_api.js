import { bg, deriToNatural, getHttpBase, fetchJson } from '../../shared/utils';
import {
  getPoolConfig2,
  getPoolSymbolIdList,
} from '../../shared/config';
import { perpetualPoolFactory } from '../factory';

const processTradeEvent = async (
  perpetualPool,
  info,
  blockNumber,
  txHash,
  multiplier,
  feeRatio,
  symbols,
) => {
  const tradeVolume = deriToNatural(info.tradeVolume);
  const timeStamp = await perpetualPool._getTimeStamp(blockNumber);

  const direction = tradeVolume.gt(0) ? 'LONG' : 'SHORT';
  const price = deriToNatural(info.price);
  const time = `${+timeStamp.timestamp}000`;
  const symbolId = info.symbolId
  const symbol = symbols.find((s) => s.symbolId == info.symbolId)
  const transactionFee = perpetualPool._calculateFee(
    tradeVolume,
    price,
    multiplier[parseInt(symbolId)],
    feeRatio[parseInt(symbolId)]
  );
  const notional = tradeVolume.abs().times(price).times(multiplier[parseInt(symbolId)]);
  const volume = tradeVolume.abs();

  const res = {
    direction,
    //baseToken: bTokenSymbol,
    symbolId,
    symbol: symbol && symbol.symbol,
    price: price.toString(),
    notional: notional.toString(),
    volume: bg(volume).times(multiplier[parseInt(symbolId)]).toString(),
    transactionFee: transactionFee.toString(),
    transactionHash: txHash.toString(),
    time,
  };
  return res;
};
const getTradeHistoryOnline = async (
  chainId,
  poolAddress,
  accountAddress,
  symbolId,
  fromBlock
) => {

  const symbolIdList = getPoolSymbolIdList(poolAddress)
  //console.log('symbolIdList', symbolIdList);
  const perpetualPool = perpetualPoolFactory(chainId, poolAddress);
  const toBlock = await perpetualPool._getBlockInfo('latest');
  fromBlock = parseInt(fromBlock);

  let promises= []
  for (let i=0; i<symbolIdList.length; i++) {
    promises.push(perpetualPool.getSymbol(symbolIdList[i]))
  }
  let symbols = await Promise.all(promises)

  const multiplier = symbols.map((i) => i.multiplier.toString());
  const feeRatio = symbols.map((i) => i.feeRatio.toString());

  const filters = { owner: accountAddress };
  let events = await perpetualPool._getPastEvents(
    'Trade',
    filters,
    fromBlock,
    toBlock.number
  );

  const result = [];
  //events  = events.filter((i) => i.returnValues.symbolId === symbolId)
  //console.log("events length:", events.length);
  for (let i = 0; i < events.length; i++) {
    const item = events[i];
    const res = await processTradeEvent(
      perpetualPool,
      item.returnValues,
      item.blockNumber,
      item.transactionHash,
      multiplier,
      feeRatio,
      symbols,
    );
    result.unshift(res);
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
    let tradeFromBlock, tradeHistory = [];
    const res = await fetchJson(
      `${getHttpBase()}/trade_history/${chainId}/${poolAddress}/${accountAddress}/${symbolId}`
    );
    if (res && res.success) {
      tradeFromBlock = parseInt(res.data.tradeHistoryBlock);
      if (res.data.tradeHistory && Array.isArray(res.data.tradeHistory)) {
        tradeHistory = res.data.tradeHistory;
      }
    }
    const perpetualPool = perpetualPoolFactory(chainId, poolAddress);
    const symbolIdList = getPoolSymbolIdList(poolAddress)
    //console.log(symbolIdList)

    let promises = []
    for (let i=0; i<symbolIdList.length; i++) {
      promises.push(perpetualPool.getSymbol(symbolIdList[i]))
    }
    const symbols = await Promise.all(promises)
    //console.log(symbols)

    if (tradeHistory.length > 0) {
      tradeHistory = tradeHistory
        .filter((i) => !(i.direction === 'LIQUIDATION' && i.symbolId === '0'))
        .map((i) => {
          const index = parseInt(i.symbolId)
          if (i.direction !== 'LIQUIDATION') {
            return {
              direction: i.direction.trim(),
              //baseToken: i.baseToken.trim(),
              symbolId: i.symbolId,
              symbol: i.symbol,
              price: deriToNatural(i.price).toString(),
              notional: deriToNatural(i.notional).toString(),
              volume: deriToNatural(i.volume).times(symbols[index].multiplier).toString(),
              transactionFee: deriToNatural(i.transactionFee).toString(),
              transactionHash: i.transactionHash,
              time: i.time.toString(),
            };
          } else {
            if (i.volume !== '' && i.volume.indexOf(',') > -1 && !i.price.startsWith('NaN')) {
              const ids = i.volume.split(',').reduce((acc, v, index) => {
                if (v !== '0') {
                  return acc.concat([index]);
                } else {
                  return acc
                }
              }, []);
            const prices = i.price.split(',').map((s)=> deriToNatural(s))
            const volumes= i.volume.split(',').map((v)=> deriToNatural(v))
            const res = ids.map((id) => {
              return {
                direction: i.direction.trim(),
                symbolId: id.toString(),
                symbol: symbols[id].symbol,
                volume: volumes[id].times(symbols[id].multiplier).abs().toString(),
                price: prices[id].toString(),
                notional: volumes[id].abs().times(prices[id]).times(symbols[id].multiplier).toString(),
                transactionFee: '0',
                transactionHash: i.transactionHash,
                time: i.time.toString(),
              };
            })
            return res
            } else {
              return {
                direction: i.direction.trim(),
                symbolId: '',
                symbol: '',
                volume: '',
                price: '',
                notional: '',
                transactionFee: '0',
                transactionHash: i.transactionHash,
                time: i.time.toString(),
              }
            }
          }
        }).flat();
    }
      //console.log('tradeHistory1',tradeHistory)
    if (tradeFromBlock !== 0) {
      // console.log(tradeFromBlock, liquidateFromBlock)
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

      const {initialBlock} = getPoolConfig2(poolAddress)
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
  } catch(err) {
    console.log(`getTradeHistory(${chainId}, ${poolAddress}, ${accountAddress}, ${symbolId}): ${err}`)
  }
  return []
};
