import { bTokenFactory } from '../../shared/factory';
import {
  getPoolBTokenIdList,
  getPoolBTokenList,
  getPoolConfig2,
  getPoolSymbolIdList,
  getPoolSymbolList,
} from '../../shared/config';
import { bg, min, max } from '../../shared/utils'
import { getOraclePrice } from '../../shared/utils/oracle'
import { getIndexInfo } from '../../shared/config/token';
import { fundingRateCache, liquidatePriceCache, priceCache } from '../../shared/api/api_globals';
import {
  calculateEntryPrice,
  calculateLiquidationPrice,
  calculateFundingRate,
  calculateFundingFee,
  processFundingRate,
} from '../calculation';
import { perpetualPoolFactory, pTokenFactory } from '../factory';

export const getSpecification = async (
  chainId,
  poolAddress,
  symbolId,
) => {
  try {
    const {symbol } = getPoolConfig2(poolAddress, undefined, symbolId)
    const bTokens = getPoolBTokenList(poolAddress)
    const perpetualPool = perpetualPoolFactory(chainId, poolAddress);
    const [symbolInfo, parameterInfo] = await Promise.all([
      perpetualPool.getSymbol(symbolId),
      perpetualPool.getParameters(),
    ])
    const bTokenDiscounts = (await Promise.all(
      bTokens.reduce(
        (acc, b, index) =>
          acc.concat([perpetualPool.getBToken(index.toString())]),
        []
      )
    )).map((b) => b.discount);
    const { multiplier, feeRatio, fundingRateCoefficient} = symbolInfo
    const {
      minPoolMarginRatio,
      minInitialMarginRatio,
      minMaintenanceMarginRatio,
      minLiquidationReward,
      maxLiquidationReward,
      liquidationCutRatio,
      protocolFeeCollectRatio,
    } = parameterInfo
    return {
      symbol: symbol,
      bTokenSymbol: bTokens.map((b) => b.bTokenSymbol),
      bTokenMultiplier: bTokenDiscounts.map((b) => b.toString()),
      multiplier: multiplier.toString(),
      feeRatio: feeRatio.toString(),
      fundingRateCoefficient: fundingRateCoefficient.toString(),
      minPoolMarginRatio: minPoolMarginRatio.toString(),
      minInitialMarginRatio: minInitialMarginRatio.toString(),
      minMaintenanceMarginRatio: minMaintenanceMarginRatio.toString(),
      //minAddLiquidity: minAddLiquidity.toString(),
      //redemptionFeeRatio: redemptionFeeRatio.toString(),
      minLiquidationReward: minLiquidationReward.toString(),
      maxLiquidationReward: maxLiquidationReward.toString(),
      liquidationCutRatio: liquidationCutRatio.toString(),
      protocolFeeCollectRatio: protocolFeeCollectRatio.toString(),
      indexConstituents: getIndexInfo(symbol)
    }
  } catch (err) {
    console.log(`${err}`)
  }
  return {
    symbol: '',
    bTokenSymbol: [],
    bTokenMultiplier: [],
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
  };
};

