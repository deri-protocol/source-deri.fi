import {
  calculateEntryPrice,
  calculateFundingRate,
  calculateLiquidationPrice,
  processFundingRate,
  calculateFundingFee,
} from '../../v2/calculation';
import { getPoolConfig } from "../../shared/config"
import { bTokenFactory } from "../../shared/factory"
import { perpetualPoolLiteFactory, pTokenLiteFactory } from "../factory.js"
import {
  bg,
  catchApiError,
  getLatestBlockNumber,
} from '../../shared/utils';
import { fundingRateCache, liquidatePriceCache, priceCache } from '../../shared/api/api_globals';
import { getIndexInfo } from '../../shared/config/token';
import { getSymbolPrices } from '../utils';
import {
  checkApiInput,
  checkApiInputWithoutAccount,
} from '../../shared/utils/derijsnext';

export const getSpecification = async(chainId, poolAddress, symbolId) => {
  const args = [chainId, poolAddress, symbolId]
  return catchApiError(async(chainId, poolAddress, symbolId) => {
    [chainId, poolAddress] = checkApiInputWithoutAccount(chainId, poolAddress);
    //const { bTokenSymbol } = getPoolConfig(poolAddress, '0', '0', 'v2_lite');
    const perpetualPool = perpetualPoolLiteFactory(chainId, poolAddress)
    await perpetualPool.init()
    const bTokenSymbol = perpetualPool.bTokenSymbol
    const [symbolInfo, parameterInfo] = await Promise.all([
      perpetualPool.getSymbol(symbolId),
      perpetualPool.getParameters(),
    ])
    const { symbol, multiplier, feeRatio, fundingRateCoefficient } = symbolInfo;
    const {
      minPoolMarginRatio,
      minInitialMarginRatio,
      minMaintenanceMarginRatio,
      minLiquidationReward,
      maxLiquidationReward,
      liquidationCutRatio,
      protocolFeeCollectRatio,
    } = parameterInfo;

    return {
      symbol,
      bTokenSymbol,
      multiplier: multiplier.toString(),
      feeRatio: feeRatio.toString(),
      fundingRateCoefficient: fundingRateCoefficient.toString(),
      minPoolMarginRatio: minPoolMarginRatio.toString(),
      minInitialMarginRatio: minInitialMarginRatio.toString(),
      minMaintenanceMarginRatio: minMaintenanceMarginRatio.toString(),
      minLiquidationReward: minLiquidationReward.toString(),
      maxLiquidationReward: maxLiquidationReward.toString(),
      liquidationCutRatio: liquidationCutRatio.toString(),
      protocolFeeCollectRatio: protocolFeeCollectRatio.toString(),
      indexConstituents: getIndexInfo(symbol),
    }
  }, args, 'getSpecification', {
    symbol: '',
    bTokenSymbol: '',
    multiplier: '',
    feeRatio: '',
    fundingRateCoefficient: '',
    minPoolMarginRatio: '',
    minInitialMarginRatio: '',
    minMaintenanceMarginRatio: '',
    minLiquidationReward: '',
    maxLiquidationReward: '',
    liquidationCutRatio: '',
    protocolFeeCollectRatio: '',
    indexConstituents: { url: '', tokens: [] },
  })
}

