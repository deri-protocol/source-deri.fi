import {
  checkApiInput,
  checkAmount,
  checkChainId,
  DeriEnv,
  MAX_UINT256_DIV_ONE,
} from '../../shared/config';
import { bg } from '../../shared/utils';
import { ERC20Factory } from '../../shared/contract/factory';
import { catchTxApiError } from '../../shared/utils/api';
import {
  checkToken,
  getBTokenAddress,
  getDeriLensConfig,
  getSymbolInfo,
  isArbiChain,
  isBSCChain,
  isOptionSymbol,
} from "../config";
import { poolImplementationFactory } from '../contract/factory/pool';
import { sendTxWithOracleSignature } from './shared';
import { mintableERC20Factory, tokenVaultFactory } from '../contract/factory/rest';
import { deriLensFactoryProxy } from '../contract/factory/deri_lens';
import { calculateDpmmCost } from '../utils/futures';
import { isPowerSymbol } from '../utils/power';
import { getLensPropAlias } from '../utils/alias';

// mining
export const addLiquidity = async (
  chainId,
  poolAddress,
  accountAddress,
  amount,
  bTokenSymbol,
  opts,
) => {
  return catchTxApiError(async () => {
    [chainId, poolAddress, accountAddress] = checkApiInput(
      chainId,
      poolAddress,
      accountAddress
    );
    amount = checkAmount(amount);
    bTokenSymbol = checkToken(bTokenSymbol);
    const pool = poolImplementationFactory(chainId, poolAddress);
    if (!pool.inited) {
      await pool.init();
      // await pool.getBTokens();
    }
    //const bTokenInfo = getBTokenInfo(symbolName, pool.bTokens)
    return await sendTxWithOracleSignature(
      chainId,
      pool.symbols[0],
      pool.symbols.map((s) => s.symbol),
      pool.addLiquidity.bind(pool),
      [accountAddress, getBTokenAddress(bTokenSymbol, pool.bTokens), amount, opts]
    );
    //return await pool.addLiquidity(accountAddress, getBTokenAddress(bTokenSymbol, pool.bTokens), amount);
  }, [chainId, opts]);
};

export const removeLiquidity = async (
  chainId,
  poolAddress,
  accountAddress,
  amount,
  bTokenSymbol,
  isMaximum = false,
  opts,
) => {
  return catchTxApiError(async () => {
    [chainId, poolAddress, accountAddress] = checkApiInput(
      chainId,
      poolAddress,
      accountAddress
    );
    amount = checkAmount(amount);
    bTokenSymbol = checkToken(bTokenSymbol);
    const pool = poolImplementationFactory(chainId, poolAddress);
    if (!pool.inited) {
      await pool.init();
      // await pool.getBTokens();
    }
    if (isMaximum) {
      amount = MAX_UINT256_DIV_ONE
    }
    return await sendTxWithOracleSignature(
      chainId,
      pool.symbols[0],
      pool.symbols.map((s) => s.symbol),
      pool.removeLiquidity.bind(pool),
      [accountAddress, getBTokenAddress(bTokenSymbol, pool.bTokens), amount, opts],
    );
    //return await pool.removeLiquidity(accountAddress, getBTokenAddress(bTokenSymbol, pool.bTokens), amount);
  }, [chainId, opts]);
};

//trading
export const unlock = async (
  chainId,
  poolAddress,
  accountAddress,
  bTokenSymbol,
  opts,
) => {
  return catchTxApiError(async () => {
    [chainId, poolAddress, accountAddress] = checkApiInput(
      chainId,
      poolAddress,
      accountAddress
    );
    bTokenSymbol = checkToken(bTokenSymbol);
    const pool = poolImplementationFactory(chainId, poolAddress);
    if (!pool.inited) {
      await pool.init();
    }
    const bTokenAddress = getBTokenAddress(bTokenSymbol, pool.bTokens)
    const bToken = ERC20Factory(chainId, bTokenAddress);
    return await bToken.unlock(accountAddress, poolAddress, opts);
  }, [chainId, opts]);
};

export const depositMargin = async (
  chainId,
  poolAddress,
  accountAddress,
  amount,
  bTokenSymbol,
  opts,
) => {
  return catchTxApiError(async () => {
    [chainId, poolAddress, accountAddress] = checkApiInput(
      chainId,
      poolAddress,
      accountAddress
    );
    amount = checkAmount(amount);
    bTokenSymbol = checkToken(bTokenSymbol);
    const pool = poolImplementationFactory(chainId, poolAddress);
    if (!pool.inited) {
      await pool.init();
    }
    return await sendTxWithOracleSignature(
      chainId,
      pool.symbols[0],
      pool.symbols.map((s) => s.symbol),
      pool.addMargin.bind(pool),
      [accountAddress, getBTokenAddress(bTokenSymbol, pool.bTokens), amount, opts]
    );
    //return await pool.addMargin(accountAddress, getBTokenAddress(bTokenSymbol, pool.bTokens), amount);
  }, [chainId, opts]);
};

