import { MAX_UINT256 } from "../../../shared/config/chain.js";
import { SECONDS_IN_A_DAY } from "../../../shared/config/constant.js";
import { bg, fromWei, getBlockInfo } from "../../../shared/utils";
import { calculateDpmmCost, calculateDpmmPrice, calculateK } from "../../utils/futures.js";
import {
  getEverlastingTimePriceAndDelta,
  getIntrinsicPrice,
  calculateK as calculateK2,
  getInitialMarginRequired,
} from "../../utils/option.js";
import { getSymbolPrice } from "../../utils/oracle.js";
import { deriSymbolScaleIn, deriSymbolScaleOut, normalizeDeriSymbol } from "../../utils/power.js";
import { classAdapter, overrideMethods, processMethod } from "./shared.js";

export const ERC20Adapter = (klass) => {
  klass = classAdapter(
    klass,
    "isUnlocked",
    async function (accountAddress, poolAddress) {
      const allowance = await this.allowance(accountAddress, poolAddress);
      const res = bg(allowance).gt(0);
      return res;
    }
  );
  klass = classAdapter(
    klass,
    "unlock",
    async function (accountAddress, poolAddress, opts) {
      return await this._transact(
        "approve",
        [poolAddress, MAX_UINT256],
        accountAddress,
        opts,
      );
    }
  );
  //klass = overrideMethods(klass, [[processMethod, "balanceOf"]]);
  return klass;
};
export const dTokenAdapter = (klass) => {
    // klass = processMethod(klass, 'symbol', []);
    return klass
}
export const vBEP20Adapter = (klass) => {
    // klass = processMethod(klass, 'symbol', []);
    klass = overrideMethods(klass, [
      [processMethod, "balanceOf"],
      [processMethod, "exchangeRateStored"],
      [processMethod, "borrowBalanceStored"],
      [processMethod, "borrowIndex"],
    ])

    return klass
}
export const vBNBAdapter = (klass) => {
    // klass = processMethod(klass, 'symbol', []);
    klass = overrideMethods(klass, [
      [processMethod, "balanceOf"],
      [processMethod, "exchangeRateStored"],
      [processMethod, "borrowBalanceStored"],
      [processMethod, "borrowIndex"],
    ])
    return klass
}
export const tokenVaultAdapter = (klass) => {
    // klass = overrideMethods(klass, [
    // ])
    return klass
}
export const vaultImplementationAdapter = (klass) => {
    // klass = processMethod(klass, 'symbol', []);
    klass = overrideMethods(klass, [
      [processMethod, "getBorrowLimit"],
      [processMethod, "borrowLimitMultiplier"],
      [processMethod, "getBalances", ["underlyingBalance", "vTokenBalance"]],
    ]);
    return klass
}

export const symbolManagerImplementationAdapter = (klass) => {
  // klass = processMethod(klass, 'symbol', []);
  klass = classAdapter(
    klass,
    'formatTradeEvent',
    async function (event, symbols, accountAddress) {
      const info = event.returnValues;
      const tradeVolume = fromWei(info.tradeVolume);
      const block = await getBlockInfo(this.chainId, event.blockNumber);
      const symbolId = info.symbolId;
      const symbol = symbols.find((s) => s.symbolId === symbolId);
      const tradeFee = info.tradeFee;
      //const trader = await this.pToken.getOwnerOf(info.pTokenId)

      const direction =
        tradeFee !== '-1'
          ? bg(tradeVolume).gt(0)
            ? 'LONG'
            : 'SHORT'
          : 'LIQUIDATION';
      const price = bg(info.tradeCost).div(info.tradeVolume).toString();
      const notional = bg(tradeVolume).abs().times(price).toString();

      const res = {
        symbolId: info.symbolId,
        symbol: symbol.symbol,
        displaySymbol: normalizeDeriSymbol(symbol.symbol),
        trader: accountAddress,
        pTokenId: info.pTokenId,
        direction,
        volume: deriSymbolScaleOut(symbol.symbol, bg(tradeVolume).abs()),
        price: deriSymbolScaleIn(symbol.symbol, price),
        indexPrice: fromWei(info.indexPrice).toString(),
        notional: notional,
        transactionFee: tradeFee === '-1' ? '0' : fromWei(tradeFee).toString(),
        transactionHash: event.transactionHash,
        time: block.timestamp * 1000,
        extra: {},
      };
      return res;
    }
  );
  klass = overrideMethods(klass, [[processMethod, 'initialMarginRequired']]);
  return klass;
};