export const getPositionInfo = async(chainId, poolAddress, accountAddress, symbolId) => {
  const args = [chainId, poolAddress, accountAddress, symbolId]
  return catchApiError(async(chainId, poolAddress, accountAddress, symbolId) => {
    [chainId, poolAddress, accountAddress] = checkApiInput(
      chainId,
      poolAddress,
      accountAddress
    );
    const perpetualPool = perpetualPoolLiteFactory(chainId, poolAddress)
    await perpetualPool.init()
    const pToken = perpetualPool.pToken
    const parameterInfo = perpetualPool.parameters 
    const symbolIds = perpetualPool.activeSymbolIds
    const symbolIndex = symbolIds.indexOf(symbolId)

    if (symbolIndex > -1) {
      let promises = [];
      for (let i = 0; i < symbolIds.length; i++) {
        promises.push(perpetualPool.getSymbol(symbolIds[i]));
      }
      const symbols = await Promise.all(promises);

      //const symbol = symbols[symbolIndex].symbol
      //const isOffchainOracleSymbol = perpetualPool.offChainOracleSymbolIds.indexOf(symbolId) > -1
      //const oracleAddress = isOffchainOracleSymbol ? '' : symbols[symbolIndex].oracleAddress
      const [
        symbolInfo,
        liquidity,
        lastUpdatedBlockNumber,
        latestBlockNumber,
        positionInfo,
        margin,
        //latestPrice,
      ] = await Promise.all([
        //const [ parameterInfo, symbolInfo, liquidity, symbolIds, latestBlockNumber, positionInfo, margin, latestPrice] = await Promise.all([
        perpetualPool.getSymbol(symbolId),
        perpetualPool.getLiquidity(),
        perpetualPool.getLastUpdateBlock(),
        getLatestBlockNumber(chainId),
        pToken.getPosition(accountAddress, symbolId),
        pToken.getMargin(accountAddress),
        //getOraclePriceFromCache2.get(chainId, symbol,oracleAddress),
      ]);
      //console.log(latestBlockNumber, lastUpdatedBlockNumber)
      const { volume, cost, lastCumulativeFundingRate } = positionInfo;
      const {
        multiplier,
        fundingRateCoefficient,
        tradersNetVolume,
        cumulativeFundingRate,
      } = symbolInfo;
      const {
        minInitialMarginRatio,
        minMaintenanceMarginRatio,
      } = parameterInfo;

      // promises = [];
      // for (let i = 0; i < symbolIds.length; i++) {
      //   promises.push(perpetualPool.getSymbol(symbolIds[i]));
      // }
      //const symbols = await Promise.all(promises);

      const symbolPrices = await getSymbolPrices(
        chainId,
        symbols,
        perpetualPool.offChainOracleSymbolIds,
        perpetualPool.offChainOracleSymbols
      );
      // promises = [];
      // for (let i = 0; i < symbolIds.length; i++) {
      //   const isOffchain = perpetualPool.offChainOracleSymbolIds.indexOf(symbolIds[i]) > -1
      //   const address = isOffchain ? '' : symbols[i].oracleAddress
      //   const _symbol = symbolList[i]
      //   promises.push(
      //     getOraclePriceFromCache2.get(chainId, _symbol, address),
      //   );
      // }
      // const symbolPrices = await Promise.all(promises);
      let price;
      if (symbolIndex === '-1') {
        price = '0';
      } else {
        price = symbolPrices[symbolIndex];
        priceCache.set(poolAddress, symbolId, price);
      }

      promises = [];
      for (let i = 0; i < symbolIds.length; i++) {
        promises.push(pToken.getPosition(accountAddress, symbolIds[i]));
      }
      const positions = await Promise.all(promises);

      const marginHeld = symbols.reduce((acc, s, index) => {
        return acc.plus(
          bg(symbolPrices[index])
            .times(s.multiplier)
            .times(positions[index].volume)
            .times(minInitialMarginRatio)
            .abs()
        );
      }, bg(0));
      const marginHeldBySymbol = bg(volume)
        .abs()
        .times(multiplier)
        .times(price)
        .times(minInitialMarginRatio);

      const unrealizedPnl = symbols.reduce((acc, s, index) => {
        return acc.plus(
          bg(symbolPrices[index])
            .times(s.multiplier)
            .times(positions[index].volume)
            .minus(positions[index].cost)
        );
      }, bg(0));
      const unrealizedPnlList = symbols.map((s, index) => {
        return [
          s.symbol,
          bg(symbolPrices[index])
            .times(s.multiplier)
            .times(positions[index].volume)
            .minus(positions[index].cost)
            .toString(),
        ];
      }, bg(0));

      const totalCost = positions.reduce((accum, p) => {
        return accum.plus(bg(p.cost));
      }, bg(0));
      const dynamicCost = symbols.reduce((accum, s, index) => {
        if (index !== symbolIndex) {
          return accum.plus(
            bg(positions[index].volume)
              .times(symbolPrices[index])
              .times(s.multiplier)
          );
        } else {
          return accum;
        }
      }, bg(0));

      const fundingFee = calculateFundingFee(
        tradersNetVolume,
        price,
        multiplier,
        fundingRateCoefficient,
        liquidity,
        cumulativeFundingRate,
        lastCumulativeFundingRate,
        lastUpdatedBlockNumber,
        latestBlockNumber,
        volume
      );

      liquidatePriceCache.set(poolAddress, {
        volume,
        margin,
        totalCost,
        dynamicCost,
        price,
        multiplier,
        minMaintenanceMarginRatio,
      });

      return {
        symbol:symbols[symbolIndex].symbol,
        price,
        volume: bg(volume).times(symbols[symbolIndex].multiplier).toString(),
        averageEntryPrice: calculateEntryPrice(
          volume,
          cost,
          multiplier
        ).toString(),
        margin: margin.toString(),
        marginHeld: marginHeld.toString(),
        marginHeldBySymbol: marginHeldBySymbol.toString(),
        unrealizedPnl: unrealizedPnl.toString(),
        unrealizedPnlList,
        fundingFee: fundingFee.toString(),
        liquidationPrice: calculateLiquidationPrice(
          volume,
          margin,
          totalCost,
          dynamicCost,
          multiplier,
          minMaintenanceMarginRatio
        ).toString(),
      };
    } else {
      throw new Error(`-- getPostionInfo: invalid symbolId(${symbolId})`)
    }
  }, args, 'getPositionInfo', {})
}