export const withdrawMargin = async (
  chainId,
  poolAddress,
  accountAddress,
  amount,
  bTokenSymbol,
  isMaximum,
  opts,
) => {
  return catchTxApiError(async () => {
    [chainId, poolAddress, accountAddress] = checkApiInput(
      chainId,
      poolAddress,
      accountAddress
    );
    amount = checkAmount(amount);
    bTokenSymbol = checkToken(bTokenSymbol);
    const pool = poolImplementationFactory(chainId, poolAddress);
    if (!pool.inited) {
      await pool.init();
      // await pool.getBTokens();
    }
    if (isMaximum) {
      amount = MAX_UINT256_DIV_ONE
    }
    return await sendTxWithOracleSignature(
      chainId,
      pool.symbols[0],
      pool.symbols.map((s) => s.symbol),
      pool.removeMargin.bind(pool),
      [accountAddress, getBTokenAddress(bTokenSymbol, pool.bTokens), amount, opts]
    );
    // const symbolInfo = getSymbolInfo(symbolName, pool.symbols)
    // return await sendTxWithOracleSignature(
    //   chainId,
    //   symbolInfo,
    //   pool.symbols.map((s) => s.symbol),
    //   pool.trade,
    //   [accountAddress, getBTokenAddress(bTokenSymbol, pool.bTokens), amount]
    // );
    // return await pool.removeMargin(accountAddress, getBTokenAddress(bTokenSymbol, pool.bTokens), amount);
  }, [chainId, opts]);
};

export const tradeWithMargin = async (
  chainId,
  poolAddress,
  accountAddress,
  newVolume,
  symbolName,
  limitedPercent= '0.001',
  opts,
) => {
  return catchTxApiError(async () => {
    [chainId, poolAddress, accountAddress] = checkApiInput(
      chainId,
      poolAddress,
      accountAddress
    );
    newVolume = checkAmount(newVolume);
    symbolName = checkToken(symbolName);
    const pool = poolImplementationFactory(chainId, poolAddress);
    await pool.init(accountAddress);
    await pool.getSymbols();
    const symbolInfo = getSymbolInfo(symbolName, pool.symbols)
    // const limitedPercent = 0.03
    const price =
      isOptionSymbol(symbolInfo) || isPowerSymbol(symbolInfo)
        ? symbolInfo.theoreticalPrice
        : symbolInfo.curIndexPrice;
    const tradePrice = calculateDpmmCost(
      price,
      symbolInfo.K,
      symbolInfo.netVolume,
      newVolume
    )
      .div(newVolume)
      .toString();
    const priceLimit = bg(newVolume).gte(0)
      ? bg(tradePrice)
          .plus(bg(limitedPercent).times(symbolInfo.markPrice))
          .toString()
      : bg(tradePrice)
          .minus(bg(limitedPercent).times(symbolInfo.markPrice))
          .toString();
    const res =  await sendTxWithOracleSignature(
      chainId,
      symbolInfo,
      pool.symbols.map((s) => s.symbol),
      pool.trade.bind(pool),
      [accountAddress, symbolName, newVolume, priceLimit, opts]
    );

    // get trade price
    try {
      const events = await pool.symbolManager.contract.getPastEvents('Trade', {
        filter: { pTokenId: parseInt(pool.account.pTokenId) },
        fromBlock: res.blockNumber,
        toBlock: res.blockNumber
      })
      if (events.length === 1) {
        const event = await pool.symbolManager.formatTradeEvent(events[0], pool.symbols, accountAddress)
        res.volume = event.volume
        res.price = event.price
        res.direction = event.direction
      }
    } catch (err) {
      // ignore error
    }
    return res
  }, [chainId, opts]);
};

