import { BrokerImplementationFactory, dipBrokerFactory, ERC20Factory } from "../contract/factory";
import { poolFactory } from "../contract/pool";
import { queryApi } from "../utils/api";
import { bg, fromWei } from "../utils/bignumber";
import { checkAddress } from "../utils/chain";
import { getBrokerAddress, getBToken, getPoolConfig, getSymbol, getSymbolList } from "../utils/config";
import { debug, DeriEnv } from "../utils/env";
import { checkToken, deriSymbolScaleOut, nativeCoinSymbols, normalizeDeriSymbol, stringToId } from "../utils/symbol";
import { getWeb3 } from "../utils/web3";
import { MAX_UINT256, ZERO_ADDRESS } from '../utils/constant'
// import { fetchJson, getHttpBase } from "../utils/rest";
// import { getLastTradeInfoFromScanApi } from "../utils/scanapi";
// import { delay } from "../utils/factory";
import { ObjectCache } from "../utils/cache";
import { marginCacheKey, normalizeTradeVolume, positionCacheKey, symbolCacheKey } from "./api_shared";
import { calculateDpmmCost } from "../contract/symbol/shared";

export const getWalletBalance = queryApi(async ({ chainId, bTokenSymbol, accountAddress }) => {
  accountAddress = checkAddress(accountAddress)
  bTokenSymbol = checkToken(bTokenSymbol)
  if (nativeCoinSymbols(chainId).includes(bTokenSymbol)) {
    const web3 = await getWeb3(chainId)
    return fromWei(await web3.eth.getBalance(accountAddress))
  } else {
    const bToken = getBToken(chainId, bTokenSymbol)
    const erc20 = ERC20Factory(chainId, bToken.bTokenAddress)
    return await erc20.balanceOf(accountAddress)
  }
}, '')

export const isUnlocked = queryApi(
  async ({ chainId, bTokenSymbol, accountAddress }) => {
    accountAddress = checkAddress(accountAddress);
    bTokenSymbol = checkToken(bTokenSymbol);
    if (nativeCoinSymbols(chainId).includes(bTokenSymbol)) {
      return {
        isUnlocked: true,
        isZero: false,
        allowance: bg(MAX_UINT256).toString(),
      };
    } else {
      const brokerAddress = getBrokerAddress(chainId);
      debug() &&
        console.log(
          `chainId(${chainId}) account(${accountAddress}) symbol(${bTokenSymbol}) broker(${brokerAddress})`
        );
      const bToken = getBToken(chainId, bTokenSymbol);
      const erc20 = ERC20Factory(chainId, bToken.bTokenAddress);
      return await erc20.isUnlocked(accountAddress, brokerAddress);
    }
  },
  {
    isUnlocked: false,
    isZero: true,
    allowance: "0",
  }
);

export const getSymbolInfo = queryApi(async ({ chainId, accountAddress, symbol}) => {
  if (accountAddress) {
    accountAddress = checkAddress(accountAddress)
  } else {
    accountAddress = ZERO_ADDRESS
  }
  symbol = checkToken(symbol)
  const brokerAddress = getBrokerAddress(chainId)
  const symbolConfig = getSymbol(chainId, symbol)
  const broker = dipBrokerFactory(chainId, brokerAddress)
  // const clientInfo = await broker.bets(accountAddress, symbolInfo.pool, stringToId(symbol))
  debug() && console.log(`-- chainId(${chainId}) ${accountAddress} ${symbol} broker(${brokerAddress})`)
  const pool = poolFactory(chainId, symbolConfig.pool)
  const [volume, client] = await Promise.all([
    broker.getVolume(accountAddress, symbolConfig.pool, symbolConfig.symbolId),
    broker.clients(accountAddress, symbolConfig.pool, symbolConfig.symbolId),
    pool.init(),
  ]);
  if (client !== ZERO_ADDRESS) {
    await pool.init(client)
  }
  const symbolInfo = pool.symbols.find((s) => s.symbol === symbol)
  if (bg(volume).eq(0)) {
    ObjectCache.set(symbolCacheKey(chainId, symbol), symbolInfo)
    ObjectCache.set(positionCacheKey(chainId, symbol, accountAddress), { volume: '0'} )
    ObjectCache.set(marginCacheKey(chainId, symbol, accountAddress), {
      margin: pool[client].margin,
      dynamicMargin: pool[client].dynamicMargin,
    });
    return {
      symbol,
      unit: symbolConfig.unit,
      pnlPerDay: symbolInfo.fundingPerDay,
      // pnl: '',
      margin: '0',
      funding: '0',
      volume,
      price: symbolInfo.strikePrice,
      indexPrice: symbolInfo.curIndexPrice,
    }
  } else {
    const position = pool[client].positions.find((p) => p.symbol === symbol)
    const margin = pool[client].margin
    ObjectCache.set(symbolCacheKey(chainId, symbol), symbolInfo)
    ObjectCache.set(positionCacheKey(chainId, symbol, accountAddress), position)
    ObjectCache.set(marginCacheKey(chainId, symbol, accountAddress), {
      margin: pool[client].margin,
      dynamicMargin: pool[client].dynamicMargin,
    });
    return {
      symbol,
      unit: symbolConfig.unit,
      pnlPerDay: bg(symbolInfo.fundingPerDay).times(volume).abs().toString(),
      // pnl: position && position.dpmmTraderPnl || '',
      funding: position && bg(position.fundingAccrued).negated().toString() || '0',
      margin: margin || '0',
      volume: bg(volume).negated().toString(),
      price: symbolInfo.strikePrice,
      indexPrice: symbolInfo.curIndexPrice,
    }
  }
    // originPool is the pool of the future symbol
}, {})

