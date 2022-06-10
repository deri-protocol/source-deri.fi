import { bg, max } from '../../shared/utils'
import { normalizeOptionSymbol } from './config'

export function getEverlastingTimePriceAndDelta(S, K, V, T) {
  S = bg(S)
  if (S.eq(0)) {
    S = bg('0.0001')
  }
  K = bg(K)
  V = bg(V)
  T = bg(T)
  let u = bg(8).div(V).div(V).div(T).plus(1).sqrt();
  let x = bg(S).div(K)
  let timeValue, delta;
  if (S.gt(K)) {
    timeValue = K.times(Math.pow(x.toNumber(), bg(1).minus(u).div(2).toNumber())).div(u);
    delta = bg(1).minus(u).times(timeValue).div(S).div(2)
  } else if (S.eq(K)) {
    timeValue = K.div(u);
    delta = 0;
  } else {
    timeValue = K.times(Math.pow(x.toNumber(), bg(1).plus(u).div(2).toNumber())).div(u);
    delta = bg(1).plus(u).times(timeValue).div(S).div(2)
  }
  return [timeValue.toString(), delta.toString(), u.toString()];
}
export const calculateK = (
  indexPrice,
  theoreticalprice,
  delta,
  alpha,
  liquidity
) => {
  // indexPrice ** 2 / theoreticalPrice * delta.abs() * alpha / liquidity / ONE;
  return bg(liquidity).eq(0) || bg(theoreticalprice).eq(0)
    ? "0"
    : bg(indexPrice)
        .pow(2)
        .div(theoreticalprice)
        .times(bg(delta).abs())
        .times(alpha)
        .div(liquidity).toString();
};

export const getIntrinsicPrice = (indexPrice, strikePrice, isCall) => {
  return isCall
    ? max(bg(indexPrice).minus(strikePrice), bg(0)).toString()
    : max(bg(strikePrice).minus(indexPrice), bg(0)).toString();
};

