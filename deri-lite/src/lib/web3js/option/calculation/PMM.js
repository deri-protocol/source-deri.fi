

function _GeneralIntegrate(V0, V1, V2, i, k) {
    return i * (V1 - V2) * (1 - k + k * (V0 * V0 / V1 / V2))
}

function _SolveQuadraticFunctionForTrade(Q0, Q1, ideltaB, deltaBSig, k) {
    let kQ02Q1 = k * Q0 * Q0 / Q1
    let b = (1 - k) * Q1
    let minusbSig = true
    if (deltaBSig) {
        b += ideltaB
    } else {
        kQ02Q1 += ideltaB
    }
    if (b >= kQ02Q1) {
        b -= kQ02Q1
        minusbSig = true
    } else {
        b = kQ02Q1 - b
        minusbSig = false
    }
    let squareRoot = Math.sqrt(b * b + 4 * (1 - k) * k * Q0 * Q0)
    let denominator = 2 * (1 - k)
    let numerator
    if (minusbSig) {
        numerator = b + squareRoot
    } else {
        numerator = squareRoot - b
    }
    return numerator / denominator
}

function _SolveQuadraticFunctionForTarget(V1, k, fairAmount) {
    let sqrt = k * fairAmount * 4 / V1
    sqrt = Math.sqrt(sqrt + 1)
    let premium = (sqrt - 1) / k / 2
    return V1 * (1 + premium)
}

function _ROneSellBaseToken(price, k, amount, targetQuoteTokenAmount) {
    let Q2 = _SolveQuadraticFunctionForTrade(targetQuoteTokenAmount, targetQuoteTokenAmount, price * amount, false, k)
    return targetQuoteTokenAmount - Q2
}

function _RAboveIntegrate(price, k, B0, B1, B2) {
    return _GeneralIntegrate(B0, B1, B2, price, k)
}

function _ROneBuyBaseToken(price, k, amount, targetBaseTokenAmount) {
    let B2 = targetBaseTokenAmount - amount
    let payQuoteToken = _RAboveIntegrate(price, k, targetBaseTokenAmount, targetBaseTokenAmount, B2)
    return payQuoteToken
}

function _RBelowSellBaseToken(price, k, amount, quoteBalance, targetQuoteAmount) {
    let Q2 = _SolveQuadraticFunctionForTrade(targetQuoteAmount, quoteBalance, price * amount, false, k)
    return quoteBalance - Q2
}

function _RBelowBuyBaseToken(price, k, amount, quoteBalance, targetQuoteAmount) {
    let Q2 = _SolveQuadraticFunctionForTrade(targetQuoteAmount, quoteBalance, price * amount, true, k)
    return Q2 - quoteBalance
}

function _RAboveBuyBaseToken(price, k, amount, baseBalance, targetBaseAmount) {
    let B2 = baseBalance - amount
    return _RAboveIntegrate(price, k, targetBaseAmount, baseBalance, B2)
}

function _RAboveSellBaseToken(price, k, amount, baseBalance, targetBaseAmount) {
    let B1 = baseBalance + amount
    return _RAboveIntegrate(price, k, targetBaseAmount, B1, baseBalance)
}

function _RegressionTargetWhenShort(Q1, price, deltaB, k) {
    let ideltaB = deltaB * price
    let ac = ideltaB * 4 * (Q1 - ideltaB + ideltaB * k)
    let square = Q1 * Q1 - ac
    let sqrt = Math.sqrt(square)
    let B0 = (Q1 + sqrt) / price / 2
    let Q0 = B0 * price
    return [B0, Q0]
}

function _RegressionTargetWhenLong(Q1, price, deltaB, k) {
    let square = Q1 * Q1 + deltaB * price * Q1 * k * 4
    let sqrt = Math.sqrt(square)
    let deltaQ = (sqrt - Q1) / k / 2
    let Q0 = Q1 + deltaQ
    let B0 = Q0 / price
    return [B0, Q0]
}

