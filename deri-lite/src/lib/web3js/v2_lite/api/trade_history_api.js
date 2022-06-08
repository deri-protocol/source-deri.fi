import { bg, deriToNatural, getBlockInfo, getPastEvents, getHttpBase, fetchJson } from '../../shared/utils';
import {
  getPoolConfig,
  getPoolConfig2,
} from '../../shared/config';
import { perpetualPoolLiteFactory, pTokenLiteFactory } from '../factory';
import { calculateTxFee } from '../../v2/calculation/position';

const processTradeEvent = async (
  chainId,
  info,
  blockNumber,
  txHash,
  bTokenSymbol,
  symbols,
  symbolIds,
) => {
  const tradeVolume = deriToNatural(info.tradeVolume);
  const timeStamp = await getBlockInfo(chainId, blockNumber);

  const direction = tradeVolume.gt(0) ? 'LONG' : 'SHORT';
  const price = deriToNatural(info.price);
  const time = `${+timeStamp.timestamp}000`;
  const symbolId = info.symbolId
  const index = symbolIds.findIndex((s) => s === symbolId)
  const symbol = symbols[index]
  const transactionFee = calculateTxFee(
    tradeVolume,
    price,
    symbol.multiplier,
    symbol.feeRatio,
  );
  const notional = tradeVolume.abs().times(price).times(symbol.multiplier);
  const volume = tradeVolume.abs();

  const res = {
    direction,
    baseToken: bTokenSymbol,
    symbolId,
    symbol: symbol && symbol.symbol,
    price: price.toString(),
    notional: notional.toString(),
    //volume: volume.toString(),
    volume: bg(volume).times(symbol.multiplier).toString(),
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

  //console.log('symbolIdList', symbolIdList);
  const { bTokenSymbol } = getPoolConfig(poolAddress, undefined, undefined, 'v2_lite')
  const perpetualPool = perpetualPoolLiteFactory(chainId, poolAddress);
  const { pTokenAddress } = await perpetualPool.getAddresses()
  const pToken = pTokenLiteFactory(chainId, pTokenAddress)
  //const symbolIdList = getPoolSymbolIdList(poolAddress)
  const symbolIdList = await pToken.getActiveSymbolIds()
  const toBlock = await getBlockInfo(chainId, 'latest');
  fromBlock = parseInt(fromBlock);

  let promises= []
  for (let i=0; i<symbolIdList.length; i++) {
    promises.push(perpetualPool.getSymbol(symbolIdList[i]))
  }
  let symbols = await Promise.all(promises)

  const filters =  { account: accountAddress }
  let events = await getPastEvents(chainId, perpetualPool.contract,
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
      chainId,
      item.returnValues,
      item.blockNumber,
      item.transactionHash,
      bTokenSymbol,
      symbols,
      symbolIdList,
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

    const perpetualPool = perpetualPoolLiteFactory(chainId, poolAddress)
    await perpetualPool.init()
    const symbolIds = perpetualPool.activeSymbolIds
    //const symbolIndex = symbolIds.indexOf(symbolId)

    let promises= []
    for (let i=0; i<symbolIds.length; i++) {
      promises.push(perpetualPool.getSymbol(symbolIds[i]))
    }
    let symbols = await Promise.all(promises)

    if (tradeHistory.length > 0) {
      tradeHistory = tradeHistory
        .filter((i) => !(i.direction === 'LIQUIDATION' && i.symbolId === '0'))
        .map((i) => {
          if (i.direction !== 'LIQUIDATION') {
            const index = symbolIds.indexOf(i.symbolId);
            return {
              direction: i.direction.trim(),
              baseToken: i.baseToken.trim(),
              symbolId: i.symbolId,
              symbol: i.symbol,
              price: deriToNatural(i.price).toString(),
              notional: deriToNatural(i.notional).toString(),
              //volume: deriToNatural(i.volume).toString(),
              volume: deriToNatural(i.volume)
                .times(symbols[index].multiplier)
                .toString(),
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
              const volumes = i.volume.split(',').map((v)=> deriToNatural(v))
              return ids.map((id) => {
                return {
                  direction: i.direction.trim(),
                  baseToken: i.baseToken.trim(),
                  symbolId: id.toString(),
                  symbol: symbols[id].symbol,
                  volume: volumes[id].abs().times(symbols[id].multiplier).toString(),
                  price: prices[id].toString(),
                  notional: volumes[id].abs().times(prices[id]).times(symbols[id].multiplier).toString(),
                  transactionFee: '0',
                  transactionHash: i.transactionHash,
                  time: i.time.toString(),
                };
              })
            } else {
              // handle missing price data
              return {
                direction: i.direction.trim(),
                baseToken: i.baseToken.trim(),
                symbolId: '',
                symbol: '',
                price: '',
                notional: '',
                //volume: deriToNatural(i.volume).toString(),
                volume: '',
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
