import { BrokerImplementationFactory, ERC20Factory } from "../contract/factory";
import { poolFactory } from "../contract/pool";
import { queryApi } from "../utils/api";
import { bg, fromWei } from "../utils/bignumber";
import { checkAddress } from "../utils/chain";
import { getBrokerAddress, getBToken, getSymbol, getSymbolList } from "../utils/config";
import { debug, DeriEnv } from "../utils/env";
import { checkToken, deriSymbolScaleOut, nativeCoinSymbols, normalizeDeriSymbol, stringToId } from "../utils/symbol";
import { getWeb3 } from "../utils/web3";
import { MAX_UINT256, ZERO_ADDRESS } from '../utils/constant'
import { fetchJson, getHttpBase } from "../utils/rest";
import { getLastTradeInfoFromScanApi } from "../utils/scanapi";
import { delay } from "../utils/factory";

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

export const getBetInfo = queryApi(async ({ chainId, accountAddress, symbol}) => {
  if (accountAddress) {
    accountAddress = checkAddress(accountAddress)
  } else {
    accountAddress = ZERO_ADDRESS
  }
  symbol = checkToken(symbol)
  const brokerAddress = getBrokerAddress(chainId)
  const symbolConfig = getSymbol(chainId, symbol)
  const broker = BrokerImplementationFactory(chainId, brokerAddress)
  // const clientInfo = await broker.bets(accountAddress, symbolInfo.pool, stringToId(symbol))
  debug() && console.log(`-- chainId(${chainId}) ${accountAddress} ${symbol} broker(${brokerAddress})`)
  let clientInfo, clientInfo1, clientInfo2, volume1, volume2
  if (symbolConfig.powerSymbol) {
    [clientInfo1, clientInfo2, volume1, volume2] = await Promise.all([
      broker.bets(accountAddress, symbolConfig.pool, stringToId(symbol)),
      broker.bets(accountAddress, symbolConfig.powerSymbol.pool, stringToId(symbolConfig.powerSymbol.symbol)),
      broker.getVolume(accountAddress, symbolConfig.pool, stringToId(symbol)),
      broker.getVolume(accountAddress, symbolConfig.powerSymbol.pool, stringToId(symbolConfig.powerSymbol.symbol)),
    ])
  } else {
    [clientInfo1, volume1] = await Promise.all([
      broker.bets(accountAddress, symbolConfig.pool, stringToId(symbol)),
      broker.getVolume(accountAddress, symbolConfig.pool, stringToId(symbol)),
    ])
  }
  //const volumes = await  broker.getBetVolumes(accountAddress, symbolInfo.pool, [symbol])
  let position = { dpmmTraderPnl: '0', traderPnl: '0' }
  let symbolInfo = { markPrice: '', curIndexPrice: '' }
  let isPowerSymbol = false, originSymbol = symbol
  if (clientInfo2 && volume2 !== '0') {
    // update
    clientInfo = clientInfo2
    clientInfo.volume = volume2
    symbol = symbolConfig.powerSymbol.symbol
    isPowerSymbol = true
    // pool is the powerSymbol's pool
    const pool = poolFactory(chainId, symbolConfig.powerSymbol.pool)
    // originPool is the pool of the future symbol
    const originPool = poolFactory(chainId, symbolConfig.pool)
    await Promise.all([
       pool.init(clientInfo2.client),
       originPool.init(),
    ])
    if (pool[clientInfo.client].positions.map((s) => s.symbol).includes(symbol)) {
      position = pool[clientInfo.client].positions.find((p) => p.symbol === symbol)
    }
    symbolInfo = originPool.symbols.find((p) => p.symbol === originSymbol)
  } else {
    // update
    clientInfo = clientInfo1
    clientInfo.volume = volume1
    const pool = poolFactory(chainId, symbolConfig.pool)
    await pool.init(clientInfo.client)
    if (pool[clientInfo.client].positions.map((s) => s.symbol).includes(symbol)) {
      position = pool[clientInfo.client].positions.find((p) => p.symbol === symbol)
    }
    symbolInfo = pool.symbols.find((p) => p.symbol === symbol)
  }
  return {
    volume: deriSymbolScaleOut(symbol, clientInfo.volume),
    symbol,
    displaysymbol: normalizeDeriSymbol(symbol),
    pnl: position.dpmmTraderPnl,
    markPrice: symbolInfo.markPrice,
    indexPrice: symbolInfo.curIndexPrice,
    isPowerSymbol,
  }
}, {})

