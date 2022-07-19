import { BrokerImplementationFactory, dipBrokerFactory, ERC20Factory } from "../contract/factory"
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
  accountAddress = checkAddress(accountAddress)
  bTokenSymbol = checkToken(bTokenSymbol)
  symbol = checkToken(symbol)
  const brokerAddress = getBrokerAddress(chainId)
  const broker = dipBrokerFactory(chainId, brokerAddress, { isNodeEnv })
  let symbolConfig = getSymbol(chainId, symbol)
  const bTokenConfig = getBToken(chainId, bTokenSymbol)
  const pool = poolFactory(chainId, symbolConfig.pool)
  await pool.init()
  const poolConfig = getPoolConfig(chainId, symbolConfig.pool)
  const oracleSignatures = await getSymbolsOracleInfo(chainId, pool.symbols.map((s) => s.symbol))
  const symbolInfo = pool.symbols.find((s) => s.symbol === symbol)

  const volume = bg(amount).div(symbolInfo.strikePrice).negated().toString()
  const priceLimit = getPriceLimit(volume)
  debug() && console.log(`amount(${amount}) strike(${symbolInfo.strikePrice}) volume(${volume}) priceLimit(${priceLimit}) bToken(${bTokenConfig.bTokenAddress}) broker(${brokerAddress})`)
  let res = await broker.trade(accountAddress, poolConfig.pool, bTokenConfig.bTokenAddress, false, toWei(amount, bTokenConfig.bTokenDecimals || 18), symbol, toWei(volume), priceLimit, oracleSignatures, opts)
  return res
})