export const closePosition = async (
  chainId,
  poolAddress,
  accountAddress,
  symbolName,
  opts,
) => {
  return catchTxApiError(async () => {
    [chainId, poolAddress, accountAddress] = checkApiInput(
      chainId,
      poolAddress,
      accountAddress
    );
    symbolName = checkToken(symbolName);
    const pool = poolImplementationFactory(chainId, poolAddress);
    await pool.init(accountAddress);
    await pool.getSymbols();
    await pool.getPositions(accountAddress);
    // if (!Array.isArray(pool.positions) || pool.positions.length === 0) {
    //   await pool.getInfo(accountAddress)
    // }
    const { volume } = await pool.getPosition(accountAddress, symbolName);
    if (!bg(volume).eq(0)) {
      const newVolume = bg(volume).negated().toString();
      const symbolInfo = getSymbolInfo(symbolName, pool.symbols)
    //const limitedPercent = 0.03
    const limitedPercent= '0.001';
    const price = isOptionSymbol(symbolInfo) || isPowerSymbol(symbolInfo) ? symbolInfo.theoreticalPrice : symbolInfo.curIndexPrice

    const tradePrice = calculateDpmmCost(
      price,
      symbolInfo.K,
      symbolInfo.netVolume,
      newVolume
    )
      .div(newVolume)
      .toString();
    const priceLimit = bg(newVolume).gte(0)
      ? bg(tradePrice)
          .plus(bg(limitedPercent).times(symbolInfo.markPrice))
          .toString()
      : bg(tradePrice)
          .minus(bg(limitedPercent).times(symbolInfo.markPrice))
          .toString();
      const res = await sendTxWithOracleSignature(
        chainId,
        symbolInfo,
        pool.symbols.map((s) => s.symbol),
        pool.trade.bind(pool),
        [accountAddress, symbolName, newVolume, priceLimit, opts]
      );

      // get trade price
      try {
        const events = await pool.symbolManager.contract.getPastEvents('Trade', {
          filter: { pTokenId: parseInt(pool.account.pTokenId) },
          fromBlock: res.blockNumber,
          toBlock: res.blockNumber
        })
        if (events.length === 1) {
          const event = await pool.symbolManager.formatTradeEvent(events[0], pool.symbols, accountAddress)
          res.volume = event.volume
          res.price = event.price
          res.direction = event.direction
        }
        return res
      } catch (err) {
      // ignore error
    }
    } else {
      throw new Error('no position to close');
    }
  }, [chainId, opts]);
};

const toWei = (amount, bTokenDecimals=18) => {
  return  bg(amount, bTokenDecimals).toFixed(0).toString()
}

export const mintTokenV3 = async (chainId, accountAddress, bTokenSymbol, opts) => {
  return catchTxApiError(async () => {
    chainId = checkChainId(chainId);
    bTokenSymbol = bTokenSymbol.toUpperCase();
    const configs = [
      {
        chainId: '97',
        address: '0x16728A3d98671c6b304510819D9C59A197CCcdC2',
        pool_testnet: '0x5b1a7AEB15EB5380EB35ceC8B40438EcB6D51018',
        pool_dev: '0xAADA94FcDcD7FCd7488C8DFc8eddaac81d7F71EE',
        mintAmounts: {
          BUSD: 10000,
          SXP: 10000,
          ADA: 10000,
          CAKE: 2000,
          MATIC: 5000,
          AAVE: 100,
          TUSD: 10000,
          TRX: 5000,
          BTCB: '0.5',
          ETH: 5,
          LTC: 100,
          XRP: 20000,
          USDT: 5000,
          USDC: 5000,
          UST: 5000,
          LUNA: 500,
          DOGE: 10000,
        },
        decimals: {
          USDT: 6,
          USDC: 6,
          //UST: 18,
          LUNA: 6,
          DOGE: 8,
        }
      },
      {
        chainId: '421611',
        address: '0x39096E1D96D40C6aBe70F4fdB41fbE01fa61c51B',
        pool_testnet: '0xF48D3144d632e166690E3ba2c5f45F00F571BB50',
        pool_dev: '0x296A1CDdE93a99B4591486244f7442E25CA596a6',
        mintAmounts: {
          WBTC: '0.5',
          DAI: 1000,
          AAVE: 10,
          LINK: 100,
          USDC: 1000,
          // USDT: 1000,
        },
        decimals: {
          WBTC: 8,
          USDC: 6,
          // USDT: 6,
        }
      }
    ];
    const config = configs.find((c) => c.chainId === chainId);
    const poolName = `pool_${DeriEnv.get()}`
    if (!config || !config.mintAmounts[bTokenSymbol] || !config.address || !config[poolName]) {
      throw new Error(
        `unsupported chainId(${chainId}) or bTokenSymbol(${bTokenSymbol}) for mintTokenV3`
      );
    }
    const mintAmount = toWei(config.mintAmounts[bTokenSymbol], config.decimals[bTokenSymbol]);
    const lensConfig = getDeriLensConfig(DeriEnv.get(), chainId)
    const lens = deriLensFactoryProxy(chainId, lensConfig.address)
    const tokens = await lens.getMarketsInfo(config[poolName])
    const bTokenInfo = tokens.find((b) => getLensPropAlias('underlyingSymbol', b) === bTokenSymbol)
    if (isBSCChain(chainId)) {
      if (bTokenInfo) {
        const tokenVault = tokenVaultFactory(chainId, config.address);
        return await tokenVault.withdraw(
          accountAddress,
          getLensPropAlias('underlying', bTokenInfo),
          mintAmount,
          opts,
        );
      } else {
        throw new Error(
          `unsupported bTokenSymbol(${bTokenSymbol}) of pool(${config[poolName]}) for mintTokenV3`
        );
      }
    } else if (isArbiChain(chainId)) {
      const mintableERC20 = mintableERC20Factory(chainId, getLensPropAlias('underlying', bTokenInfo))
      return await mintableERC20.mint(accountAddress, mintAmount, opts)
    }
  }, [chainId, opts]);
};
