import { BrokerImplementationFactory, dipBrokerFactory, ERC20Factory } from "../contract/factory"
import { poolFactory } from "../contract/pool"
import { txApi } from "../utils/api"
import { debug } from "../utils/env"
import { bg, fromWei, toWei } from "../utils/bignumber"
import { checkAddress, checkChainId } from "../utils/chain"
import { getB0, getBrokerAddress, getBToken, getPoolConfig, getSymbol, getSymbolList } from "../utils/config"
import { MAX_INT256_DIV_ONE, ZERO_ADDRESS } from "../utils/constant"
import { getSymbolsOracleInfo } from "../utils/oracle"
import { checkToken, nativeCoinSymbols } from "../utils/symbol"
import { ZeroTradeVolumeError } from "../error/error"
import { normalizeTradeVolume } from "./api_shared"
import { normalizeBTokenSymbol } from "../config"

const getPriceLimit = (volume) => {
  return bg(volume).gt(0) ? MAX_INT256_DIV_ONE: '0'
}

export const unlock = txApi(async ({ chainId, bTokenSymbol, accountAddress, isNodeEnv = false, ...opts }) => {
  accountAddress = checkAddress(accountAddress)
  bTokenSymbol = checkToken(bTokenSymbol)
  if (nativeCoinSymbols(chainId).includes(bTokenSymbol)) {
    return
  }
  const bToken = getBToken(chainId, bTokenSymbol)
  const brokerAddress = getBrokerAddress(chainId)
  // isNodeEnv is for test only
  const erc20 = ERC20Factory(chainId, bToken.bTokenAddress, { isNodeEnv })
  return await erc20.unlock(accountAddress, brokerAddress, opts)
})

export const deposit = txApi(async ({ chainId, bTokenSymbol, amount, symbol, accountAddress, isNodeEnv = false, ...opts }) => {
  chainId = checkChainId(chainId)
  accountAddress = checkAddress(accountAddress)
  bTokenSymbol = checkToken(bTokenSymbol)
  symbol = checkToken(symbol)
  const brokerAddress = getBrokerAddress(chainId)
  const broker = dipBrokerFactory(chainId, brokerAddress, { isNodeEnv })
  let symbolConfig = getSymbol(chainId, symbol)
  const bTokenConfig = getBToken(chainId, bTokenSymbol)
  const b0Config = getB0(chainId)
  const pool = poolFactory(chainId, symbolConfig.pool)
  await pool.init()
  const oracleSignatures = await getSymbolsOracleInfo(chainId, pool.symbols.map((s) => s.symbol))
  const symbolInfo = pool.symbols.find((s) => s.symbol === symbol)

  const volume = bg(
    normalizeTradeVolume(
      bg(amount).div(symbolInfo.strikePrice).toString(),
      symbolInfo.minTradeVolume
    )
  )
    .negated()
    .toString();
    if (bg(volume).eq(0)) {
      throw new ZeroTradeVolumeError()
    }
  const priceLimit = getPriceLimit(volume)
  debug() && console.log(`amount(${amount}) strike(${symbolInfo.strikePrice}) volume(${volume}) priceLimit(${priceLimit}) bToken(${bTokenConfig.bTokenAddress}) broker(${brokerAddress})`)
  let res = await broker.trade(accountAddress, symbolConfig.pool, bTokenConfig.bTokenAddress, false, toWei(amount, b0Config.bTokenDecimals || 18), symbol, toWei(volume), priceLimit, oracleSignatures, opts)
  return res
})

export const withdraw = txApi(async ({ chainId, bTokenSymbol, symbol, volume, accountAddress, isNodeEnv = false, ...opts }) => {
  accountAddress = checkAddress(accountAddress)
  bTokenSymbol = checkToken(bTokenSymbol)
  bTokenSymbol = normalizeBTokenSymbol(chainId, bTokenSymbol)
  symbol = checkToken(symbol)
  const brokerAddress = getBrokerAddress(chainId)
  const broker = dipBrokerFactory(chainId, brokerAddress, { isNodeEnv })
  let symbolConfig = getSymbol(chainId, symbol)
  const client = await broker.clients(accountAddress, symbolConfig.pool, symbolConfig.symbolId)
  if (client !== ZERO_ADDRESS) {
    const bTokenConfig = getBToken(chainId, bTokenSymbol)
    const b0Config = getB0(chainId)
    const pool = poolFactory(chainId, symbolConfig.pool)
    await pool.init(client)
    const position = pool[client].positions.find((p) => p.symbol === symbol)
    const symbolInfo = pool.symbols.find((s) => s.symbol === symbol)
    volume = normalizeTradeVolume(bg(volume).abs().toString(), symbolInfo.minTradeVolume)
    if (bg(volume).eq(0)) {
      throw new ZeroTradeVolumeError()
    }
    const amount = bg(pool[client].dynamicMargin).times(volume).div(position.volume).negated().toString()
    const oracleSignatures = await getSymbolsOracleInfo(chainId, pool.symbols.map((s) => s.symbol))

    const priceLimit = getPriceLimit(volume)
    debug() && console.log(`amount(${amount}) strike(${symbolInfo.strikePrice}) volume(${volume}) priceLimit(${priceLimit}) bToken(${bTokenConfig.bTokenAddress}) broker(${brokerAddress})`)
    let res = await broker.trade(accountAddress, symbolConfig.pool, bTokenConfig.bTokenAddress, true, toWei(amount, b0Config.bTokenDecimals || 18), symbol, toWei(volume), priceLimit, oracleSignatures, opts)
    return res
  } else {
    console.log(`-- no position found in the current symbol: ${chainId} ${symbol} ${accountAddress}`)
  }
})