export const getPositionInfo = async (chainId, poolAddress, accountAddress, symbolId) => {
  try {
    const symbolConfigList = getPoolSymbolList(poolAddress)
    const bTokenIdList = getPoolBTokenIdList(poolAddress)
    const symbolIdList = symbolConfigList.map((i) => i.symbolId)
    const symbolList = symbolConfigList.map((i) => i.symbol)
    //console.log('bTokenList', bTokenList)
    const perpetualPool = perpetualPoolFactory(chainId, poolAddress);
    const {pToken: pTokenAddress } = getPoolConfig2(poolAddress, null, symbolId)
    const pToken = pTokenFactory(chainId, pTokenAddress);
    const [symbolInfo, parameterInfo, lastUpdatedBlockNumber, latestBlockNumber, positionInfo, margins, positions, latestPrice] = await Promise.all([
      perpetualPool.getSymbol(symbolId),
      perpetualPool.getParameters(),
      perpetualPool.getLastUpdatedBlockNumber(),
      perpetualPool.getLatestBlockNumber(),
      pToken.getPosition(accountAddress, symbolId),
      pToken.getMargins(accountAddress),
      pToken.getPositions(accountAddress),
      getOraclePrice(chainId, symbolList[parseInt(symbolId)])
    ])
    const { volume, cost, lastCumulativeFundingRate } = positionInfo
    const { multiplier, fundingRateCoefficient, tradersNetVolume, cumulativeFundingRate } = symbolInfo
    const {
      minInitialMarginRatio,
      minMaintenanceMarginRatio,
    } = parameterInfo
    let promises = []
    for (let i=0; i<bTokenIdList.length; i++) {
      promises.push(perpetualPool.getBToken(bTokenIdList[i]))
    }
    const bTokens = await Promise.all(promises)
    const margin = bTokens.reduce((accum, a, index) => {
      return accum.plus(bg(a.price).times(a.discount).times(margins[index]))
    }, bg(0))

    promises = []
    for (let i=0; i<symbolIdList.length; i++) {
      promises.push(perpetualPool.getSymbol(symbolIdList[i]))
    }
    const symbols = await Promise.all(promises)
    promises = []
    for (let i=0; i<symbolList.length; i++) {
      promises.push(getOraclePrice(chainId, symbolList[i]))
    }
    const symbolPrices = await Promise.all(promises)
    const price = symbolPrices[symbolId]
    priceCache.set(poolAddress, symbolId, price)
    const marginHeld = symbols.reduce((accum, s, index) => {
      return accum.plus(bg(symbolPrices[index]).times(s.multiplier).times(positions[index].volume).times(minInitialMarginRatio).abs())
    }, bg(0))
    const marginHeldBySymbol = bg(volume).abs().times(multiplier).times(symbolPrices[symbolId]).times(minInitialMarginRatio)
    //console.log('margin', margin.toString(), marginHeld.toString())
    //
    //const unrealizedPnl = bg(positions[symbolId].volume).times(price).times(multiplier).minus(positions[symbolId].cost)
    const unrealizedPnl = symbols.reduce((accum, s, index) => {
      return accum.plus(bg(symbolPrices[index]).times(s.multiplier).times(positions[index].volume).minus(positions[index].cost))
    }, bg(0))
    const unrealizedPnlList = symbols.map((s, index) => {
      return [s.symbol, bg(symbolPrices[index]).times(s.multiplier).times(positions[index].volume).minus(positions[index].cost).toString()]
    })

    const totalCost = positions.reduce((accum, a) => {
      return accum.plus(bg(a.cost))
    }, bg(0))
    const dynamicCost = symbols.reduce((accum, s, index) => {
      if (index !== parseInt(symbolId)) {
        return accum.plus(bg(positions[index].volume).times(symbolPrices[index]).times(s.multiplier))
      } else {
        return accum
      }
    }, bg(0))
    //console.log('cost', costTotal.toString())
    const liquidity = bTokens.reduce((accum, i) => accum.plus(bg(i.liquidity).times(i.price).times(i.discount).plus(i.pnl)), bg(0))
    const fundingFee = calculateFundingFee(
      tradersNetVolume,
      latestPrice,
      multiplier,
      fundingRateCoefficient,
      liquidity,
      cumulativeFundingRate,
      lastCumulativeFundingRate,
      lastUpdatedBlockNumber,
      latestBlockNumber,
      volume,
    );

    // set liquidatePrice cache
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
      price: price,
      volume: bg(volume).times(multiplier).toString(),
      averageEntryPrice: calculateEntryPrice(volume, cost, multiplier).toString(),
      margin: margin.toString(),
      marginHeld: marginHeld.toString(),
      marginHeldBySymbol: marginHeldBySymbol.toString(),
      unrealizedPnl: unrealizedPnl.toString(),
      unrealizedPnlList,
      liquidationPrice: calculateLiquidationPrice(
        volume,
        margin,
        totalCost,
        dynamicCost,
        multiplier,
        minMaintenanceMarginRatio
      ).toString(),
      fundingFee: fundingFee.toString()
    };
  } catch(err) {
    console.log(`${err}`)
  }
  return {};
}

