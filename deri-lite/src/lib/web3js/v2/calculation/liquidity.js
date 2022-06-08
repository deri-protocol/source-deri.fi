import { bg, max, min } from '../../shared/utils'

export const calculateBTokenDynamicEquities = (bTokens) => {
  //const dynamicEquities = bTokens.map((b) => bg(b.liquidity).times(b.price).times(b.discount).plus(b.pnl))
  //const totalDynamicEquity = dynamicEquities.reduce((accum, d) => accum.plus(d), bg(0))
  const totalDynamicEquity = bTokens.reduce((accum, b) => accum.plus(bg(b.liquidity).times(b.price).times(b.discount).plus(b.pnl)), bg(0))
  return totalDynamicEquity
}

export const isBToken0RatioValid = (bTokens, bTokenId, amount, bToken0Ratio) => {
  bTokens[bTokenId].liquidity = bg(bTokens[bTokenId].liquidity).plus(amount)
  const totalDynamicEquity = calculateBTokenDynamicEquities(bTokens)
  const b = bTokens['0']
  const dynamicEquity = bg(b.liquidity).times(b.price).times(b.discount).plus(b.pnl)
  //console.log('estimatedBToken0Ratio',dynamicEquity.div(totalDynamicEquity).toString())
  // use 1 as efficient
  if (
    !totalDynamicEquity.eq(0) &&
    dynamicEquity.div(totalDynamicEquity).times('1').lt(bToken0Ratio)
  ) {
    return { success: false, error: 'Trader has insufficient bToken0' };
  } else {
    return { success: true };
  }
}

export const isPoolMarginRatioValid = (bTokens, bTokenId, amount, userLiquidity, symbols, poolMarginRatio) => {
  if (bg(amount).gte(userLiquidity)) {
    bTokens[bTokenId].liquidity = bg(bTokens[bTokenId].liquidity).minus(userLiquidity)
  } else {
    bTokens[bTokenId].liquidity = bg(bTokens[bTokenId].liquidity).minus(amount)
  }
  let totalDynamicEquity = calculateBTokenDynamicEquities(bTokens)
  let totalCost = bg(0)
  for (let i=0; i<symbols.length; i++) {
    const s = symbols[i]
    if (!bg(s.tradersNetVolume).eq(0)) {
      const cost = bg(s.tradersNetVolume).times(s.price).times(s.multiplier)
      totalDynamicEquity = totalDynamicEquity.plus(s.tradersNetCost).minus(cost)
      totalCost = totalCost.plus(cost.abs())
    }
  }
  //console.log(totalDynamicEquity.toString(), totalCost.toString())
  if (
    !totalCost.eq(0) &&
    totalDynamicEquity.div(totalCost).times('1').lt(poolMarginRatio)
  ) {
    return { success: false, error: 'Trader has insufficient liquidity' };
  } else {
    return { success: true };
  }
}


export const calculateMaxRemovableLiquidity = (
  bToken,
  userLiquidity,
  cost,
  pnl,
  restLiquidity,
  minPoolMarginRatio,
) => {
  if (bg(cost).eq(0)) {
    return userLiquidity;
  } else {
    return max(
      min(
        bg(bToken.liquidity).minus(
          bg(minPoolMarginRatio)
            .times(cost)
            .plus(pnl)
            .minus(restLiquidity)
            .div(bToken.price)
            .div(bToken.discount)
        ).times('0.98'),
        bg(userLiquidity)
      ),
      bg(0)
    );
  }
};

// for v1 mining
export const calculateShareValue = (lTokenTotalSupply, liquidity) =>
  bg(lTokenTotalSupply).eq(0) ? bg(0) : bg(liquidity).div(lTokenTotalSupply);

export const calculateMaxRemovableShares = (
  lTokenBalance,
  lTokenTotalSupply,
  liquidity,
  value,
  cost,
  minPoolMarginRatio,
) => {
  const shareValue = calculateShareValue(lTokenTotalSupply, liquidity);
  const removable = bg(liquidity)
    .plus(cost)
    .minus(value)
    .minus(bg(value).abs().times(minPoolMarginRatio));
  const shares = max(min(bg(lTokenBalance), removable.div(shareValue)), bg(0));
  return shares;
};