function _expectedTargetHelperWhenBiased(side, quoteBalance, price, deltaB, _K_) {
    let updateBalance = {}
    if (side === 'SHORT') {
        [updateBalance.baseTarget, updateBalance.quoteTarget] = _RegressionTargetWhenShort(quoteBalance, price, deltaB, _K_)
        updateBalance.baseBalance = updateBalance.baseTarget - deltaB
        updateBalance.quoteBalance = quoteBalance
        updateBalance.newSide = 'SHORT'
    } else if (side === 'LONG') {
        [updateBalance.baseTarget, updateBalance.quoteTarget] = _RegressionTargetWhenLong(quoteBalance, price, deltaB, _K_)
        updateBalance.baseBalance = updateBalance.baseTarget + deltaB
        updateBalance.quoteBalance = quoteBalance
        updateBalance.newSide = 'LONG'
    }
    return updateBalance
}

function _expectedTargetHelperWhenBalanced(quoteBalance, price) {
    let baseTarget = quoteBalance / price
    return {
        baseTarget: baseTarget,
        baseBalance: baseTarget,
        quoteTarget: quoteBalance,
        quoteBalance: quoteBalance,
        newSide: 'FLAT',
    }
}

function getExpectedTargetExt(side, quoteBalance, price, deltaB, _K_) {
    if (side === 'FLAT') {
        return _expectedTargetHelperWhenBalanced(quoteBalance, price)
    } else {
        return _expectedTargetHelperWhenBiased(side, quoteBalance, price, deltaB, _K_)
    }
}

function getMidPrice(updateBalance, oraclePrice, K) {
    if (updateBalance.newSide === 'LONG') {
        let R = updateBalance.quoteTarget * updateBalance.quoteTarget / updateBalance.quoteBalance / updateBalance.quoteBalance
        R = 1 - K + K * R
        return oraclePrice / R
    } else {
        let R = updateBalance.baseTarget * updateBalance.baseTarget / updateBalance.baseBalance / updateBalance.baseBalance
        R = 1 - K + K * R
        return oraclePrice * R
    }
}

function _sellHelperRAboveOne(sellBaseAmount, K, price, baseTarget, baseBalance, quoteTarget) {
    let backToOnePayBase = baseTarget - baseBalance

    let receiveQuote
    let newSide
    let newDeltaB

    if (sellBaseAmount < backToOnePayBase) {
        receiveQuote = _RAboveSellBaseToken(price, K, sellBaseAmount, baseBalance, baseTarget)
        newSide = 'SHORT'
        newDeltaB = backToOnePayBase - sellBaseAmount
        let backToOneReceiveQuote = _RAboveSellBaseToken(price, K, backToOnePayBase, baseBalance, baseTarget)
        if (receiveQuote > backToOneReceiveQuote) {
            receiveQuote = backToOneReceiveQuote
        }
    } else if (sellBaseAmount === backToOnePayBase) {
        receiveQuote = _RAboveSellBaseToken(price, K, backToOnePayBase, baseBalance, baseTarget)
        newSide = 'FLAT'
        newDeltaB = 0
    } else {
        receiveQuote = _RAboveSellBaseToken(price, K, backToOnePayBase, baseBalance, baseTarget) + _ROneSellBaseToken(price, K, sellBaseAmount - backToOnePayBase, quoteTarget)
        newSide = 'LONG'
        newDeltaB = sellBaseAmount - backToOnePayBase
    }
    return [receiveQuote, newSide, newDeltaB]
}