export const getPositionInfos = async (chainId, poolAddress, accountAddress) => {
  try {
    const symbolConfigList = getPoolSymbolList(poolAddress)
    const bTokenIdList = getPoolBTokenIdList(poolAddress)
    const symbolIdList = symbolConfigList.map((i) => i.symbolId)
    const symbolList = symbolConfigList.map((i) => i.symbol)
    //console.log('bTokenList', bTokenList)
    const perpetualPool = perpetualPoolFactory(chainId, poolAddress);
    const {pToken: pTokenAddress } = getPoolConfig2(poolAddress, null, '0')
    const pToken = pTokenFactory(chainId, pTokenAddress);
    const [parameterInfo, lastUpdatedBlockNumber, latestBlockNumber, margins, positions] = await Promise.all([
      //perpetualPool.getSymbol(symbolId),
      perpetualPool.getParameters(),
      perpetualPool.getLastUpdatedBlockNumber(),
      perpetualPool.getLatestBlockNumber(),
      //pToken.getPosition(accountAddress, symbolId),
      pToken.getMargins(accountAddress),
      pToken.getPositions(accountAddress),
      //getOraclePrice(chainId, symbolList[parseInt(symbolId)])
    ])
    const {
      minInitialMarginRatio,
      minMaintenanceMarginRatio,
    } = parameterInfo
    let promises = []
    for (let i=0; i<bTokenIdList.length; i++) {
      promises.push(perpetualPool.getBToken(bTokenIdList[i]))
    }
    const bTokens = await Promise.all(promises)
    promises = []
    for (let i=0; i<symbolIdList.length; i++) {
      promises.push(perpetualPool.getSymbol(symbolIdList[i]))
    }
    const symbols = await Promise.all(promises)
    promises = []
    for (let i=0; i<symbolList.length; i++) {
      promises.push(getOraclePrice(chainId, symbolList[i]))
    }
    const symbolPrices = await Promise.all(promises)

    const margin = bTokens.reduce((accum, a, index) => {
      return accum.plus(bg(a.price).times(a.discount).times(margins[index]))
    }, bg(0))

    const marginHeld = symbols.reduce((accum, s, index) => {
      return accum.plus(bg(symbolPrices[index]).times(s.multiplier).times(positions[index].volume).times(minInitialMarginRatio).abs())
    }, bg(0))
    //
    // const unrealizedPnlList = symbols.map((s, index) => {
    //   return [s.symbol, bg(symbolPrices[index]).times(s.multiplier).times(positions[index].volume).minus(positions[index].cost).toString()]
    // })

    //console.log('cost', costTotal.toString())
    const liquidity = bTokens.reduce((accum, i) => accum.plus(bg(i.liquidity).times(i.price).times(i.discount).plus(i.pnl)), bg(0))

    return positions.map((p, index) => {
      const symbol = symbols[index]
      const symbolId = symbolIdList[index]
      const price = symbolPrices[index]
      priceCache.set(poolAddress, symbolId, price)
      const { multiplier, fundingRateCoefficient, tradersNetVolume, cumulativeFundingRate } = symbol
      const { volume, cost, lastCumulativeFundingRate } = p
      const marginHeldBySymbol = bg(volume).abs().times(multiplier).times(symbolPrices[index]).times(minInitialMarginRatio)
      const unrealizedPnl = bg(symbolPrices[index]).times(symbol.multiplier).times(p.volume).minus(p.cost)
      const totalCost = positions.reduce((accum, a) => {
        return accum.plus(bg(a.cost))
      }, bg(0))
      const dynamicCost = symbols.reduce((accum, s, idx) => {
        if (idx !== index) {
          return accum.plus(bg(positions[idx].volume).times(symbolPrices[idx]).times(s.multiplier))
        } else {
          return accum
        }
      }, bg(0))
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
        volume,
      );
      return {
        symbol: symbol.symbol,
        symbolId: index.toString(),
        price: symbolPrices[index],
        volume: bg(p.volume).times(multiplier).toString(),
        averageEntryPrice: calculateEntryPrice(p.volume, cost, multiplier).toString(),
        margin: margin.toString(),
        marginHeld: marginHeld.toString(),
        marginHeldBySymbol: marginHeldBySymbol.toString(),
        //unrealizedPnlList,
        unrealizedPnl: unrealizedPnl.toString(),
        liquidationPrice: calculateLiquidationPrice(
          volume,
          margin,
          totalCost,
          dynamicCost,
          multiplier,
          minMaintenanceMarginRatio
        ).toString(),
        fundingFee: fundingFee.toString()
      };
    }).filter((p) => p.volume !== '0')
  } catch(err) {
    console.log(`${err}`)
  }
  return []
}

