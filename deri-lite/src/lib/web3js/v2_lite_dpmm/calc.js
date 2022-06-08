import { bg } from "../shared";

export const calculateK = (indexPrice, liquidity, alpha) => {
  return bg(indexPrice).times(alpha).div(liquidity);
};
export const calculateDpmmPrice = (
  indexPrice,
  K,
  tradersNetVolume,
  multiplier
) => {
  return bg(indexPrice).times(
    bg(1).plus(bg(K).times(tradersNetVolume).times(multiplier))
  );
};
export const calculateDpmmCost = (
  indexPrice,
  K,
  tradersNetVolume,
  multiplier,
  tradeVolume
) => {
  return bg(indexPrice).times(
    bg(multiplier)
      .times(tradersNetVolume)
      .plus(bg(multiplier).times(tradeVolume))
      .pow(2)
      .minus(bg(multiplier).times(tradersNetVolume).pow(2))
      .times(K)
      .div(2)
      .plus(bg(tradeVolume).times(multiplier))
  );
};