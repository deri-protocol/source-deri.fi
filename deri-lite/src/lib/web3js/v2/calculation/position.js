import { bg, max } from '../../shared/utils';

export const calculateEntryPrice = (volume, cost, multiplier) =>
  volume.eq(0) ? bg(0) : cost.div(volume).div(multiplier);

export const calculateMarginHeld = (
  price,
  volume,
  multiplier,
  minInitialMarginRatio
) => {
  return volume.abs().times(price).times(multiplier).times(minInitialMarginRatio)
};

export const calculatePnl = (price, volume, multiplier, cost) => {
  return volume.times(price).times(multiplier).minus(cost);
}

// export const calculateMaxWithdrawMargin = (
//   price,
//   volume,
//   margin,
//   cost,
//   multiplier,
//   minInitialMarginRatio
// ) => {
//   if (volume.eq(0)) {
//     return margin;
//   }
//   const held = calculateMarginHeld(
//     price,
//     volume,
//     multiplier,
//     minInitialMarginRatio
//   );
//   const pnl = calculatePnl(price, volume, multiplier, cost);
//   const withdrawable = max(margin.plus(pnl).minus(held.times(1.02)), bg(0));
//   return withdrawable;
// };

export const calculateLiquidationPrice = (
  volume,
  margin,
  cost,
  dynamicCost,
  multiplier,
  minMaintenanceMarginRatio
) => {
  const tmp = bg(cost).minus(margin);
  let res = bg(volume).gt(0)
    ? tmp.div(bg(1).minus(minMaintenanceMarginRatio)).minus(dynamicCost).div(volume).div(multiplier)
    : tmp.div(bg(1).plus(minMaintenanceMarginRatio)).minus(dynamicCost).div(volume).div(multiplier);
  res = max(res, bg(0));
  return res;
};

export const isOrderValid = (
  //price,
  margin,
  marginHeld,
  liquidity,
  liquidityUsed,
  // multiplier,
  // minPoolMarginRatio,
  // newVolume,
) => {
  const minMargin = marginHeld;
  // const poolMaxVolume = liquidity.minus(liquidityUsed)
  //   .div(minPoolMarginRatio)
  //   .div(price)
  //   .div(multiplier);
  if (margin.gte(minMargin)) {
    // if (
    //   newVolume.lte(poolMaxVolume) &&
    //   newVolume.gte(poolMaxVolume.negated())
    // ) {
    if (liquidity.minus(liquidityUsed).gte(0)) {
      return { success: true };
    }
    return { success: false, error: 'Pool has insufficient liquidity' };
  }
  return { success: false, error: 'Trader has insufficient margin' };
};

export const calculateTxFee = (volume, price, multiplier, feeRatio) => {
  return bg(volume)
    .abs()
    .times(price)
    .times(multiplier)
    .times(feeRatio)
    .toString();
};