import poolProdConfig from '../../config/base/pool.prod.json';
import poolTestnetConfig from '../../config/base/pool.testnet.json';
import poolDevConfig from '../../config/base/pool.dev.json';
import { checkEnv, DeriEnv, Env } from './env';
import { checkChainId } from './chain';

// constant
export const SECONDS_IN_A_DAY = 86400;  // 60 * 60 * 24

export const getPoolConfigList = ({ env, chainId }) => {
  env = checkEnv(env)
  let configList = env === Env.PROD ? poolProdConfig : env === Env.TESTNET ? poolTestnetConfig : poolDevConfig
  if (chainId) {
    chainId = checkChainId(chainId)
    return configList.filter((c) => c.chainId === chainId)
  } else {
    return configList
  }
}

export const getPoolConfig = (chainId, poolAddress) => {
  const configList = getPoolConfigList({chainId})
  const config = configList.find((c) => c.chainId === chainId && c.pool === poolAddress)
  if (config) {
    return config
  }
  throw new Error(`Cannot find pool config: chainId(${chainId}) poolAddress(${poolAddress})`)
}

export const getBTokenList = (chainId) => {
  const configList = getPoolConfigList({ chainId })
  const bTokenList = configList.reduce((acc, pool) => [...acc, ...(pool.bTokens.map((b) => {
    if (b.bTokenDecimals) {
      return {
        chainId: pool.chainId,
        pool: pool.pool,
        bTokenAddress: b.bTokenAddress,
        bTokenSymbol: b.bTokenSymbol,
        bTokenDecimals: b.bTokenDecimals,
        bTokenDiscount: b.bTokenDiscount,
      }
    } else {
      return {
        chainId: pool.chainId,
        pool: pool.pool,
        bTokenAddress: b.bTokenAddress,
        bTokenSymbol: b.bTokenSymbol,
        bTokenDiscount: b.bTokenDiscount,
      }
    }
  }
  ))], [])
  return bTokenList.reduce((acc, bToken) => {
    if (acc.map((b) => b.bTokenSymbol).indexOf(bToken.bTokenSymbol) === -1) {
      return [...acc, bToken]
    }
    return acc
  }, [])
}

export const getB0 = (chainId) => {
  const bTokenList = getBTokenList(chainId);
  if (["56", "97"].includes(chainId)) {
    return bTokenList.find((b) => b.bTokenSymbol === "BUSD");
  } else if (["42161", "421611"].includes(chainId)) {
    return bTokenList.find((b) => b.bTokenSymbol === "USDC");
  }
};

export const getBToken = (chainId, bTokenSymbol) => {
  const bTokenList = getBTokenList(chainId)
  const config = bTokenList.find((b) => b.bTokenSymbol === bTokenSymbol)
  if (config) {
    return config
  }
  throw new Error(`Cannot find bToken config: chainId(${chainId}) bTokenSymbol(${bTokenSymbol})`)
}

export const getBTokenByAddress = (chainId, bTokenAddress) => {
  const bTokenList = getBTokenList(chainId)
  const config = bTokenList.find((b) => b.bTokenAddress === bTokenAddress)
  if (config) {
    return config
  }
  throw new Error(`Cannot find bToken config: chainId(${chainId}) bTokenSymbol(${bTokenAddress})`)
}

export const getSymbolList = (chainId) => {
  const configList = getPoolConfigList({ chainId })
  const symbolList = configList.reduce((acc, pool) => [...acc, ...(pool.symbols.map((s) => ({
    chainId: pool.chainId,
    pool: pool.pool,
    symbolManager: pool.symbolManager,
    initialBlock: pool.initialBlock,
    category: s.category,
    symbol: s.symbol,
    symbolId: s.symbolId,
    unit: s.unit,
    powerSymbol: s.powerSymbol ? s.powerSymbol : null,
  })))], [])
  return symbolList.reduce((acc, symbol) => {
    if (acc.map((s) => s.symbol).indexOf(symbol.symbol) === -1) {
      return [...acc, symbol]
    }
    return acc
  }, [])
}

export const getSymbol = (chainId, symbolName) => {
  const symbolList = getSymbolList(chainId)
  const config = symbolList.find((s) => s.symbol === symbolName)
  if (config) {
    return config
  }
  throw new Error(`Cannot find symbol config: chainId(${chainId}) symbol(${symbolName})`)
}

export const getBrokerAddress = (chainId) => {
  const configList = getPoolConfigList(DeriEnv.get())
  const config = configList.find((c) => c.chainId === chainId)
  if (config) {
    return config.broker
  }
  throw new Error(`Cannot find broker address: chainId(${chainId})`)
}