// export const getBetsInfo = queryApi(async ({ chainId, accountAddress, symbols }) => {
//   accountAddress = checkAddress(accountAddress)
//   symbols = symbols.map((s) => checkToken(s))
//   const brokerAddress = getBrokerAddress(chainId)
//   const symbolsInfo = symbols.map((s) => getSymbol(chainId, s))
//   const poolsInfo = symbolsInfo.reduce((acc, symbol) => {
//     if (acc.map((p) => p.pool).includes(symbol.pool)) {
//       const pool = acc.find((p) => p.pool === symbol.pool)
//       pool.symbols.push(symbol.symbol)
//     } else {
//       acc.push({
//         pool: symbol.pool,
//         symbols: [symbol.symbol],
//       })
//     }
//     return acc
//   }, [])
//   const pools = poolsInfo.map((p) => p.pool)
//   const broker = BrokerImplementationFactory(chainId, brokerAddress)
//   const volumes = await Promise.all(
//     pools.map((pool) => broker.getBetVolumes(accountAddress, pool, poolsInfo.find((p) => p.pool === pool).symbols))
//   )
//   pools.forEach((pool, index) => {
//     poolsInfo.find((p) => p.pool === pool).volumes = volumes[index]
//   })
//   let res = symbols.reduce((acc, symbol) => {
//     for (let pool of pools) {
//       const poolInfo = poolsInfo.find((p)=> p.pool === pool)
//       if (poolInfo.symbols[0] === symbol) {
//         const s = poolInfo.symbols.splice(0, 1)
//         const v = poolInfo.volumes.splice(0, 1)
//         acc.push({symbol: s[0], volume: v[0], pnl: '0'})
//       }
//     }
//     return acc
//   }, [])
//   return res
// }, [])

export const getBetsPnl = queryApi(async ({ chainId, accountAddress }) => {
  accountAddress = checkAddress(accountAddress)
  const symbols = getSymbolList(chainId).reduce((acc, s) => {
    acc.push(s)
    if (s.powerSymbol) {
      acc.push(s.powerSymbol)
    }
    return acc
  }, [])

  const brokerAddress = getBrokerAddress(chainId)
  const broker = BrokerImplementationFactory(chainId, brokerAddress)
  let res = await Promise.all(symbols.map((s) => {
    return broker.bets(accountAddress, s.pool, stringToId(s.symbol))
  }))
  const volumes = await Promise.all(symbols.map((s) => {
    return broker.getVolume(accountAddress, s.pool, stringToId(s.symbol))
  }))
  res = res.map((r, index) => ({ ...r, volume: volumes[index] }))
  const clientsInfo = res.map((r, index) => ({ ...r, symbol: symbols[index].symbol, pool: symbols[index].pool }))
    .filter((c) => c.volume !== '0')
  const pnlsInfo = (await Promise.all(clientsInfo.map((c) => {
    const pool = poolFactory(chainId, c.pool)
    return pool.init(c.client)
  }))).map((c) => c.account)
  // console.log(pnlsInfo)
  // return pnlsInfo.reduce((acc, s) => acc.plus(s.traderPnl), bg(0)).toString()
  return pnlsInfo.reduce((acc, s) => acc.plus(s.dpmmTraderPnl), bg(0)).toString()
}, '')


