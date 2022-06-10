import { bg, max } from "../../shared/utils";

export const calculateK = (indexPrice, liquidity, alpha) => {
  return bg(liquidity).eq(0)
    ? bg(0)
    : bg(indexPrice).times(alpha).div(liquidity);
};

export const calculateDpmmPrice = (indexPrice, K, tradersNetPosition) => {
  return bg(indexPrice).times(bg(1).plus(bg(K).times(tradersNetPosition)));
};

export const calculateChangedVolume = (
  markPrice,
  indexPrice,
  K,
  tradersNetPosition,
  percent
) => {
  const volume1 = bg(markPrice)
    .times(bg(1).plus(percent))
    .div(indexPrice)
    .minus(1)
    .div(K)
    .minus(tradersNetPosition)
    .toString();
  const volume2 = bg(markPrice)
    .times(bg(1).minus(percent))
    .div(indexPrice)
    .minus(1)
    .div(K)
    .minus(tradersNetPosition)
    .toString();
  return [volume1, volume2];
};

export const calculateDpmmCost = (
  indexPrice,
  K,
  tradersNetPosition,
  tradePosition
) => {
  return bg(indexPrice).times(
    bg(tradersNetPosition)
      .plus(tradePosition)
      .pow(2)
      .minus(bg(tradersNetPosition).pow(2))
      .times(K)
      .div(2)
      .plus(tradePosition)
  );
};

export const calculateLiquidationPrice = (
  volume,
  margin,
  cost,
  dynamicCost,
  dynamicCostAbs,
  minMaintenanceMarginRatio,
) => {
  if (bg(volume).eq(0)) {
    return '0'
  }
  const tmp = bg(cost).minus(margin).minus(dynamicCost).plus(bg(dynamicCostAbs).times(minMaintenanceMarginRatio));
  let res = bg(volume).gt(0)
      ? tmp
          .div(bg(1).minus(minMaintenanceMarginRatio))
          //.minus(dynamicCost)
          .div(volume)
      : tmp
          .div(bg(1).plus(minMaintenanceMarginRatio))
          //.minus(dynamicCost)
          .div(volume);
  res = max(res, bg(0));
  return res;
};
