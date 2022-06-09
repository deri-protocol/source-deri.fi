import { deriSymbolMultiplierPairs, powerSymbolTransformPairs } from "../../shared/config";
import { bg } from "../../shared/utils";

export const isPowerSymbol = (symbol) =>
  typeof symbol === "object"
    ? symbol.category === "power"
    : /^[A-Z]+\^\d$/.test(symbol);

export const normalizePowerSymbol = (symbol) =>
  isPowerSymbol(symbol) ? symbol.split("^")[0] : symbol;

export const normalizePowerSymbolForOracle = (symbol) => {
  if (isPowerSymbol(symbol)) {
    const baseSymbol = symbol.split("^")[0]
    if (Object.keys(powerSymbolTransformPairs).includes(baseSymbol)) {
      return powerSymbolTransformPairs[baseSymbol]
    }
    return baseSymbol
  } else {
    return symbol
  }
}

export const getPowerFromSymbol = (symbol) =>
  isPowerSymbol(symbol) ? symbol.split("^")[1] : 1;

export const calculateK = (symbol, indexPrice, liquidity, alpha) => {
  const power = getPowerFromSymbol(symbol);
  return bg(liquidity).eq(0)
    ? bg(0)
    : bg(power).times(indexPrice).times(alpha).div(liquidity);
};

export const calculateLiquidationPrice3 = (
  volume,
  margin,
  cost,
  dynamicCost,
  dynamicCostAbs,
  minMaintenanceMarginRatio,
  oneHT,
) => {
  if (bg(volume).eq(0)) {
    return '0'
  }
  const tmp = bg(cost).minus(margin).minus(dynamicCost).plus(bg(dynamicCostAbs).times(minMaintenanceMarginRatio));
  let res = bg(volume).gt(0)
      ? tmp
          .div(bg(1).minus(minMaintenanceMarginRatio))
          .div(volume)
      : tmp
          .div(bg(1).plus(minMaintenanceMarginRatio))
          .div(volume)
  return res.lte(0) ? '0' : res.times(oneHT).sqrt();
};

// deri power symbol
export const normalizeDeriSymbol = (symbol) => {
  const res = isPowerSymbol(symbol) ? `m${symbol}` : symbol;
  return res
}

export const getDeriSymbolMultiplier = (symbol) => {
  if (Object.keys(deriSymbolMultiplierPairs).includes(symbol)) {
    return deriSymbolMultiplierPairs[symbol];
  } else {
    return 1;
  }
};

export const deriSymbolScaleIn = (symbol, value) => {
  return bg(value).div(getDeriSymbolMultiplier(symbol)).toString()
}

export const deriSymbolScaleOut = (symbol, value) => {
  return bg(value).times(getDeriSymbolMultiplier(symbol)).toString()
}