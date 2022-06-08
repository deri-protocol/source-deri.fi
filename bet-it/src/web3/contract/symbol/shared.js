import { bg, max } from "../../utils/bignumber";

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

export const getInitialMarginRequired = (data) => {
  const deltaPart = bg(data.delta)
    .times(data.isCall ? data.curIndexPrice : `-${data.curIndexPrice}`)
    .times(data.maintenanceMarginRatio);
  const gammaPart = bg(data.u)
    .times(data.u)
    .minus(1)
    .times(data.timeValue)
    .div(8)
    .times(data.maintenanceMarginRatio)
    .times(data.maintenanceMarginRatio);
  return bg(deltaPart).plus(gammaPart).toString()
}

export const getIntrinsicPrice = (indexPrice, strikePrice, isCall) => {
  return isCall
    ? max(bg(indexPrice).minus(strikePrice), bg(0)).toString()
    : max(bg(strikePrice).minus(indexPrice), bg(0)).toString();
};

export const calculateK = (indexPrice, liquidity, alpha) => {
  return bg(liquidity).eq(0)
    ? bg(0)
    : bg(indexPrice).times(alpha).div(liquidity);
};

export const calculateDpmmPrice = (indexPrice, K, tradersNetPosition) => {
  return bg(indexPrice).times(bg(1).plus(bg(K).times(tradersNetPosition)));
};