export const getWalletBalance = async (
  chainId,
  poolAddress,
  accountAddress,
  bTokenId,
) => {
  try {
    const { bToken: bTokenAddress } = getPoolConfig2(poolAddress, bTokenId);
    const balance = await bTokenFactory(chainId, bTokenAddress).balanceOf(accountAddress)
    return balance.toString()
  } catch(err) {
    console.log(`${err}`)
  }
  return '';
}

export const getEstimatedLiquidatePrice = async (
  chainId,
  poolAddress,
  accountAddress,
  newVolume,
  symbolId,
) => {
  try {
    let {
      volume,
      margin,
      totalCost,
      dynamicCost,
      price,
      multiplier,
      minMaintenanceMarginRatio,
    } = liquidatePriceCache.get(poolAddress);
    totalCost = bg(totalCost).plus(bg(newVolume).times(price).times(multiplier))
    //console.log(totalCost.toString())
    return calculateLiquidationPrice(
      bg(volume).plus(newVolume),
      margin,
      totalCost,
      dynamicCost,
      multiplier,
      minMaintenanceMarginRatio
    ).toString();
  } catch (err) {
    console.log(`${err}`);
  }
  return '';
};

export const isUnlocked = async (chainId, poolAddress, accountAddress, bTokenId) => {
  try {
    const { bToken: bTokenAddress } = getPoolConfig2(poolAddress, bTokenId);
    const bToken = bTokenFactory(chainId, bTokenAddress)
    return await bToken.isUnlocked(accountAddress, poolAddress)
  } catch(err) {
    console.log(`${err}`)
  }
  return false
}

export const getEstimatedFee = async (chainId, poolAddress, volume, symbolId) => {
  try {
    let price = priceCache.get(poolAddress, symbolId)
    const {symbol} = getPoolConfig2(poolAddress, null, symbolId)
    if (!price) {
      //price = await getOraclePrice(poolAddress, symbolId)
      price = await getOraclePrice(chainId, symbol)
      priceCache.set(poolAddress, symbolId, price)
    }
    let cache = fundingRateCache.get(chainId, poolAddress, symbolId)
    if (!cache || !cache.multiplier) {
      await _getFundingRate(chainId, poolAddress, symbolId)
      cache = fundingRateCache.get(chainId, poolAddress, symbolId)
    }
    const { multiplier, feeRatio } = cache;
    //console.log(volume, price, multiplier, feeRatio)
    return bg(volume).abs().times(price).times(multiplier).times(feeRatio).toString()
  } catch(err) {
    console.log(`${err}`)
  }
  return ''
}

export const getEstimatedMargin = async(
  chainId,
  poolAddress,
  accountAddress,
  volume,
  leverage,
  symbolId,
) => {
  try {
    const {symbol} = getPoolConfig2(poolAddress, null, symbolId)
    const perpetualPool = perpetualPoolFactory(chainId, poolAddress);
    const [price, symbolInfo ] = await Promise.all([
      //getOraclePrice(poolAddress, symbolId),
      getOraclePrice(chainId, symbol),
      perpetualPool.getSymbol(symbolId),
    ])
    priceCache.set(poolAddress, symbolId, price)
    const {multiplier} = symbolInfo
    //console.log('m',multiplier.toString())
    return bg(volume).abs().times(price).times(multiplier).div(bg(leverage)).toString()
  } catch(err) {
    console.log(`${err}`)
  }
  return ''
}

