import { bg, max, normalizeOptionSymbol, toNumberForObject } from "../../shared"
import { findLiquidationPrice } from './findLiquidationPrice2';

export const dynamicInitialMarginRatio = (spot, strike, isCall, initialMarginRatio) => {
  if ((bg(strike).gte(spot) && !isCall) || (bg(strike).lte(spot) && isCall)) {
    return initialMarginRatio
  } else {
    const otmRatio = isCall ? bg(strike).minus(spot).div(strike) : bg(spot).minus(strike).div(strike)
    return max((bg(1).minus(otmRatio.times(3))).times(initialMarginRatio), bg(0.01))
  }
}

export const dynamicInitialPoolMarginRatio = (spot, strike, isCall, initialMarginRatio) => {
  // for pool
  const initialPoolMarginRatio = bg(initialMarginRatio).times(10)
  if ((bg(strike).gte(spot) && !isCall) || (bg(strike).lte(spot) && isCall)) {
    return initialMarginRatio
  } else {
    const otmRatio = isCall ? bg(strike).minus(spot).div(strike) : bg(spot).minus(strike).div(strike)
    return max((bg(1).minus(otmRatio.times(3))).times(initialPoolMarginRatio), bg(0.01).times(10))
  }
}

export const getDeltaFundingPerSecond = (symbol, delta, price, totalDynamicEquity, newNetVolume)  => {
  return bg(totalDynamicEquity).eq(0)
    ? bg(0)
    : bg(delta)
        .times(bg(symbol.tradersNetVolume).plus(newNetVolume))
        .times(price)
        .times(price)
        .times(symbol.multiplier)
        .times(symbol.multiplier)
        .times(symbol.deltaFundingCoefficient)
        .div(totalDynamicEquity);
} 
export const getpremiumFunding = (symbol, premiumFundingCoefficient, totalDynamicEquity)  => {
  return bg(totalDynamicEquity).eq(0)
    ? bg(0)
    : bg(symbol.timeValue)
        .times(symbol.multiplier)
        .times(premiumFundingCoefficient)
        .div(totalDynamicEquity);
} 

export const getIntrinsicPrice = (price, strikePrice, isCall) => {
  return isCall
    ? max(bg(price).minus(strikePrice), bg(0))
    : max(bg(strikePrice).minus(price), bg(0));
};


export const getMarginHeldBySymbol = (
  volume,
  price,
  symbol,
  initialMarginRatio
) => {
  return bg(volume)
    .abs()
    .times(price)
    .times(symbol.multiplier)
    .times(
      dynamicInitialMarginRatio(
        price,
        symbol.strikePrice,
        symbol.isCall,
        initialMarginRatio
      )
    );
};

export const getAverageEntryPrice = (position, symbol) => {
  return bg(position.volume).eq(0)
    ? '0'
    : bg(position.cost).div(position.volume).div(symbol.multiplier).toString();
};

export const getLiquidationPrice = (state, symbolId)  => {
  const { poolState, symbolState, traderState, positionState } = state;
  const normalizedSymbol = normalizeOptionSymbol(symbolState[symbolId].symbol)
  let res = findLiquidationPrice(
    toNumberForObject(poolState, [
      'initialMarginRatio',
      'maintenanceMarginRatio',
      'fundingPeriod',
      'fundingCoefficient',
      'marginMultiplier',
      'liquidity',
      'totalDynamicEquity',
      'totalInitialMargin',
    ]),
    toNumberForObject(traderState, [
      'margin',
      'totalPnl',
      'totalFundingAccrued',
      'dynamicMargin',
      'initialMargin',
      'maintenanceMargin',
    ]),
    symbolState
      .filter((s, index) => positionState[index].volume !== '0')
      .filter((s) => s.symbol.startsWith(normalizedSymbol))
      .map((s) =>
        toNumberForObject(s, [
          'multiplier',
          'strikePrice',
          'spotPrice',
          'dpmmPrice',
          'volatility',
          'timePrice',
          'dynamicMarginRatio',
          'intrinsicValue',
          'timeValue',
          'delta',
          'K',
          'tradersNetVolume',
          'tradersNetCost',
          'cumulativeFundingRate',
          'fundingPerSecond',
        ])
      ),
    symbolState
      .filter((s, index) => positionState[index].volume !== '0')
      .filter((s) => s.symbol.startsWith(normalizedSymbol))
      .map((s) =>
        toNumberForObject(positionState[s.symbolId], [
          'volume',
          'cost',
          'lastCumulativePremiumFundingRate',
          'pnl',
          'premiumFundingAccrued',
        ])
      )
  );
  res.underlier = normalizedSymbol
  return res
}

export const getLiquidationPrices = (state) => {
  const { poolState, symbolState, traderState, positionState } = state;
  const symbols = symbolState.filter((s, index) => positionState[index].volume !== '0').map((s) => s.symbol);
  const oracleSymbols = symbols
    .map((i) => normalizeOptionSymbol(i))
    .filter((value, index, self) => self.indexOf(value) === index);

  const liquidationPrices = oracleSymbols.map((oSymbol) => {
    let res = findLiquidationPrice(
      toNumberForObject(poolState, [
        'initialMarginRatio',
        'maintenanceMarginRatio',
        'premiumFundingPeriod',
        'premiumFundingCoefficient',
        'liquidity',
        'totalDynamicEquity',
        'totalInitialMargin',
      ]),
      toNumberForObject(traderState, [
        'margin',
        'totalPnl',
        'totalFundingAccrued',
        'dynamicMargin',
        'initialMargin',
        'maintenanceMargin',
      ]),
      symbolState
        .filter((s, index) => positionState[index].volume !== '0')
        .filter((s) => s.symbol.startsWith(oSymbol))
        .map((s) =>
          toNumberForObject(s, [
          'multiplier',
          'strikePrice',
          'spotPrice',
          'dpmmPrice',
          'underlierVolatility',
          'timePrice',
          'dynamicMarginRatio',
          'intrinsicValue',
          'timeValue',
          'delta',
          'K',
          'tradersNetVolume',
          'tradersNetCost',
          'cumulativePremiumFundingRate',
          'premiumFundingPerSecond',
          ])
        ),
      symbolState
        .filter((s, index) => positionState[index].volume !== '0')
        .filter((s) => s.symbol.startsWith(oSymbol))
        .map((s) =>
          toNumberForObject(positionState[s.symbolId], [
            'volume',
            'cost',
            'lastCumulativeDeltaFundingRate',
            'lastCumulativePremiumFundingRate',
            'pnl',
            'deltaFundingAccrued',
            'premiumFundingAccrued',
          ])
        )
    );
    return res;
  });
  return oracleSymbols.map((i, index) => { 
    liquidationPrices[index].underlier = i
    return liquidationPrices[index]
  })
};