export const getPositionInfos = async(chainId, poolAddress, accountAddress) => {
  const args = [chainId, poolAddress, accountAddress]
  return catchApiError(async(chainId, poolAddress, accountAddress) => {
    [chainId, poolAddress, accountAddress] = checkApiInput(
      chainId,
      poolAddress,
      accountAddress
    );
    const perpetualPool = perpetualPoolLiteFactory(chainId, poolAddress)
    await perpetualPool.init()
    const pToken = perpetualPool.pToken
    const parameterInfo = perpetualPool.parameters 
    const symbolIds = perpetualPool.activeSymbolIds
    //const symbolIndex = symbolIds.indexOf(symbolId)

      let promises = [];
      for (let i = 0; i < symbolIds.length; i++) {
        promises.push(perpetualPool.getSymbol(symbolIds[i]));
      }
      const symbols = await Promise.all(promises);

      promises = [];
      for (let i = 0; i < symbolIds.length; i++) {
        promises.push(pToken.getPosition(accountAddress, symbolIds[i]));
      }
      const positions = await Promise.all(promises);

      // const symbol = symbols[symbolIndex].symbol
      // const isOffchainOracleSymbol = perpetualPool.offChainOracleSymbolIds.indexOf(symbolId) > -1
      // const oracleAddress = isOffchainOracleSymbol ? '' : symbols[symbolIndex].oracleAddress
      const [
        liquidity,
        lastUpdatedBlockNumber,
        latestBlockNumber,
        margin,
      ] = await Promise.all([
        //const [ parameterInfo, symbolInfo, liquidity, symbolIds, latestBlockNumber, positionInfo, margin, latestPrice] = await Promise.all([
        //perpetualPool.getSymbol(symbolId),
        perpetualPool.getLiquidity(),
        perpetualPool.getLastUpdateBlock(),
        getLatestBlockNumber(chainId),
        //pToken.getPosition(accountAddress, symbolId),
        pToken.getMargin(accountAddress),
        //getOraclePriceFromCache2.get(chainId, symbol,oracleAddress),
      ]);
      //console.log(latestBlockNumber, lastUpdatedBlockNumber)
      const {
        minInitialMarginRatio,
        minMaintenanceMarginRatio,
      } = parameterInfo;

      const symbolList = symbols.map((s) => s.symbol);

      const symbolPrices = await getSymbolPrices(
        chainId,
        symbols,
        perpetualPool.offChainOracleSymbolIds,
        perpetualPool.offChainOracleSymbols
      );

      // promises = [];
      // for (let i = 0; i < symbolIds.length; i++) {
      //   const isOffchain = perpetualPool.offChainOracleSymbolIds.indexOf(symbolIds[i]) > -1
      //   const address = isOffchain ? '' : symbols[i].oracleAddress
      //   const _symbol = symbolList[i]
      //   promises.push(
      //     getOraclePriceFromCache2.get(chainId, _symbol, address)
      //   );
      // }
      // const symbolPrices = await Promise.all(promises);

      const marginHeld = symbols.reduce((acc, s, index) => {
        return acc.plus(
          bg(symbolPrices[index])
            .times(s.multiplier)
            .times(positions[index].volume)
            .times(minInitialMarginRatio)
            .abs()
        );
      }, bg(0));

      const totalCost = positions.reduce((accum, p) => {
        return accum.plus(bg(p.cost));
      }, bg(0));

      return positions.map((p, index) => {
      const symbolId = symbolList[index]
      const symbol = symbols[index]
      const price = symbolPrices[index]

      const { volume, cost, lastCumulativeFundingRate } = p
      const {
        multiplier,
        fundingRateCoefficient,
        tradersNetVolume,
        cumulativeFundingRate,
      } = symbol;
      priceCache.set(poolAddress, symbolId, price);

      const unrealizedPnl = bg(symbolPrices[index]).times(symbol.multiplier).times(p.volume).minus(p.cost)

      const dynamicCost = symbols.reduce((accum, s, idx) => {
        if (idx !== index) {
          return accum.plus(
            bg(positions[idx].volume)
              .times(symbolPrices[idx])
              .times(s.multiplier)
          );
        } else {
          return accum;
        }
      }, bg(0));
      const fundingFee = calculateFundingFee(
        tradersNetVolume,
        price,
        multiplier,
        fundingRateCoefficient,
        liquidity,
        cumulativeFundingRate,
        lastCumulativeFundingRate,
        lastUpdatedBlockNumber,
        latestBlockNumber,
        volume
      );
      const marginHeldBySymbol = bg(volume)
        .abs()
        .times(multiplier)
        .times(price)
        .times(minInitialMarginRatio);

        return {
          symbol: symbol.symbol,
          symbolId: symbol.symbolId,
          price,
          volume: bg(volume).times(symbols[index].multiplier).toString(),
          averageEntryPrice: calculateEntryPrice(
            volume,
            cost,
            multiplier
          ).toString(),
          margin: margin.toString(),
          marginHeld: marginHeld.toString(),
          marginHeldBySymbol: marginHeldBySymbol.toString(),
          unrealizedPnl: unrealizedPnl.toString(),
          //unrealizedPnlList,
          fundingFee: fundingFee.toString(),
          liquidationPrice: calculateLiquidationPrice(
            volume,
            margin,
            totalCost,
            dynamicCost,
            multiplier,
            minMaintenanceMarginRatio
          ).toString(),
        };
      }).filter((p) => p.volume !== '0')
  }, args, 'getPositionInfos', [])
}