export const getFundingRateCache = async(chainId, poolAddress, symbolId) => {
  return fundingRateCache.get(chainId, poolAddress, symbolId)
}

const _getFundingRate = async(chainId, poolAddress, symbolId) => {
  const perpetualPool = perpetualPoolFactory(chainId, poolAddress)
  const {symbol} = getPoolConfig2(poolAddress, null, symbolId)
  let bTokenIdList = getPoolBTokenIdList(poolAddress)
  let promiseList = []
  for (let i=0; i<bTokenIdList.length; i++) {
    promiseList.push(perpetualPool.getBToken(i))
  }
  const bTokenInfoList = await Promise.all(promiseList)
  const liquidity = bTokenInfoList.reduce((accum, i) => accum.plus(bg(i.liquidity).times(i.price).times(i.discount).plus(i.pnl)), bg(0))
  //const pnl = bTokenInfoList.reduce((accum, i) => accum.plus(i.pnl), bg(0))
  //console.log('pnl', pnl.toString())

  const [price, symbolInfo, parameterInfo ] = await Promise.all([
    //getOraclePrice(poolAddress, symbolId),
    getOraclePrice(chainId, symbol),
    perpetualPool.getSymbol(symbolId),
    perpetualPool.getParameters(),
  ])
  priceCache.set(poolAddress, symbolId, price)
  const { multiplier, fundingRateCoefficient, tradersNetVolume, feeRatio } = symbolInfo;
  const { minPoolMarginRatio } = parameterInfo;
  const fundingRateArgs = [
    tradersNetVolume,
    price,
    multiplier,
    liquidity,
    fundingRateCoefficient,
  ]
  const fundingRatePerBlock = calculateFundingRate(...fundingRateArgs)
  const fundingRate = processFundingRate(chainId, fundingRatePerBlock)
  // const liquidityUsedArgs = [
  //   tradersNetVolume,
  //   price,
  //   multiplier,
  //   liquidity,
  //   minPoolMarginRatio,
  // ]
  let symbolIdList = getPoolSymbolIdList(poolAddress)
  let promises = []
  for (let i=0; i<symbolIdList.length; i++) {
    promises.push(perpetualPool.getSymbol(symbolIdList[i]))
  }
  const symbols = await Promise.all(promises)
  //console.log('margin', margin.toString(), marginHeld.toString())
  const liquidityUsedInAmount = symbols.reduce((accum, a) => {
    return accum.plus(bg(a.tradersNetVolume).times(a.price).times(a.multiplier).times(minPoolMarginRatio).abs())
  }, bg(0))

  //const liquidityUsed = liquidityUsedInAmount.div(liquidity)
  const res = {
    price,
    multiplier: multiplier.toString(),
    feeRatio: feeRatio.toString(),
    tradersNetVolume: tradersNetVolume.toString(),
    liquidity: liquidity.toString(),
    //pnl: pnl.toString(),
    fundingRateCoefficient: fundingRateCoefficient.toString(),
    minPoolMarginRatio: minPoolMarginRatio.toString(),
    fundingRatePerBlock: fundingRatePerBlock,
    fundingRate: fundingRate,
    liquidityUsed: liquidityUsedInAmount.div(liquidity)
  }
  fundingRateCache.set(chainId, poolAddress, symbolId, res)
  return res
}

export const getFundingRate = async (chainId, poolAddress, symbolId) => {
  try {
    const res = await _getFundingRate(chainId, poolAddress, symbolId)
    const { fundingRate, fundingRatePerBlock, liquidity, tradersNetVolume, multiplier } = res
    return {
      fundingRate0: fundingRate.times(100).toString(),
      fundingRatePerBlock: fundingRatePerBlock.toString(),
      liquidity: liquidity.toString(),
      volume: '-',
      tradersNetVolume: bg(tradersNetVolume).times(multiplier).toString()
    };
  } catch(err) {
    console.log(`${err}`)
  }
  return {
    fundingRate0: '',
    fundingRatePerBlock: '',
    liquidity: '',
    volume: '',
    tradersNetVolume: '',
  };
}