export const getDynamicInitialMarginRatio = (
  indexPrice,
  strike,
  isCall,
  initialMarginRatio,
  minInitialMarginRatio
) => {
  if (
    (bg(strike).gte(indexPrice) && !isCall) ||
    (bg(strike).lte(indexPrice) && isCall)
  ) {
    return initialMarginRatio.toString();
  } else {
    const OTMRatio = isCall
      ? bg(strike).minus(indexPrice).div(strike)
      : bg(indexPrice).minus(strike).div(strike);
    return max(
      bg(1).minus(bg(OTMRatio).times(3)) * initialMarginRatio,
      minInitialMarginRatio
    ).toString();
  }
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


// for liquidate
export function getEverlastingTimePriceAndDelta2(S, K, V, T) {
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
  return [timeValue, delta, u];
}

export const getInitialMarginRatio = (curIndexPrice, isCall, timeValue, delta, u, maintenanceMarginRatio, initialMarginRatio) => {
  curIndexPrice = parseFloat(curIndexPrice);
  timeValue = parseFloat(timeValue)
  delta = parseFloat(delta);
  u = parseFloat(u);
  maintenanceMarginRatio = parseFloat(maintenanceMarginRatio);
  initialMarginRatio = parseFloat(initialMarginRatio);
  const indexPrice = isCall ? curIndexPrice : curIndexPrice * -1;
  const deltaPart = delta * indexPrice * maintenanceMarginRatio;
  const gammaPart =
    (((Math.pow(u, 2) - 1) * timeValue) / 8) *
    Math.pow(maintenanceMarginRatio, 2);
  // return (deltaPart + gammaPart)
  return (
    ((deltaPart + gammaPart) * initialMarginRatio) /
    maintenanceMarginRatio /
    curIndexPrice
  );
};

const invalidValues = [NaN, null, undefined];
export const toNumberForObject = (obj, keyList = []) => {
  if (!obj) {
    throw new Error(`toNumberForObject: invalid obj value(${obj})`)
  }
  return Object.keys(obj).reduce((acc, i) => {
    if (keyList.includes(i)) {
      acc[i] = parseFloat(obj[i])
    } else {
      acc[i] = obj[i];
    }
    return acc;
  }, {});
};

export const calculateDpmmCost = (
  indexPrice,
  K,
  netVolume,
  volume
) => {
  const res =
    ((Math.pow(netVolume + volume, 2) - Math.pow(netVolume, 2)) * K) / 2 +
    volume;
  return res * indexPrice;
};

export const canLiquidateWithPrice = (trader, symbols, positions, newIndexPrice) => {
  let newDynamicMargin = trader.dynamicMargin
  let newInitialMargin = trader.initialMargin
  let newMaintenanceMargin = trader.maintenanceMargin
  for (let i = 0; i < symbols.length; i++) {
    let symbol = symbols[i], position = positions[i]
    if (position.volume === 0) {
      continue
    }
    let newIntrinsicValue = symbol.isCall
      ? Math.max(newIndexPrice - symbol.strikePrice, 0)
      : Math.max(symbol.strikePrice - newIndexPrice, 0);

    let [newTimeValue, newDelta, newU] = getEverlastingTimePriceAndDelta2(
      newIndexPrice,
      symbol.strikePrice,
      symbol.curVolatility,
      symbol.fundingPeriod / 31536000
    );
    if (newIntrinsicValue > 0) {
      newDelta += symbol.isCall ?  1 : -1
    }
    let newPnl = position.volume * (newIntrinsicValue + newTimeValue) - position.cost
    // let newPnl =
    //   -calculateDpmmCost(
    //     newIntrinsicValue + newTimeValue,
    //     symbol.K,
    //     symbol.netVolume,
    //     -position.volume
    //   ) - position.cost;
    //console.log('newPnl', newPnl, position.traderPnl)
    let newDynamicMarginRatio = getInitialMarginRatio(
      newIndexPrice,
      symbol.isCall,
      newTimeValue,
      newDelta,
      newU,
      symbol.maintenanceMarginRatio,
      symbol.initialMarginRatio
    );
    newDynamicMargin = newDynamicMargin - position.traderPnl + newPnl;
    const initialMargin =
      Math.abs(position.volume * newDynamicMarginRatio * newIndexPrice) -
      Math.abs(position.volume * symbol.initialMarginPerVolume);
    newInitialMargin = newInitialMargin + initialMargin;
    newMaintenanceMargin =
      newMaintenanceMargin +
      (initialMargin * symbol.maintenanceMarginRatio) /
        symbol.initialMarginRatio;
    }
    if (invalidValues.includes(newMaintenanceMargin) || invalidValues.includes(newDynamicMargin)) {
      throw new Error(
        `-- canLiquidateWithPrice: invalid margin value: ${newMaintenanceMargin} ${newDynamicMargin}`
      );
    }
    //console.log('.', newMaintenanceMargin, newDynamicMargin)
    return newMaintenanceMargin > newDynamicMargin
}

export const findLiquidationPrice = (trader, symbols, positions) => {
  if (symbols.length !== positions.length) {
    throw new Error(`findLiquidationPrice: symbols and  positions length not match`)
  }
  if (symbols.length === 0) {
    return {
      numPositions: positions.length,
      price1: null,
      price2: null
    }
  }
  if (positions.filter((p) => p.volume === 0).length === symbols.length) {
    return {
      numPositions: positions.length,
      price1: null,
      price2: null,
    };
  }
  let head = symbols[0].symbol.split('-')[0]
  for(let  i = 0; i < symbols.length; i++) {
    if (!symbols[i].symbol.startsWith(head)) {
      throw new Error(`findLiquidationPrice: symbols not in the same underlier`)
    }
  }
  if (trader.maintenanceMargin > trader.dynamicMargin) {
    return {
      numPositions: positions.length,
      price1: symbols[0].curIndexPrice,
      price2: symbols[0].curIndexPrice,
    }
  }
  let final1, final2
  let price1, price2
  let l1, l2

  price1 = symbols[0].curIndexPrice / 10;
  price2 = symbols[0].curIndexPrice
  l1 = canLiquidateWithPrice(trader, symbols, positions, price1)
  //console.log('hit after')
  l2 = false
  while(true) {
    if (l1 && l2) {
      final1 = (price1 + price2) / 2;
      break;
    }
    if (!l1&&!l2) {
      final1 = null
      break;
    }
    if (price2 - price1 < symbols[0].curIndexPrice / 1000) {
      final1 = (price1 + price2) / 2
      break;
    }
    let price = (price1 + price2) / 2
    // console.log('> 1',price, price1, price2)
    let l = canLiquidateWithPrice(trader, symbols, positions, price)
    if (l === l1) price1 = price
    else  price2 = price
  }

  price1 = symbols[0].curIndexPrice
  price2 = symbols[0].curIndexPrice * 10
  l1 = false
  l2 = canLiquidateWithPrice(trader, symbols, positions, price2)
  while(true) {
    if (l1 && l2) {
      final2 = (price1 + price2) / 2;
      break;
    }
    if (!l1&&!l2) {
      final2 = null
      break;
    }
    if (price2 - price1 < symbols[0].curIndexPrice / 1000) {
      final2 = (price1 + price2) / 2
      break;
    }
    let price = (price1 + price2) / 2
    // console.log('> 2',price, price1, price2)
    let l = canLiquidateWithPrice(trader, symbols, positions, price)
    if (l === l1) price1 = price
    else price2 = price
  }
  return {
    numPositions: positions.length,
    price1: final1,
    price2: final2,
  };
}

export const getLiquidationPrice = (state, symbolName)  => {
  const { symbols, trader, positions: oldPositions } = state;
  const positions = symbols.map((b) => {
    const position = oldPositions.find((p) => p.symbol === b.symbol);
    if (position) {
      return position;
    } else {
      return {
        symbol: b.symbol,
        volume: 0,
        cost: 0,
        cumulativeFundingPerVolume: 0,
        fundingAccrued: 0,
        initialMarginRequired: 0,
        traderPnl: 0,
      };
    }
  });
  const symbol = symbols.find((s) =>  s.symbol === symbolName)
  if (!symbol) {
    throw new Error(
      `getLiquidationPrice(option): cannot find symbol ${symbolName} in symbols`
    );
  }
  const normalizedSymbol = normalizeOptionSymbol(symbol.symbol)
  //console.log('normal symbol', normalizedSymbol)
  let res = findLiquidationPrice(
    toNumberForObject(trader, [
      'margin',
      'totalPnl',
      'dynamicMargin',
      'initialMargin',
      'maintenanceMargin',
    ]),
    symbols
      .filter((s, index) => positions[index].volume !== '0')
      .filter((s) => s.symbol.startsWith(normalizedSymbol))
      .map((s) =>
        toNumberForObject(s, [
          'fundingPeriod',
          'initialMarginRatio',
          'maintenanceMarginRatio',
          'strikePrice',
          'indexPrice',
          'curIndexPrice',
          'markPrice',
          'curVolatility',
          'timePrice',
          'dynamicMarginRatio',
          'intrinsicValue',
          'timeValue',
          'delta',
          'K',
          'u',
          'netVolume',
          'netCost',
        ])
      ),
    symbols
      .filter((s, index) => positions[index].volume !== '0')
      .filter((s) => s.symbol.startsWith(normalizedSymbol))
      .map((s) =>
        toNumberForObject(positions.find((p) => p.symbol === s.symbol), [
          'volume',
          'cost',
          'traderPnl',
        ])
      )
  );
  res.underlier = normalizedSymbol
  return res
}