export const getWalletBalance = async(chainId, poolAddress, accountAddress) => {
  const args = [chainId, poolAddress, accountAddress]
  return catchApiError(async(chainId, poolAddress, accountAddress) => {
    [chainId, poolAddress, accountAddress] = checkApiInput(
      chainId,
      poolAddress,
      accountAddress
    );
    const { bToken:bTokenAddress } = getPoolConfig(poolAddress, '0', null, 'v2_lite')
    const balance = await bTokenFactory(chainId, bTokenAddress).balanceOf(accountAddress)
    return balance.toString()
  }, args, 'getWalletBalance', '')
}

export const isUnlocked = async(chainId, poolAddress, accountAddress) => {
  const args = [chainId, poolAddress, accountAddress]
  return catchApiError(async(chainId, poolAddress, accountAddress) => {
    [chainId, poolAddress, accountAddress] = checkApiInput(
      chainId,
      poolAddress,
      accountAddress
    );
    const { bToken:bTokenAddress } = getPoolConfig(poolAddress, '0', null, 'v2_lite')
    const bToken = bTokenFactory(chainId, bTokenAddress)
    return await bToken.isUnlocked(accountAddress, poolAddress)
  }, args, 'isUnlocked', '')
}

const _getFundingRate = async(chainId, poolAddress, symbolId) => {
  const perpetualPool = perpetualPoolLiteFactory(chainId, poolAddress)
  await perpetualPool.init()
  const parameterInfo = perpetualPool.parameters
  const symbolIds = perpetualPool.activeSymbolIds
  const symbolIndex = symbolIds.indexOf(symbolId)

  let promises = [];
  for (let i = 0; i < symbolIds.length; i++) {
    promises.push(perpetualPool.getSymbol(symbolIds[i]));
  }
  const symbols = await Promise.all(promises);

  if (symbolIndex > -1) {
    const symbolInfo = symbols[symbolIndex];
    // const symbol = symbols[symbolIndex].symbol;
    // const isOffchainOracleSymbol =
    //   perpetualPool.offChainOracleSymbolIds.indexOf(symbolId) > -1;
    // const oracleAddress = isOffchainOracleSymbol
    //   ? ''
    //   : symbols[symbolIndex].oracleAddress;
    const [liquidity, prices] = await Promise.all([
      perpetualPool.getLiquidity(),
      getSymbolPrices(
        chainId,
        symbols,
        perpetualPool.offChainOracleSymbolIds,
        perpetualPool.offChainOracleSymbols
      ),
    ]);
    const price = prices[symbolIndex]
    priceCache.set(poolAddress, symbolId, price);
    const {
      multiplier,
      fundingRateCoefficient,
      tradersNetVolume,
      feeRatio,
    } = symbolInfo;
    const { minPoolMarginRatio } = parameterInfo;
    const fundingRateArgs = [
      tradersNetVolume,
      price,
      multiplier,
      liquidity,
      fundingRateCoefficient,
    ];
    const fundingRatePerBlock = calculateFundingRate(...fundingRateArgs);
    const fundingRate = processFundingRate(chainId, fundingRatePerBlock);

    const liquidityUsedInAmount = symbols.reduce((accum, a) => {
      return accum.plus(
        bg(a.tradersNetVolume)
          .times(a.price)
          .times(a.multiplier)
          .times(minPoolMarginRatio)
          .abs()
      );
    }, bg(0));

    const res = {
      price,
      multiplier: multiplier.toString(),
      feeRatio: feeRatio.toString(),
      tradersNetVolume: tradersNetVolume.toString(),
      liquidity: liquidity.toString(),
      fundingRateCoefficient: fundingRateCoefficient.toString(),
      minPoolMarginRatio: minPoolMarginRatio.toString(),
      fundingRatePerBlock: fundingRatePerBlock,
      fundingRate: fundingRate,
      liquidityUsed: liquidityUsedInAmount.div(liquidity),
    };
    fundingRateCache.set(chainId, poolAddress, symbolId, res);
    return res;
  } else {
    throw new Error(`-- getFundingRate: invalide symbolId(${symbolId})`);
  }
}