export const getEstimatedFundingRate = async (
  chainId,
  poolAddress,
  newNetVolume,
  symbolId,
) => {
  try {
    let res = fundingRateCache.get(chainId, poolAddress, symbolId)
    if (!res) {
      res = await _getFundingRate(chainId, poolAddress, symbolId)
    }
    const args = [
      bg(res.tradersNetVolume).plus(newNetVolume).toString(),
      res.price,
      res.multiplier,
      res.liquidity,
      res.fundingRateCoefficient,
    ]
    let fundingRate1 = calculateFundingRate(...args)
    fundingRate1 = processFundingRate(chainId, fundingRate1)
    return {
      fundingRate1: fundingRate1.times(100).toString()
    }
  } catch(err) {
    console.log(`${err}`)
  }
  return {
    fundingRate1: '',
  }
}

export const getLiquidityUsed = async (
  chainId,
  poolAddress,
  symbolId,
) => {
  try {
    let res = fundingRateCache.get(chainId, poolAddress, symbolId)
    if (!res) {
      res = await _getFundingRate(chainId, poolAddress, symbolId)
    }
    return {
      liquidityUsed0: res.liquidityUsed.times(100).toString(),
    };
  } catch(err) {
    console.log(`${err}`)
  }
  return {
    liquidityUsed0: '',
  }
};

export const getEstimatedLiquidityUsed = async (
  chainId,
  poolAddress,
  newNetVolume,
  symbolId,
) => {
  try {
    let res = fundingRateCache.get(chainId, poolAddress, symbolId)
    if (!res) {
      res = await _getFundingRate(chainId, poolAddress, symbolId)
    }
    const perpetualPool = perpetualPoolFactory(chainId, poolAddress)
    // const {pToken: pTokenAddress } = getPoolConfig2(poolAddress, null, symbolId)
    // const pToken = pTokenFactory(chainId, pTokenAddress);
    // const { volume } = pToken.getPosition(accountAddress, symbolId);
    let symbolIdList = getPoolSymbolIdList(poolAddress)
    let promises = []
    for (let i=0; i<symbolIdList.length; i++) {
      promises.push(perpetualPool.getSymbol(symbolIdList[i]))
    }
    const symbols = await Promise.all(promises)
    let liquidityUsed0 = symbols.reduce((accum, a, index) => {
      if (index === parseInt(symbolId)) {
        return accum.plus(bg(a.price).times(a.multiplier).times(a.tradersNetVolume.plus(newNetVolume)).abs())
      } else {
        return accum.plus(bg(a.price).times(a.multiplier).times(a.tradersNetVolume).abs())
      }
    }, bg(0))
    //liquidityUsed0 = liquidityUsed0.times(res.minPoolMarginRatio)
    //const liquidityUsed = bg(newNetVolume).times(res.price).times(res.multiplier).times(res.minPoolMarginRatio).div(res.liquidity)
    const liquidityUsed1 = liquidityUsed0.times(res.minPoolMarginRatio).div(res.liquidity)
    return {
      liquidityUsed1: liquidityUsed1.times(100).toString()
    }
  } catch(err) {
    console.log(`${err}`)
  }
  return {
    liquidityUsed1: '',
  }
}


