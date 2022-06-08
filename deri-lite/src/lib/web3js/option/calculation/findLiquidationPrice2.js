const invalidValues = [NaN, null, undefined];

function getEverlastingTimePriceAndDelta(S, K, V, T) {
  let u = Math.sqrt(8 / V / V / T + 1);
  let timeValue, delta;
  if (S > K) {
    timeValue = (K * Math.pow(S / K, (1 - u) / 2)) / u;
    delta = ((1 - u) * timeValue) / S / 2;
  } else if (S === K) {
    timeValue = K / u;
    delta = 0;
  } else {
    timeValue = (K * Math.pow(S / K, (1 + u) / 2)) / u;
    delta = ((1 + u) * timeValue) / S / 2;
  }
  return [timeValue, delta];
}

function getDynamicInitialMarginRatio(
  spot,
  strike,
  isCall,
  initialMarginRatio,
  minInitialMarginRatio
) {
  if ((isCall && spot >= strike) || (!isCall && strike >= spot)) {
    return initialMarginRatio;
  } else {
    let otmRatio = (isCall ? strike - spot : spot - strike) / strike;
    return Math.max(
      (1 - otmRatio * 3) * initialMarginRatio,
      minInitialMarginRatio
    );
  }
}

// multiple position for same underlier, e.x. BTCUSD
function canLiquidateWithPrice(
  pool,
  trader,
  symbols,
  positions,
  newUnderlierPrice
) {
  let newDynamicMargin = trader.dynamicMargin;
  let newInitialMargin = trader.initialMargin;

  for (let i = 0; i < symbols.length; i++) {
    let symbol = symbols[i];
    let position = positions[i];
    if (position.volume === 0) {
      continue;
    }

    let newIntrinsicValue = symbol.isCall
      ? Math.max(newUnderlierPrice - symbol.strikePrice, 0)
      : Math.max(symbol.strikePrice - newUnderlierPrice, 0);
    let [newTimeValue, newDelta] = getEverlastingTimePriceAndDelta(
      newUnderlierPrice,
      symbol.strikePrice,
      symbol.volatility,
      pool.fundingPeriod
    );
    if (newIntrinsicValue > 0) {
      newDelta += symbol.isCall ? 1 : -1;
    }
    let newPnl =
      position.volume * (newIntrinsicValue + newTimeValue) * symbol.multiplier -
      position.cost;
    let newDynamicMarginRatio = getDynamicInitialMarginRatio(
      newUnderlierPrice,
      symbol.strikePrice,
      symbol.isCall,
      pool.initialMarginRatio,
      0.01
    );

    newDynamicMargin = newDynamicMargin - position.pnl + newPnl;
    newInitialMargin =
      newInitialMargin -
      Math.abs(
        position.volume *
          symbol.spotPrice *
          symbol.multiplier *
          symbol.dynamicMarginRatio
      ) +
      Math.abs(
        position.volume *
          newUnderlierPrice *
          symbol.multiplier *
          newDynamicMarginRatio
      );
  }

  let newMaintenanceMargin =
    (newInitialMargin * pool.maintenanceMarginRatio) / pool.initialMarginRatio;

  if (
    invalidValues.includes(newMaintenanceMargin) ||
    invalidValues.includes(newDynamicMargin)
  ) {
    throw new Error(
      `-- canLiquidateWithPrice: Invalid Margin value: ${newMaintenanceMargin} ${newDynamicMargin}`
    );
  }
  return newMaintenanceMargin > newDynamicMargin;
}

export function findLiquidationPrice(pool, trader, symbols, positions) {
  if (symbols.length != positions.length) {
    throw new Error(
      'canLiquidateWithPrice: symbols and positions length not match'
    );
  }
  if (symbols.length === 0) {
    return {
      numPositions: positions.length,
      price1: null,
      price2: null,
    };
  }
  let head = symbols[0].symbol.slice(0, 6);
  for (let i = 0; i < symbols.length; i++) {
    if (!symbols[i].symbol.startsWith(head)) {
      throw new Error('canLiquidateWithPrice: symbols not in same underlier');
    }
  }

  if (trader.maintenanceMargin > trader.dynamicMargin) {
    return {
      numPositions: positions.length,
      price1: symbols[0].spotPrice,
      price2: symbols[0].spotPrice,
    };
  }

  let final1, final2;
  let price1, price2;
  let l1, l2;

  price1 = symbols[0].spotPrice / 10;
  price2 = symbols[0].spotPrice;
  l1 = canLiquidateWithPrice(pool, trader, symbols, positions, price1);
  l2 = false;
  while (true) {
    if (l1 && l2) {
      final1 = (price1 + price2) / 2;
      break;
    }
    if (!l1 && !l2) {
      final1 = null;
      break;
    }
    if (price2 - price1 < symbols[0].spotPrice / 1000) {
      final1 = (price1 + price2) / 2;
      break;
    }
    let price = (price1 + price2) / 2;
    let l = canLiquidateWithPrice(pool, trader, symbols, positions, price);
    if (l === l1) price1 = price;
    else price2 = price;
  }

  price1 = symbols[0].spotPrice;
  price2 = symbols[0].spotPrice * 10;
  l1 = false;
  l2 = canLiquidateWithPrice(pool, trader, symbols, positions, price2);
  while (true) {
    if (l1 && l2) {
      final2 = (price1 + price2) / 2;
      break;
    }
    if (!l1 && !l2) {
      final2 = null;
      break;
    }
    if (price2 - price1 < symbols[0].spotPrice / 1000) {
      final2 = (price1 + price2) / 2;
      break;
    }
    let price = (price1 + price2) / 2;
    let l = canLiquidateWithPrice(pool, trader, symbols, positions, price);
    if (l === l1) price1 = price;
    else price2 = price;
  }

  return {
    numPositions: positions.length,
    price1: final1,
    price2: final2,
  };
}