export const getEstimatedFee = async(chainId, poolAddress, volume, symbolId) => {
  const args = [chainId, poolAddress, volume, symbolId]
  return catchApiError(async(chainId, poolAddress, volume, symbolId) => {
    const perpetualPool = perpetualPoolLiteFactory(chainId, poolAddress)
    await perpetualPool.init()

    const symbolIds = perpetualPool.activeSymbolIds
    const symbolIndex = perpetualPool.activeSymbolIds.indexOf(symbolId)

    let promises = [];
    for (let i = 0; i < symbolIds.length; i++) {
      promises.push(perpetualPool.getSymbol(symbolIds[i]));
    }
    const symbols = await Promise.all(promises);
    //const symbol = symbols[symbolIndex]
    let price = priceCache.get(poolAddress, symbolId)
    //console.log('symbol',symbol)

    if (!price) {
      // const symbolName = symbol.symbol;
      // const isOffchainOracleSymbol =
      //   perpetualPool.offChainOracleSymbolIds.indexOf(symbolId) > -1;
      // const oracleAddress = isOffchainOracleSymbol ? '' : symbol.oracleAddress;
      const prices = await getSymbolPrices(
        chainId,
        symbols,
        perpetualPool.offChainOracleSymbolIds,
        perpetualPool.offChainOracleSymbols
      );
      price = prices[symbolIndex]
      priceCache.set(poolAddress, symbolId, price)
    }
    let cache = fundingRateCache.get(chainId, poolAddress, symbolId)
    if (!cache || !cache.multiplier) {
      await _getFundingRate(chainId, poolAddress, symbolId)
      cache = fundingRateCache.get(chainId, poolAddress, symbolId)
    }
    const { multiplier, feeRatio } = cache;
    return bg(volume).abs().times(price).times(multiplier).times(feeRatio).toString()
  }, args, 'getFundingFee', '')
}
export const getEstimatedMargin = async(
  chainId,
  poolAddress,
  accountAddress,
  volume,
  leverage,
  symbolId,
) => {
  const args = [chainId, poolAddress, accountAddress, volume, leverage, symbolId]
  return catchApiError(async(chainId, poolAddress, accountAddress, volume, leverage, symbolId) => {
    //const { symbol } = getPoolConfig(poolAddress, '0', symbolId, 'v2_lite');
    //console.log('symbol',symbol)
    const perpetualPool = perpetualPoolLiteFactory(chainId, poolAddress)
    await perpetualPool.init()
    const symbolIds = perpetualPool.activeSymbolIds
    const symbolIndex = symbolIds.indexOf(symbolId)
    let promises = [];
    for (let i = 0; i < symbolIds.length; i++) {
      promises.push(perpetualPool.getSymbol(symbolIds[i]));
    }
    const symbols = await Promise.all(promises);
    if (symbolIndex > -1) {
      // const symbol = symbols[symbolIndex].symbol
      // const isOffchainOracleSymbol = perpetualPool.offChainOracleSymbolIds.indexOf(symbolId) > -1
      //const oracleAddress = isOffchainOracleSymbol ? '' : symbols[symbolIndex].oracleAddress

      const prices = await getSymbolPrices(
        chainId,
        symbols,
        perpetualPool.offChainOracleSymbolIds,
        perpetualPool.offChainOracleSymbols
      );
      const price = prices[symbolIndex]
      priceCache.set(poolAddress, symbolId, price)
      const { multiplier } = symbols[symbolIndex]
      return bg(volume).abs().times(price).times(multiplier).div(bg(leverage)).toString()
    } else {
      throw new Error(`-- getEstimatedMargin: invalid symbolId(${symbolId})`)
    }

  }, args, 'getEstimatedMargin', '')
}

