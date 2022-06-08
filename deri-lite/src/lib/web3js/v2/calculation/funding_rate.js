import { bg, getDailyBlockNumber, validateArgs } from '../../shared/utils';

export const calculateLiquidityUsed = (
  tradersNetVolume,
  price,
  multiplier,
  liquidity,
  poolMarginRatio
) => {
  if (
    validateArgs(
      tradersNetVolume,
      price,
      multiplier,
      liquidity,
      poolMarginRatio
    )
  ) {
    return bg(tradersNetVolume)
      .times(price)
      .times(multiplier)
      .times(poolMarginRatio)
      .div(liquidity)
      .abs();
  } else {
    const args = [
      tradersNetVolume,
      price,
      multiplier,
      liquidity,
      poolMarginRatio,
    ];
    throw new Error(`calculateLiquidityUsed: invalid args: ${args}`);
  }
}

export const calculateFundingRate = (
  tradersNetVolume,
  price,
  multiplier,
  liquidity,
  fundingRateCoefficient
) => {
  if (
    validateArgs(
      tradersNetVolume,
      price,
      multiplier,
      liquidity,
      fundingRateCoefficient
    )
  ) {
    return bg(liquidity).eq(0) ? bg(0) : bg(tradersNetVolume)
      .times(price)
      // .times(price)
      // .times(multiplier)
      .times(multiplier)
      .times(fundingRateCoefficient)
      .div(liquidity);
  } else {
    const args = [
      tradersNetVolume,
      price,
      multiplier,
      liquidity,
      fundingRateCoefficient
    ];
    throw new Error(`calculateFundingRate: invalid args: ${args}`);
  }
};

export const processFundingRate = (chainId, fundingRate) => {
  const annualBlockCount = getDailyBlockNumber(chainId);
  //console.log(annualBlockCount);
  return bg(fundingRate).times(annualBlockCount);
};

export const calculateFundingFee = (
  tradersNetVolume,
  price,
  multiplier,
  fundingRateCoefficient,
  dynamicEquity,
  cumulativeFundingRate,
  lastCumulativeFundingRate,
  lastUpdatedBlockNumber,
  latestBlockNumber,
  volume,
) => {
  if (bg(volume).eq(0)) {
    return '0'
  } else {
    const args = [
      tradersNetVolume,
      price,
      multiplier,
      fundingRateCoefficient,
      dynamicEquity,
      cumulativeFundingRate,
      lastCumulativeFundingRate,
      lastUpdatedBlockNumber,
      latestBlockNumber,
      volume,
    ];
    if (
      validateArgs(...args)
    ) {
      return bg(dynamicEquity).eq(0) ? bg(0) : bg(tradersNetVolume)
        .times(price)
        .times(multiplier)
        .times(price)
        .times(multiplier)
        .times(fundingRateCoefficient)
        .div(dynamicEquity)
        .times(bg(latestBlockNumber).minus(lastUpdatedBlockNumber))
        .plus(cumulativeFundingRate)
        .minus(lastCumulativeFundingRate)
        .times(volume)
    } else {
      console.log(`calculateFundingFee: invalid args: ${args}`);
      return 'NaN'
    }
  }
};