export const symbolImplementationFuturesAdapter = (klass) => {
    klass = classAdapter(klass, "init", async function () {
      if (!this.parameters) {
        let res = { category: "futures" };
        [
          res.symbol,
          res.symbolId,
          res.oracleManager,
          res.feeRatio,
          res.alpha,
          res.initialMarginRatio,
          res.maintenanceMarginRatio,
          res.fundingPeriod,
          res.timeThreshold,
          res.pricePercentThreshold,
          res.minTradeVolume,
          res.isCloseOnly,
        ] = await Promise.all([
          this.symbol(),
          this.symbolId(),
          this.oracleManager(),
          this.feeRatio(),
          this.alpha(),
          this.initialMarginRatio(),
          this.maintenanceMarginRatio(),
          this.fundingPeriod(),
          this.timeThreshold(),
          this.pricePercentThreshold(),
          this.minTradeVolume(),
          this.isCloseOnly(),
        ]);
        this.parameters = res;
      }
      let res = {};
      [
          res.initialMarginRequired,
          res.fundingTimestamp,
          res.tradersPnl,
          res.netVolume,
          res.netCost,
          res.preIndexPrice,
          res.cumulativeFundingPerVolume,
          res.nPositionHolders,
          res.curIndexPrice,
      ] = await Promise.all([
          this.initialMarginRequired(),
          this.fundingTimestamp(),
          this.tradersPnl(),
          this.netVolume(),
          this.netCost(),
          this.indexPrice(),
          this.cumulativeFundingPerVolume(),
          this.nPositionHolders(),
          getSymbolPrice(this.chainId, this.parameters.oracleManager, this.parameters.symbolId),
      ])
      this.state = res
      return {...this.parameters, ...this.state};
    });
    klass = classAdapter(klass, "update", async function (liquidity) {
      let res = { ...this.parameters, ...this.state };
      // calc
      res.curTimestamp = Math.floor(Date.now()/1000)
      res.K = calculateK(
        res.curIndexPrice,
        liquidity,
        res.netVolume,
        this.parameters.alpha
      ).toString();
      res.markPrice = calculateDpmmPrice(res.curIndexPrice, res.K, res.netVolume).toString()
      res.pnl = calculateDpmmCost(
        res.curIndexPrice,
        res.K,
        res.netVolume,
        bg(res.netVolume).negated().toString()
      )
        .negated()
        .minus(res.netCost);
      res.fundingPerSecond = bg(res.markPrice).minus(res.curIndexPrice).div(res.fundingPeriod).toString()
      res.funding = bg(res.fundingPerSecond).times(SECONDS_IN_A_DAY).toString()
      const diff = bg(res.fundingPerSecond).times(res.curTimestamp - parseInt(res.fundingTimestamp))
      res.cumulativeFundingPerVolume = bg(res.cumulativeFundingPerVolume).plus(diff).toString()
      res.initialMarginRequired = bg(res.curIndexPrice)
        .times(res.netVolume)
        .times(res.initialMarginRatio)
        .toString();
      return res
    })
    klass = overrideMethods(klass, [
      [processMethod, "feeRatio"],
      [processMethod, "alpha"],
      [processMethod, "initialMarginRatio"],
      [processMethod, "maintenanceMarginRatio"],
      [processMethod, "initialMarginRequired"],
      [processMethod, "pricePercentThreshold"],
      [processMethod, "minTradeVolume"],

      [processMethod, "indexPrice"],
      [processMethod, "tradersPnl"],
      [processMethod, "netVolume"],
      [processMethod, "netCost"],
      [processMethod, "cumulativeFundingPerVolume"],

      [
        processMethod,
        "positions",
        ["volume", "cumulativeFundingPerVolume", "cost"],
      ],
    ]);

    return klass
}
export const symbolImplementationOptionAdapter = (klass) => {
    klass = classAdapter(klass, "init", async function () {
      if (!this.parameters) {
        let res = { category: "option" };
        [
          res.symbol,
          res.symbolId,
          res.oracleManager,
          res.feeRatioITM,
          res.feeRatioOTM,
          res.alpha,
          res.initialMarginRatio,
          res.maintenanceMarginRatio,
          res.fundingPeriod,
          res.timeThreshold,
          res.pricePercentThreshold,
          res.minTradeVolume,
          res.isCloseOnly,
          res.isCall,
          res.priceId,
          res.volatilityId,
          res.strikePrice,
          res.preIndexPrice,
        ] = await Promise.all([
          this.symbol(),
          this.symbolId(),
          this.oracleManager(),
          this.feeRatioITM(),
          this.feeRatioOTM(),
          this.alpha(),
          this.initialMarginRatio(),
          this.maintenanceMarginRatio(),
          this.fundingPeriod(),
          this.timeThreshold(),
          this.pricePercentThreshold(),
          this.minTradeVolume(),
          this.isCloseOnly(),
          this.isCall(),
          this.priceId(),
          this.volatilityId(),
          this.strikePrice(),
          this.indexPrice(),
        ]);
        this.parameters = res;
      }
      let res = {};
      [
        res.initialMarginRequired,
        res.fundingTimestamp,
        res.tradersPnl,
        res.netVolume,
        res.netCost,
        res.preIndexPrice,
        res.cumulativeFundingPerVolume,
        res.nPositionHolders,
        res.curIndexPrice,
        res.volatility,
      ] = await Promise.all([
        this.initialMarginRequired(),
        this.fundingTimestamp(),
        this.tradersPnl(),
        this.netVolume(),
        this.netCost(),
        this.indexPrice(),
        this.cumulativeFundingPerVolume(),
        this.nPositionHolders(),
        getSymbolPrice(this.chainId, this.parameters.oracleManager, this.parameters.priceId),
        getSymbolPrice(this.chainId, this.parameters.oracleManager, this.parameters.volatilityId),
      ]);
      this.state = res
      return {...this.parameters, ...this.state}
    });
    klass = classAdapter(klass, "update", async function (liquidity) {
      let res = { ...this.parameters, ...this.state };
      // calc
      res.curTimestamp = Math.floor(Date.now()/1000)
      res.intrinsicValue = getIntrinsicPrice(res.curIndexPrice, res.strikePrice, res.isCall);
      [res.timeValue, res.delta, res.u] = getEverlastingTimePriceAndDelta(
        res.curIndexPrice,
        res.strikePrice,
        res.volatility,
        res.fundingPeriod / 31536000
      );
      res.theoreticalPrice = bg(res.intrinsicValue).plus(res.timeValue).toString()
      if (bg(res.intrinsicValue).gt(0)) {
        res.delta = res.isCall
          ? bg(res.delta).plus(1).toString()
          : bg(res.delta).minus(1).toString();
      } else if (bg(res.curIndexPrice).eq(res.strikePrice)) {
        res.delta = res.isCall ? "0.5" : "-0.5";
      }
      // res.dynamicInitialMarginRatio = getDynamicInitialMarginRatio(
      //   res.indexPrice,
      //   res.strikePrice,
      //   res.isCall,
      //   res.initialMarginRatio,
      //   '0.01'   // minInitialMarginRatio
      // );
      res.K = calculateK2(
        res.curIndexPrice,
        res.theoreticalPrice,
        res.delta,
        res.alpha,
        liquidity,
      );
      res.markPrice = calculateDpmmPrice(
        res.curIndexPrice,
        res.K,
        res.netVolume
      ).toString();
      res.pnl = calculateDpmmCost(
        res.theoreticalPrice,
        res.K,
        res.netVolume,
        bg(res.netVolume).negated().toString()
      )
        .negated()
        .minus(res.netCost).toString();
      res.fundingPerSecond = bg(res.markPrice).minus(res.intrinsicValue).div(res.fundingPeriod).toString()
      res.funding = bg(res.fundingPerSecond).times(SECONDS_IN_A_DAY).toString()
      const diff = bg(res.fundingPerSecond).times(res.curTimestamp - parseInt(res.fundingTimestamp))
      res.cumulativeFundingPerVolume = bg(res.cumulativeFundingPerVolume).plus(diff).toString()
      res.maintenanceMarginPerVolume = getInitialMarginRequired(res)
      res.initialMarginPerVolume = bg(res.maintenanceMarginPerVolume)
        .times(res.initialMarginRatio)
        .div(res.maintenanceMarginRatio)
        .toString();
      res.initialMarginRequired = bg(res.initialMarginPerVolume).times(res.netVolume).toString()
      return res
    })
    klass = overrideMethods(klass, [
      [processMethod, "feeRatioITM"],
      [processMethod, "feeRatioOTM"],
      [processMethod, "alpha"],
      [processMethod, "initialMarginRatio"],
      [processMethod, "maintenanceMarginRatio"],
      [processMethod, "initialMarginRequired"],
      [processMethod, "pricePercentThreshold"],
      [processMethod, "minTradeVolume"],

      [processMethod, "indexPrice"],
      [processMethod, "strikePrice"],
      [processMethod, "tradersPnl"],
      [processMethod, "netVolume"],
      [processMethod, "netCost"],
      [processMethod, "cumulativeFundingPerVolume"],

      [
        processMethod,
        "positions",
        ["volume", "cumulativeFundingPerVolume", "cost"],
      ],
    ]);
    return klass
}