export const getFundingRateCache = async(chainId, poolAddress, symbolId) => {
  return fundingRateCache.get(chainId, poolAddress, symbolId)
}

export const getFundingRate = async(chainId, poolAddress, symbolId) => {
  const args = [chainId, poolAddress, symbolId]
  return catchApiError(async(chainId, poolAddress, symbolId) => {
    [chainId, poolAddress ] = checkApiInput(
      chainId,
      poolAddress
    );
    const res = await _getFundingRate(chainId, poolAddress, symbolId)
    const {fundingRate, fundingRatePerBlock, liquidity, tradersNetVolume, multiplier} = res
    return {
      fundingRate0: fundingRate.times(100).toString(),
      fundingRatePerBlock: fundingRatePerBlock.toString(),
      liquidity: liquidity.toString(),
      volume: '-',
      tradersNetVolume: bg(tradersNetVolume).times(multiplier).toString()
    }
  }, args, 'getFundingRate', {
    fundingRate0: '',
    fundingRatePerBlock: '',
    liquidity: '',
    volume: '',
    tradersNetVolume: '',
  })
}

export const getEstimatedFundingRate = async(chainId, poolAddress, newNetVolume, symbolId) => {
  const args = [chainId, poolAddress, newNetVolume, symbolId]
  return catchApiError(
    async (chainId, poolAddress, newNetVolume, symbolId) => {
      let res = fundingRateCache.get(chainId, poolAddress, symbolId);
      if (!res) {
        res = await _getFundingRate(chainId, poolAddress, symbolId);
      }
      const args = [
        bg(res.tradersNetVolume).plus(newNetVolume).toString(),
        res.price,
        res.multiplier,
        res.liquidity,
        res.fundingRateCoefficient,
      ];
      let fundingRate1 = calculateFundingRate(...args);
      fundingRate1 = processFundingRate(chainId, fundingRate1);
      return {
        fundingRate1: fundingRate1.times(100).toString(),
      };
    },
    args,
    'getEstimatedFundingRate',
    ''
  );
}

