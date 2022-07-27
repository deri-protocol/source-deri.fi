import { BrokerImplementationFactory, ERC20Factory } from "../contract/factory"
import { poolFactory } from "../contract/pool"
import { txApi } from "../utils/api"
import { debug } from "../utils/env"
import { bg, fromWei, toWei } from "../utils/bignumber"
import { checkAddress } from "../utils/chain"
import { getBrokerAddress, getBToken, getPoolConfig, getSymbol, getSymbolList } from "../utils/config"
import { MAX_INT256_DIV_ONE, ZERO_ADDRESS } from "../utils/constant"
import { getSymbolsOracleInfo } from "../utils/oracle"
import { checkToken, nativeCoinSymbols } from "../utils/symbol"
import { ZeroTradeVolumeError } from "../error/error"

const getPriceLimit = (volume) => {
  return bg(volume).gt(0) ? MAX_INT256_DIV_ONE: '0'
}
const formatTradeEvent = async(res) => {
  const eventName = res.events['OpenBet'] ? 'OpenBet' : 'CloseBet'
  const event = res.events[eventName]
  if (event && event.returnValues) {
    const eventValue = event.returnValues
    // get trade price
    try {
      if (event) {
        res.volume = fromWei(eventValue.tradeVolume).toString()
        res.direction = bg(res.volume).gt(0) ? 'LONG' : 'SHORT'
        res.amount = fromWei(eventValue.amount).toString()
      }
    } catch (err) {
      console.log(err)
      // ignore error
    }
  }
  return res
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

export const openBet = txApi(async ({ chainId, bTokenSymbol, amount, symbol, accountAddress, direction = 'long', boostedUp = false, isNodeEnv = false, ...opts }) => {
  accountAddress = checkAddress(accountAddress)
  bTokenSymbol = checkToken(bTokenSymbol)
  symbol = checkToken(symbol)
  direction = direction.toLowerCase()
  const brokerAddress = getBrokerAddress(chainId)
  const broker = BrokerImplementationFactory(chainId, brokerAddress, { isNodeEnv })
  let symbolConfig = getSymbol(chainId, symbol)
  if (boostedUp && symbolConfig.powerSymbol) {
    symbol = checkToken(symbolConfig.powerSymbol.symbol)
    symbolConfig = symbolConfig.powerSymbol
  }
  const bTokenConfig = getBToken(chainId, bTokenSymbol)
  const pool = poolFactory(chainId, symbolConfig.pool)
  await pool.init()
  const poolConfig = getPoolConfig(chainId, symbolConfig.pool)
  const oracleSignatures = await getSymbolsOracleInfo(chainId, pool.symbols.map((s) => s.symbol))
  const bTokenInfo = pool.bTokens.find((b) => b.bTokenSymbol === bTokenSymbol)
  const symbolInfo = pool.symbols.find((s) => s.symbol === symbol)

  // calc max volume
  const margin = bg(amount).times(bTokenInfo.bTokenPrice).times(bTokenConfig.bTokenDiscount).toString()
  let volume = pool.calcMaxVolume(symbol, margin, direction)
  const normalizedVolume = bg(
    bg(volume).gt(0)
      ? Math.floor(bg(volume).div(symbolInfo.minTradeVolume).toNumber())
      : Math.ceil(bg(volume).div(symbolInfo.minTradeVolume).toNumber())
  )
    .times(symbolInfo.minTradeVolume)
    .toString();
  if (bg(normalizedVolume).eq(0)) {
    throw new ZeroTradeVolumeError()
  }
  const priceLimit = getPriceLimit(normalizedVolume)
  debug() && console.log(`-- pool(${poolConfig.pool}) account(${accountAddress}) symbol(${symbol}) volume(${normalizedVolume}) priceLimit: ${priceLimit}`)

  // handle args native coin
  let assetAddress, newOpts
  if (nativeCoinSymbols(chainId).includes(bTokenSymbol)) {
    assetAddress = ZERO_ADDRESS
    newOpts = { ...opts, value: toWei(amount, bTokenConfig.bTokenDecimals || 18) }
  } else {
    assetAddress = bTokenConfig.bTokenAddress
    newOpts = opts
  }
  let res = await broker.openBet(accountAddress, poolConfig.pool, assetAddress, toWei(amount, bTokenConfig.bTokenDecimals || 18), symbol, toWei(normalizedVolume), priceLimit, oracleSignatures, newOpts)
  return await formatTradeEvent(res)
})

export const closeBet = txApi(async({chainId, symbol, accountAddress, isNodeEnv=false, ...opts}) => {
  accountAddress = checkAddress(accountAddress)
  symbol = checkToken(symbol)
  const brokerAddress = getBrokerAddress(chainId)
  const broker = BrokerImplementationFactory(chainId, brokerAddress, { isNodeEnv })
  // extend symbols
  const symbols = getSymbolList(chainId).reduce((acc, s) => {
    acc.push(s)
    if (s.powerSymbol) {
      acc.push(s.powerSymbol)
    }
    return acc
  }, [])
  const symbolConfig = symbols.find((s) => s.symbol === symbol)
  const poolConfig = getPoolConfig(chainId, symbolConfig.pool)
  const pool = poolFactory(chainId, symbolConfig.pool)
  await pool.init()
  const [oracleSignatures, volumes] = await Promise.all([
    getSymbolsOracleInfo(chainId, pool.symbols.map((s) => s.symbol)),
    broker.getBetVolumes(accountAddress, poolConfig.pool, [symbol]),
  ])
  if (bg(volumes[0]).eq(0)) {
    throw new Error(`account ${accountAddress} has no position on symbol(${symbol})`)
  }
  const priceLimit = getPriceLimit(bg(volumes[0]).negated().toString())
  debug() && console.log(`-- pool(${poolConfig.pool}) account(${accountAddress}) symbol(${symbol}) priceLimit: ${priceLimit}`)
  let res = await broker.closeBet(accountAddress, poolConfig.pool, symbol, priceLimit, oracleSignatures, opts)
  return await formatTradeEvent(res)
})