export const getPoolBTokensBySymbolId = async(chainId, poolAddress, accountAddress, symbolId) => {
  try {
    let bTokenList = getPoolBTokenList(poolAddress)
    const perpetualPool = perpetualPoolFactory(chainId, poolAddress)
    const {pToken: pTokenAddress } = getPoolConfig2(poolAddress, null, symbolId)
    const pToken = pTokenFactory(chainId, pTokenAddress);
    // let bTokenList = bTokensConfigList.map((i) => {
    //   return {bTokenId: i.bTokenId, bTokenSymbol: i.bTokenSymbol, bTokenAddress: i.bToken}
    // })
    let promiseList = []
    for (let i=0; i<bTokenList.length; i++) {
      promiseList.push(bTokenFactory(chainId, bTokenList[i].bTokenAddress).balanceOf(accountAddress))
    }
    const resultList = await Promise.all(promiseList)
    for (let i=0; i<bTokenList.length; i++) {
      bTokenList[i].walletBalance = resultList[i].toString()
    }

    const bTokenIdList = getPoolBTokenIdList(poolAddress)
    const symbolIdList = getPoolSymbolIdList(poolAddress)
    const [margins, positions, parameterInfo] = await Promise.all([
      pToken.getMargins(accountAddress),
      pToken.getPositions(accountAddress),
      perpetualPool.getParameters(),
    ]);
    const { minInitialMarginRatio } = parameterInfo;

    let promises = []
    for (let i=0; i<bTokenIdList.length; i++) {
      promises.push(perpetualPool.getBToken(bTokenIdList[i]))
    }
    const bTokens = await Promise.all(promises)
    const margin = bTokens.reduce((accum, a, index) => {
      return accum.plus(bg(a.price).times(a.discount).times(margins[index]))
    }, bg(0))
    //console.log('margin', margin.toString())

    promises = []
    for (let i=0; i<symbolIdList.length; i++) {
      promises.push(perpetualPool.getSymbol(symbolIdList[i]))
    }
    const symbols = await Promise.all(promises)

    promises = []
    const symbolList = symbols.map((s) => s.symbol)
    for (let i=0; i< symbols.length; i++) {
      promises.push(getOraclePrice(chainId, symbolList[i]))
    }
    const symbolPrices = await Promise.all(promises)
    //console.log(symbolPrices)

    const marginHeld = symbols.reduce((accum, a, index) => {
      return accum.plus(bg(symbolPrices[index]).times(a.multiplier).times(positions[index].volume).abs().times(minInitialMarginRatio))
    }, bg(0))
    //console.log('marginHeld', marginHeld.toString())

    const pnl = symbols.reduce((accum, a, index) => {
      return accum.plus(bg(symbolPrices[index]).times(a.multiplier).times(positions[index].volume).minus(positions[index].cost))
    }, bg(0))
    //console.log('pnl', pnl.toString())

    bTokenList = bTokenList.map((i, index) => {
      if(!isNaN(parseFloat(bTokens[index].price)) || bTokens[index].price !== '0') {
        i.availableBalance = max(min(margin.minus(marginHeld).plus(pnl).div(bTokens[index].price).div(bTokens[index].discount), margins[index]), bg(0)).toString()
      } else {
        i.availableBalance = '-'
      }
      return i
    })
    return bTokenList
  } catch(err) {
    console.log(`${err}`)
  }
  return []
}

export const getFundingFee = async(chainId, poolAddress, accountAddress, symbolId) => {
    const symbolConfigList = getPoolSymbolList(poolAddress)
    const symbolList = symbolConfigList.map((i) => i.symbol)
    const {pToken: pTokenAddress } = getPoolConfig2(poolAddress, null, symbolId)
    const perpetualPool = perpetualPoolFactory(chainId, poolAddress);
    const pToken = pTokenFactory(chainId, pTokenAddress);
    const [symbolInfo, positionInfo, price, lastUpdatedBlockNumber, latestBlockNumber] = await Promise.all([
      perpetualPool.getSymbol(symbolId),
      pToken.getPosition(accountAddress, symbolId),
      getOraclePrice(chainId, symbolList[parseInt(symbolId)]),
      perpetualPool.getLastUpdatedBlockNumber(),
      perpetualPool.getLatestBlockNumber(),
    ])
    const { volume, lastCumulativeFundingRate } = positionInfo
    const { multiplier, fundingRateCoefficient, tradersNetVolume, cumulativeFundingRate, } = symbolInfo;
    const bTokenIdList = getPoolBTokenIdList(poolAddress)
    let promises = []
    for (let i=0; i<bTokenIdList.length; i++) {
      promises.push(perpetualPool.getBToken(bTokenIdList[i]))
    }
    const bTokens = await Promise.all(promises)
    const liquidity = bTokens.reduce((accum, i) => accum.plus(bg(i.liquidity).times(i.price).times(i.discount).plus(i.pnl)), bg(0))
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
      volume,
    );
  return fundingFee.toString()
}
