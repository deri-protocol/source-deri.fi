import { BrokerImplementationFactory, dipBrokerFactory, ERC20Factory } from "../contract/factory";
import { poolFactory } from "../contract/pool";
import { queryApi } from "../utils/api";
import { bg, fromWei } from "../utils/bignumber";
import { checkAddress } from "../utils/chain";
import { getBrokerAddress, getBToken, getPoolConfig, getSymbol, getSymbolList } from "../utils/config";
import { debug, DeriEnv } from "../utils/env";
import { checkToken, deriSymbolScaleOut, nativeCoinSymbols, normalizeDeriSymbol, stringToId } from "../utils/symbol";
import { getWeb3 } from "../utils/web3";
import { ZERO_ADDRESS } from '../utils/constant'
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

export const isUnlocked = queryApi(async ({ chainId, bTokenSymbol, accountAddress }) => {
  accountAddress = checkAddress(accountAddress)
  bTokenSymbol = checkToken(bTokenSymbol)
  if (nativeCoinSymbols(chainId).includes(bTokenSymbol)) {
    return true
  } else {
    const brokerAddress = getBrokerAddress(chainId)
    debug() && console.log(`chainId(${chainId}) account(${accountAddress}) symbol(${bTokenSymbol}) broker(${brokerAddress})`)
    const bToken = getBToken(chainId, bTokenSymbol)
    const erc20 = ERC20Factory(chainId, bToken.bTokenAddress)
    return await erc20.isUnlocked(accountAddress, brokerAddress)
  }
}, '')

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
    return {
      symbol,
      unit: symbolConfig.unit,
      pnlPerDay: symbolInfo.fundingPerDay,
      pnl: '',
      margin: '',
      volume,
      price: symbolInfo.strikePrice,
    }
  } else {
    console.log()
    console.log('-', pool[client].positions)
    const position = pool[client].positions.find((p) => p.symbol === symbol)
    const margin = pool[client].margin
    return {
      symbol,
      unit: symbolConfig.unit,
      pnlPerDay: bg(symbolInfo.fundingPerDay).times(volume).abs().toString(),
      pnl: position && position.dpmmTraderPnl || '',
      margin: margin || '',
      volume,
      price: symbolInfo.strikePrice,
    }
  }
    // originPool is the pool of the future symbol
}, {})

// export const getPositionInfo = queryApi(async ({ chainId, accountAddress, symbol}) => {
// }, {})