export const oracleManagerAdapter = (klass) => {
    klass = overrideMethods(klass, [
      [processMethod, "getValue"],
    ])
    return klass
}
export const oracleChainlinkAdapter = (klass) => {
    klass = overrideMethods(klass, [
      [processMethod, "getValue"],
    ])
    return klass
}
export const oracleWooAdapter = (klass) => {
    klass = overrideMethods(klass, [
      [processMethod, "getValue"],
    ])
    return klass
}
export const oracleOffChainAdapter = (klass) => {
    klass = overrideMethods(klass, [
      [processMethod, "getValue"],
    ])
    return klass
}
export const venusControllerAdapter = (klass) => {
    klass = overrideMethods(klass, [
      [processMethod, 'venusSupplyState', ['index']],
      [processMethod, 'venusBorrowState', ['index']],
      [processMethod, 'venusSupplierIndex'],
      [processMethod, 'venusBorrowerIndex'],
      [processMethod, 'venusAccrued'],
      [processMethod, 'venusInitialIndex'],
    ]);

    return klass
}

export const symbolImplementationPowerAdapter = (klass) => {
    klass = classAdapter(klass, "init", async function () {
    });
    klass = classAdapter(klass, "update", async function (liquidity) {
    })
    klass = overrideMethods(klass, [
      [processMethod, "feeRatio"],
      [processMethod, "alpha"],
      [processMethod, "initialMarginRatio"],
      [processMethod, "maintenanceMarginRatio"],
      [processMethod, "initialMarginRequired"],
      [processMethod, "pricePercentThreshold"],
      [processMethod, "minTradeVolume"],

      [processMethod, "indexPrice"],
      [processMethod, "tradersPnl"],
      [processMethod, "netVolume"],
      [processMethod, "netCost"],
      [processMethod, "cumulativeFundingPerVolume"],
      [
        processMethod,
        "positions",
        ["volume", "cumulativeFundingPerVolume", "cost"],
      ],
    ]);

    return klass
}
export const rewardVaultAdapter = (klass) => {
  klass = overrideMethods(klass, [
    [processMethod, "pendingByAddress"],
    [processMethod, "pending"],
    [processMethod, "rewardPerSecond"],
  ]);
  return klass
}


export const VoteAdapter = (klass) => {
  klass = overrideMethods(klass, [
    [processMethod, "getVotePowerOnBNB"],
    [processMethod, "getVotePowerOnEthereum"],
    [processMethod, "getVotePowerOnArbitrum"],
  ]);
  return klass
}