export const getLiquidityUsed = async (chainId, poolAddress, symbolId) => {
  const args = [chainId, poolAddress, symbolId];
  return catchApiError(
    async (chainId, poolAddress, symbolId) => {
    [chainId, poolAddress ] = checkApiInputWithoutAccount(
      chainId,
      poolAddress,
    );

      let res = fundingRateCache.get(chainId, poolAddress, symbolId);
      if (!res) {
        res = await _getFundingRate(chainId, poolAddress, symbolId);
      }
      return {
        liquidityUsed0: res.liquidityUsed.times(100).toString(),
      };
    },
    args,
    'getLiquidityUsed',
    ''
  );
};

export const getEstimatedLiquidityUsed = async(chainId, poolAddress, newNetVolume, symbolId) => {
  const args = [chainId, poolAddress, newNetVolume, symbolId]
  return catchApiError(
    async () => {
      let res = fundingRateCache.get(chainId, poolAddress, symbolId);
      if (!res) {
        res = await _getFundingRate(chainId, poolAddress, symbolId);
      }
      const { pToken: pTokenAddress } = getPoolConfig(
        poolAddress,
        '0',
        symbolId,
        'v2_lite'
      );
      const perpetualPool = perpetualPoolLiteFactory(chainId, poolAddress);
      const pToken = pTokenLiteFactory(chainId, pTokenAddress);
      const symbolIds = await pToken.getActiveSymbolIds();
      let promises = [];
      for (let i = 0; i < symbolIds.length; i++) {
        promises.push(perpetualPool.getSymbol(symbolIds[i]));
      }
      const symbols = await Promise.all(promises);

      let liquidityUsed0 = symbols.reduce((acc, s, index) => {
        if (index === parseInt(symbolId)) {
          return acc.plus(
            bg(s.price)
              .times(s.multiplier)
              .times(s.tradersNetVolume.plus(newNetVolume))
              .abs()
          );
        } else {
          return acc.plus(
            bg(s.price).times(s.multiplier).times(s.tradersNetVolume).abs()
          );
        }
      }, bg(0));
      const liquidityUsed1 = liquidityUsed0
        .times(res.minPoolMarginRatio)
        .div(res.liquidity);
      return {
        liquidityUsed1: liquidityUsed1.times(100).toString(),
      };
    },
    args,
    'getEstimatedLiquidityUsed',
    ''
  );
}