export const getEstimatedDepositeInfo = queryApi(async ({ chainId, accountAddress, symbol, newAmount}) => {
  accountAddress = checkAddress(accountAddress)
  symbol = checkToken(symbol)
  const symbolInfo = ObjectCache.get(symbolCacheKey(chainId, symbol))
  let position = ObjectCache.get(positionCacheKey(chainId, symbol, accountAddress))
  if (!position) {
    position = { volume: 0 }
  }
  const newVolume = normalizeTradeVolume(bg(newAmount).div(symbolInfo.strikePrice).toString(), symbolInfo.minTradeVolume)
  if (symbolInfo) {
    let fee;
    const feeNotional = bg(symbolInfo.curIndexPrice).times(symbolInfo.feeRatioNotional).times(newVolume).abs()
    const cost = calculateDpmmCost(
      symbolInfo.theoreticalPrice,
      symbolInfo.K,
      symbolInfo.netVolume,
      newVolume
    );
    const feeMark = bg(cost).times(symbolInfo.feeRatioMark).abs()
    if (feeNotional.lt(feeMark)) {
      fee = feeNotional.toString()
    } else {
      fee = feeMark.toString()
    }
    // if (bg(symbolInfo.intrinsicValue).gt(0)) {
    //   fee = bg(newVolume)
    //     .abs()
    //     .times(symbolInfo.curIndexPrice)
    //     .times(symbolInfo.feeRatioITM)
    //     .toString();
    // } else {
    //   const cost = calculateDpmmCost(
    //     symbolInfo.theoreticalPrice,
    //     symbolInfo.K,
    //     symbolInfo.netVolume,
    //     newVolume
    //   );
    //   fee = bg(cost).abs().times(symbolInfo.feeRatioOTM).toString();
    // }
    return {
      symbol,
      volume: bg(position.volume).minus(newVolume).abs().toString(),
      fee,
    }
  } else {
    console.log(`-- cannot get cached symbol and position: ${chainId} ${symbol} ${accountAddress}`)
    return {
      symbol,
      volume: '',
      fee: '',
    }
  }
    // originPool is the pool of the future symbol
}, {})


export const getEstimatedWithdrawInfo = queryApi(async ({ chainId, accountAddress, symbol, newVolume}) => {
  accountAddress = checkAddress(accountAddress)
  symbol = checkToken(symbol)
  const symbolInfo = ObjectCache.get(symbolCacheKey(chainId, symbol))
  const position = ObjectCache.get(positionCacheKey(chainId, symbol, accountAddress))
  const marginInfo = ObjectCache.get(marginCacheKey(chainId, symbol, accountAddress))
  if (symbolInfo && position) {
    newVolume = normalizeTradeVolume(bg(newVolume).abs().toString(), symbolInfo.minTradeVolume)
    let fee;
    const feeNotional = bg(symbolInfo.curIndexPrice).times(symbolInfo.feeRatioNotional).times(newVolume).abs()
    const cost = calculateDpmmCost(
      symbolInfo.theoreticalPrice,
      symbolInfo.K,
      symbolInfo.netVolume,
      newVolume
    );
    const feeMark = bg(cost).times(symbolInfo.feeRatioMark).abs()
    if (feeNotional.lt(feeMark)) {
      fee = feeNotional.toString()
    } else {
      fee = feeMark.toString()
    }
    // if (bg(symbolInfo.intrinsicValue).gt(0)) {
    //   fee = bg(newVolume)
    //     .abs()
    //     .times(symbolInfo.curIndexPrice)
    //     .times(symbolInfo.feeRatioITM)
    //     .toString();
    // } else {
    //   const cost = calculateDpmmCost(
    //     symbolInfo.theoreticalPrice,
    //     symbolInfo.K,
    //     symbolInfo.netVolume,
    //     newVolume
    //   );
    //   fee = bg(cost).abs().times(symbolInfo.feeRatioOTM).toString();
    // }
    return {
      symbol,
      volume: bg(position.volume).plus(newVolume).negated().toString(),
      fee,
      amount: bg(marginInfo.dynamicMargin).times(newVolume).div(position.volume).negated().toString(),
    }
  } else {
    console.log(`-- cannot get cached symbol and position: ${chainId} ${symbol} ${accountAddress}`)
    return {
      symbol,
      volume: '',
      fee: '',
      amount: '',
    }
  }
    // originPool is the pool of the future symbol
}, {})