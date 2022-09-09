import { overrideMethods, processMethod } from "./shared.js";

const lpInfoProp = [
  "amountB0",
  "vaultLiquidity",
  "cumulativePnlPerLiquidity",
  "liquidity",
  "assetBalance",
  "assetPrice",
  "collateralFactor",
];
const tdInfoProp = [
  "amountB0",
  "vaultLiquidity",
  "assetBalance",
  "assetPrice",
  "cost",
  "volume",
  "cumulativeFundingPerVolume",
];
const poolProp = [
  "cumulativePnlPerLiquidity",
  "reserveRatioB0",
  "liquidationRewardCutRatio",
  "liquidity",
  "lpsPnl",
  "maxLiquidationReward",
  "minLiquidationReward",
  "minRatioB0",
  "poolInitialMarginMultiplier",
  "protocolFeeAccrued",
  "protocolFeeCollectRatio",
  "initialMarginRequired",
];
const marketProp = [
  "assetPrice",
  "assetBalance",
  "collateralFactor",
];
const symbolProp = [
  "alpha",
  "cumulativeFundingPerVolume",
  "curCumulativeFundingPerVolume",
  "curIndexPrice",
  "curVolatility",
  "feeRatio",
  // "feeRatioITM",
  // "feeRatioOTM",
  "feeRatioNotional",
  "feeRatioMark",
  "indexPrice",
  "minInitialMarginRatio",
  "initialMarginRatio",
  "initialMarginRequired",
  "maintenanceMarginRatio",
  "minTradeVolume",
  "netCost",
  "netVolume",
  "pricePercentThreshold",
  "strikePrice",
  "tradersPnl",
  "K",
  "funding",
  "markPrice",
  "u",
  "delta",
  "timeValue",
  "curCumulativeFundingPerVolume",
  "hT",
  "powerPrice",
  "theoreticalPrice"
];

export const deriLensArbiAdapter = (klass) => {
  klass = overrideMethods(klass, [
    [processMethod, "getPoolInfo", poolProp],
    [processMethod, "getSymbolsInfo", symbolProp],
    [processMethod, "getMarketsInfo", marketProp],
    [processMethod, "getLpInfo", lpInfoProp],
    [processMethod, "getTdInfo", tdInfoProp],
    [
      processMethod,
      "getInfo",
      [
        ...poolProp,
        ...marketProp,
        ...symbolProp,
        ...new Set([...tdInfoProp, ...lpInfoProp]),
      ],
    ],
  ]);
  return klass;
};