function _querySellBaseToken(updateBalance, price, K, sellBaseAmount) {
    let receiveQuote
    let newDeltaB
    let newSide
    if (updateBalance.newSide === 'FLAT') {
        receiveQuote = _ROneSellBaseToken(price, K, sellBaseAmount, updateBalance.quoteTarget)
        newSide = 'LONG'
        newDeltaB = sellBaseAmount
    } else if (updateBalance.newSide === 'SHORT') {
        [receiveQuote, newSide, newDeltaB] = _sellHelperRAboveOne(sellBaseAmount, K, price, updateBalance.baseTarget, updateBalance.baseBalance, updateBalance.quoteTarget)
    } else {
        receiveQuote = _RBelowSellBaseToken(price, K, sellBaseAmount, updateBalance.quoteBalance, updateBalance.quoteTarget)
        newSide = 'LONG'
        newDeltaB = updateBalance.baseBalance - updateBalance.baseTarget + sellBaseAmount
    }
    return receiveQuote
}

function _buyHelperRBelowOne(buyBaseAmount, K, price, backToOneReceiveBase, baseTarget, quoteTarget, quoteBalance) {
    let payQuote
    let newSide
    let newDeltaB
    if (buyBaseAmount < backToOneReceiveBase) {
        payQuote = _RBelowBuyBaseToken(price, K, buyBaseAmount, quoteBalance, quoteTarget)
        newSide = 'LONG'
        newDeltaB = backToOneReceiveBase - buyBaseAmount
    } else if (buyBaseAmount === backToOneReceiveBase) {
        payQuote = _RBelowBuyBaseToken(price, K, backToOneReceiveBase, quoteBalance, quoteTarget)
        newSide = 'FLAT'
        newDeltaB = 0
    } else {
        let addQuote = _ROneBuyBaseToken(price, K, buyBaseAmount - backToOneReceiveBase, baseTarget)
        payQuote = _RBelowBuyBaseToken(price, K, backToOneReceiveBase, quoteBalance, quoteTarget) + addQuote
        newSide = 'SHORT'
        newDeltaB = buyBaseAmount - backToOneReceiveBase
    }
    return [payQuote, newSide, newDeltaB]
}

function _queryBuyBaseToken(updateBalance, price, K, buyBaseAmount) {
    let payQuote
    let newSide
    let newDeltaB
    if (updateBalance.newSide === 'FLAT') {
        payQuote = _ROneBuyBaseToken(price, K, buyBaseAmount, updateBalance.baseTarget)
        newSide = 'SHORT'
        newDeltaB = buyBaseAmount
    } else if (updateBalance.newSide === 'SHORT') {
        payQuote = _RAboveBuyBaseToken(price, K, buyBaseAmount, updateBalance.baseBalance, updateBalance.baseTarget)
        newSide = 'SHORT'
        newDeltaB = updateBalance.baseTarget - updateBalance.baseBalance + buyBaseAmount
    } else {
        [payQuote, newSide, newDeltaB] = _buyHelperRBelowOne(buyBaseAmount, K, price, updateBalance.baseBalance - updateBalance.baseTarget, updateBalance.baseTarget, updateBalance.quoteTarget, updateBalance.quoteBalance)
    }
    return payQuote
}

function getTvMidPrice(timePrice, deltaB, equity, K) {
    if (equity <= 0) return timePrice
    let side = (deltaB === 0 ? 'FLAT' : (deltaB > 0 ? 'SHORT' : 'LONG'))
    let updateBalance = getExpectedTargetExt(side, equity, timePrice, Math.abs(deltaB), K)
    let midPrice = getMidPrice(updateBalance, timePrice, K)
    return midPrice
}

export const queryTradePMM = (timePrice, deltaB, volume, equity, K) => {
    let side = (deltaB === 0 ? 'FLAT' : (deltaB > 0 ? 'SHORT' : 'LONG'))
    let updateBalance = getExpectedTargetExt(side, equity, timePrice, Math.abs(deltaB), K)
    let deltaQuote
    let tvCost
    if (volume >= 0) {
        deltaQuote = _queryBuyBaseToken(updateBalance, timePrice, K, volume)
        tvCost = deltaQuote
    } else {
        deltaQuote = _querySellBaseToken(updateBalance, timePrice, K, -volume)
        tvCost = -deltaQuote
    }
    let midPrice = getTvMidPrice(timePrice, deltaB + volume, equity, K)
    return [tvCost, midPrice]
}