export const getLiquidationInfo = queryApi(async ({ chainId, accountAddress, symbol }) => {
  accountAddress = checkAddress(accountAddress)
  symbol = checkToken(symbol)
  const brokerAddress = getBrokerAddress(chainId)
  const symbolConfig = getSymbol(chainId, symbol)
  const broker = BrokerImplementationFactory(chainId, brokerAddress)
  // const clientInfo = await broker.bets(accountAddress, symbolInfo.pool, stringToId(symbol))
  debug() && console.log(`-- chainId(${chainId}) ${accountAddress} ${symbol} broker(${brokerAddress})`)
  let userStatus1, liquidateInfo = {}
  if (symbolConfig.powerSymbol) {
    const [clientInfo1, clientInfo2] = await Promise.all([
      broker.bets(accountAddress, symbolConfig.pool, stringToId(symbol)),
      broker.bets(accountAddress, symbolConfig.powerSymbol.pool, stringToId(symbolConfig.powerSymbol.symbol)),
    ])
    const pool1 = poolFactory(chainId, symbolConfig.pool)
    const pool2 = poolFactory(chainId, symbolConfig.powerSymbol.pool)
    const [toBlock] = await Promise.all([
      broker.web3.eth.getBlockNumber(),
      pool1.init(clientInfo1.client),
      pool2.init(clientInfo2.client),
    ])
    debug() && console.log(`---- clientInfo: ${clientInfo1.client} ${clientInfo2.client}`)
    const liqValue = '-0.000000000000000001'
    let lastTradeInfo1 = { tradeFee: '1', blockNumber: 1}, lastTradeInfo2 = { tradeFee: '1', blockNumber: 1}
    if (clientInfo1.client !== ZERO_ADDRESS) {
      lastTradeInfo1 = await getLastTradeInfoFromScanApi({
        chainId,
        poolAddress: symbolConfig.symbolManager,
        pTokenId: pool1[clientInfo1.client].pTokenId || 0,
        fromBlock: symbolConfig.initialBlock,
        toBlock
      })
    }
    if (
      (symbolConfig.symbolManager !== symbolConfig.powerSymbol.symbolManager
        && clientInfo2.client !== ZERO_ADDRESS)
      || (symbolConfig.symbolManager == symbolConfig.powerSymbol.symbolManager &&
        clientInfo1.client == ZERO_ADDRESS)
    ) {
      await delay(2200)
      lastTradeInfo2 = await getLastTradeInfoFromScanApi({
        chainId,
        poolAddress: symbolConfig.powerSymbol.symbolManager,
        pTokenId: pool2[clientInfo2.client].pTokenId || 0,
        fromBlock: symbolConfig.powerSymbol.initialBlock,
        toBlock
      })
    }
    debug() && console.log(`---- ${JSON.stringify(lastTradeInfo1)} ${JSON.stringify(lastTradeInfo2)}`)
    if (
      (lastTradeInfo1.tradeFee === liqValue && symbolConfig.symbolManager === symbolConfig.powerSymbol.symbolManager) ||
      (lastTradeInfo1.tradeFee === liqValue && lastTradeInfo2.tradeFee === liqValue) ||
      (lastTradeInfo1.tradeFee === liqValue && lastTradeInfo1.blockNumber > lastTradeInfo2.blockNumber) ||
      (lastTradeInfo2.tradeFee === liqValue && lastTradeInfo2.blockNumber > lastTradeInfo1.blockNumber)
    ) {
      liquidateInfo = {
        chainId,
        pool: symbolConfig.pool,
        account: accountAddress,
        symbol: symbolConfig.symbol,
        liquidate: true,
      }
    } else {
      liquidateInfo = {
        chainId,
        pool: symbolConfig.pool,
        account: accountAddress,
        symbol: symbolConfig.symbol,
        liquidate: false,
      }
    }
    // [userStatus1, userStatus2] = await Promise.all([
    //   broker.getUserStatus(accountAddress, symbolConfig.pool, stringToId(symbol)),
    //   broker.getUserStatus(accountAddress, symbolConfig.powerSymbol.pool, stringToId(symbolConfig.powerSymbol.symbol)),
    // ]);
    // if (userStatus2 === '4') {
    //   liquidateInfo = {
    //     chainId,
    //     pool: symbolConfig.powerSymbol.pool,
    //     account: accountAddress,
    //     symbol: symbolConfig.powerSymbol.symbol,
    //     liquidate: true,
    //   }
    // }
  } else {
    userStatus1 = await broker.getUserStatus(accountAddress, symbolConfig.pool, stringToId(symbol))
    liquidateInfo = {
      chainId,
      pool: symbolConfig.pool,
      account: accountAddress,
      symbol,
      liquidate: userStatus1 === '4',
    }
  }
  // using clientInfo1 to update returned value
  return liquidateInfo
})
