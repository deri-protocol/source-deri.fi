import { ADDRESS_ZERO, debug, getIndexInfo, normalizeSymbolUnit, SECONDS_IN_A_DAY } from "../../shared/config";
import { ObjectCache } from "../../shared/cache";
import { bg, max, min, contractFactory} from "../../shared/utils";
import { checkToken, getBTokenApyAndDiscounts, getBTokenInfo, getSymbolInfo, isArbiChain, isOptionSymbol } from "../config";
import { poolImplementationFactory } from "./factory/pool"
import {
  calculateChangedVolume,
  calculateDpmmCost,
  calculateDpmmPrice,
  calculateK,
  // calculateLiquidationPrice
} from "../utils/futures";
import {
  calculateK as calculateK2,
  getEverlastingTimePriceAndDelta,
  getIntrinsicPrice,
  // getLiquidationPrice as getLiquidationPrice2
} from "../utils/option";
import {
  calculateK as calculateK3,
  deriSymbolScaleIn,
  deriSymbolScaleOut,
  normalizeDeriSymbol,
  isPowerSymbol,
  // calculateLiquidationPrice3,
} from "../utils/power";
import { getLiquidationPrice } from "../utils/symbol";

// PoolApi
export class PoolApi {
  constructor(chainId, poolAddress) {
    this.chainId = chainId;
    this.poolAddress = poolAddress;
    this.pool = poolImplementationFactory(chainId, poolAddress);
  }

  async init(accountAddress) {
    await this.pool.init(accountAddress);
  }

  // API
  async getUserStakeInfo(accountAddress) {
    //await this.pool.getInfo(accountAddress);
    await this.pool.getAssets(accountAddress);
    const pool = this.pool;
    const assets = pool.assets;
    // const assets = await pool.getAssets(accountAddress)
    // console.log('assets', assets)
    return {
      chainId: this.chainId,
      poolAddress: this.poolAddress,
      isStaked: assets.filter((a) => bg(a.vaultBalance).gt(0)).length > 0,
      bTokens: assets.map((a) => ({
        bTokenSymbol: a.bTokenSymbol,
        isStaked: bg(a.vaultBalance).gt(0),
      })),
    };
  }

  async getPoolB0Info() {
    //await this.pool.getInfo(accountAddress);
    const pool = this.pool;
    const liquidity = pool.state.liquidity
    const balanceOfB0 = pool.state.balanceOfB0
    const minRatioB0 = pool.parameters.minRatioB0
    // const initialMarginRequired = pool.symbols.reduce((acc, s) => acc.plus(s.initialMarginRequired), bg(0))
    // const assets = await pool.getAssets(accountAddress)
    // console.log('assets', assets)
    // console.log('--->> getPoolB0Info', liquidity, pool.state.balanceOfB0, pool.parameters.minRatioB0)
    return {
      pool: pool.contractAddress,
      balanceOfB0,
      insufficientB0: bg(balanceOfB0).lt(bg(liquidity).times(minRatioB0))
      // insufficientLiquidity: bg(liquidity).lt(initialMarginRequired.times(pool.parameters.poolInitialMarginMultiplier)),
    };
  }

  async getLiquidityInfo(accountAddress, bTokenSymbol) {
    const pool = this.pool;
    // await this.pool.getInfo(accountAddress);
    await Promise.all(
      [
        this.pool.getBTokens(accountAddress),
        this.pool.getSymbols()
      ]);
    await this.pool.getAssets(accountAddress);
    const liquidity = pool.state.liquidity;

    const amountB0 = pool.account.lpAmountB0;
    const bTokens = pool.bTokens;
    const b0Symbol = bTokens[0].bTokenSymbol;

    const assets = pool.bTokens.map((b) => {
      const asset = pool.assets.find(
        (a) => a.bTokenSymbol === b.bTokenSymbol
      );
      if (asset) {
        return { ...b, ...asset };
      } else {
        return { ...b, vaultBalance: "0" };
      }
    });
    const bToken = assets.find((a) => a.bTokenSymbol === bTokenSymbol);

    ObjectCache.set(this.poolAddress, "liquidity_info", {
      assets,
      bTokens,
      liquidity,
      bToken,
    });

    let deltaTradersPnl = "0",
      funding = "0";
    for (let symbol of pool.symbols) {
      deltaTradersPnl = bg(deltaTradersPnl).plus(
        bg(symbol.curTradersPnl).minus(symbol.tradersPnl)
      );
      funding = bg(funding).plus(symbol.funding);
    }
    //console.log(pool.state.cumulativePnlPerLiquidity, funding.toString(), tradersPnl.toString(), pool.state.liquidity)
    const cumulativePnlPerLiquidity = bg(
      pool.state.cumulativePnlPerLiquidity
    ).plus(bg(funding).minus(deltaTradersPnl).div(pool.state.liquidity));
    const pnl = bg(cumulativePnlPerLiquidity)
      .minus(pool.account.cumulativePnlPerLiquidity)
      .times(pool.account.liquidity)
      .toString();
    let share = "0";
    if (bToken) {
      share = bToken.vaultBalance
        ? bTokenSymbol === b0Symbol
          ? bg(bToken.vaultBalance).plus(amountB0).toString()
          : bToken.vaultBalance
        : "0";
    } else {
      throw new Error(`cannot find bToken ${bTokenSymbol} in the pool ${this.poolAddress}`)
    }
    const shareTotal = assets.reduce((acc, a) => {
      if (!bg(a.vaultBalance).eq(0)) {
        acc = acc.plus(
          a.bTokenSymbol === b0Symbol
            ? bg(a.vaultBalance).plus(amountB0)
            : bg(a.vaultBalance).times(a.bTokenPrice)
        );
      }
      return acc
    }, bg(0)).toString()
    return {
      poolLiquidity: liquidity,
      shares: share,
      bTokenPrice: bToken.bTokenPrice,
      maxRemovableShares: share,
      pnl,
      bTokenSymbol: bTokenSymbol,
      bToken0Symbol: bTokens[0].bTokenSymbol,
      swappedPnl: bg(share).eq(0) || bg(bToken.bTokenPrice).eq(0)
        ? "0"
        : bTokenSymbol === b0Symbol
        ? pnl
        : bg(pnl).div(bToken.bTokenPrice).toString(),
      pnlPercentage: bg(shareTotal).eq(0)
        ? "0"
        : bg(pnl).div(shareTotal).toString(),
    };
  }

  async getEstimatedLiquidityInfo(accountAddress, newAmount, bTokenSymbol) {
    const pool = this.pool;
    const res = ObjectCache.get(this.poolAddress, "liquidity_info");
    if (res && res.assets) {
      const { assets, bTokens, liquidity } = res;
      const b0Symbol = bTokens[0].bTokenSymbol;
      const amountB0 = pool.account.lpAmountB0;
      const asset = getBTokenInfo(bTokenSymbol, assets);
      if (asset) {
        let share = "0";
        if (asset) {
          share = asset.vaultBalance
            ? bTokenSymbol === b0Symbol
              ? bg(asset.vaultBalance).plus(amountB0).toString()
              : asset.vaultBalance
            : "0";
        }
        return {
          percentage1: bg(share)
            .plus(newAmount)
            .times(asset.bTokenPrice)
            .div(bg(liquidity).plus(bg(newAmount).times(asset.bTokenPrice)))
            .toString(),
          shares1: bg(share).plus(newAmount).toString(),
        };
      } else {
        return {
          percentage1: "",
          shares1: "",
        };
      }
    } else {
      throw new Error("cache invalid", {
        name: `${this.poolAddress}.liquidity_info`,
        data: res,
      });
    }
  }
  async getSpecification(symbolName) {
    //await this.init();
    const pool = this.pool;
    await this.pool.getSymbols();
    const {
      liquidationRewardCutRatio,
      protocolFeeCollectRatio,
      minLiquidationReward,
      maxLiquidationReward,
      //maintenanceMarginRatio,
      minRatioB0,
      reserveRatioB0,
    } = pool.parameters;
    const symbolInfo = getSymbolInfo(symbolName, pool.symbols);

    const {
      symbol,
      maintenanceMarginRatio,
      initialMarginRatio,
      minTradeVolume,
    } = symbolInfo;
    const bTokenMultiplier = // await Promise.all(
      //   pool.bTokens.reduce(
      //     (acc, b) => [...acc, getBTokenApyAndDiscount(b.bTokenSymbol)],
      //     []
      //   )
      // )
      (
        await getBTokenApyAndDiscounts(
          this.chainId,
          this.poolAddress,
          pool.bTokens,
        )
      ).map((b) => bg(b.factor).times(1.25).toString());

    const fundingRateCoefficient = bg(1)
      .div(symbolInfo.fundingPeriod)
      .toString();
    if (isOptionSymbol(symbolInfo)) {
      return {
        symbol,
        isCall: symbolInfo.isCall,
        feeRatioOTM: symbolInfo.feeRatioOTM,
        feeRatioITM: symbolInfo.feeRatioITM,
        bTokenSymbol: pool.bTokenSymbols,
        multiplier: minTradeVolume,
        initialMarginRatio: max(
          bg(symbolInfo.initialMarginPerVolume).div(symbolInfo.curIndexPrice),
          symbolInfo.minInitialMarginRatio
        ).toString(),
        maintenanceMarginRatio: bg(symbolInfo.maintenanceMarginPerVolume)
          .div(symbolInfo.curIndexPrice)
          .toString(),
        bTokenMultiplier,
        fundingRateCoefficient,
        minPoolMarginRatio: "",
        initialMarginRatioOrigin: initialMarginRatio,
        maintenanceMarginRatioOrigin: maintenanceMarginRatio,
        minLiquidationReward,
        maxLiquidationReward,
        liquidationCutRatio: liquidationRewardCutRatio,
        protocolFeeCollectRatio,
        indexConstituents: getIndexInfo(symbol),
        minRatioB0,
        reserveRatioB0,
        minTradeVolume,
        fundingPeriod: symbolInfo.fundingPeriod,
        delta: symbolInfo.delta,
        gamma: bg(symbolInfo.curIndexPrice).eq(0)
          ? "0"
          : bg(symbolInfo.u)
              .times(symbolInfo.u)
              .minus(1)
              .times(symbolInfo.timeValue)
              .div(4)
              .div(symbolInfo.curIndexPrice)
              .div(symbolInfo.curIndexPrice)
              .toString(),
      };
    } else if (isPowerSymbol(symbolInfo)) {
      return {
        symbol,
        displaySymbol: normalizeDeriSymbol(symbol),
        feeRatio: symbolInfo.feeRatio,
        bTokenSymbol: pool.bTokenSymbols,
        multiplier: minTradeVolume,
        bTokenMultiplier,
        fundingRateCoefficient,
        minPoolMarginRatio: "",
        initialMarginRatio,
        maintenanceMarginRatio,
        minLiquidationReward,
        maxLiquidationReward,
        liquidationCutRatio: liquidationRewardCutRatio,
        protocolFeeCollectRatio,
        indexConstituents: getIndexInfo(symbol),
        minRatioB0,
        reserveRatioB0,
        minTradeVolume,
        fundingPeriod: symbolInfo.fundingPeriod,
        delta: "",
        gamma: "",
      };
    } else {
      return {
        symbol,
        feeRatio: symbolInfo.feeRatio,
        bTokenSymbol: pool.bTokenSymbols,
        multiplier: minTradeVolume,
        bTokenMultiplier,
        fundingRateCoefficient,
        minPoolMarginRatio: "",
        initialMarginRatio,
        maintenanceMarginRatio,
        minLiquidationReward,
        maxLiquidationReward,
        liquidationCutRatio: liquidationRewardCutRatio,
        protocolFeeCollectRatio,
        indexConstituents: getIndexInfo(symbol),
        minRatioB0,
        reserveRatioB0,
        minTradeVolume,
        fundingPeriod: symbolInfo.fundingPeriod,
        delta: "",
        gamma: "",
      };
    }
  }

  async getPositionInfo(accountAddress, symbolName) {
    const pool = this.pool;
    // await this.pool.getInfo(accountAddress);
    const startAt = Date.now()
    debug() && console.log(`-- getPositionInfo start(${startAt})`)
    await this.pool.getSymbols();
    if (accountAddress === ADDRESS_ZERO) {
      const symbol = pool.symbols.find((s) => s.symbol === symbolName)
      return {
        symbol: symbolName,
        indexPrice: symbol.curIndexPrice,
        markPrice: symbol.markPrice,
        volatility: symbol.curVolatility,
      }
    } else {
      await this.pool.getPositions(accountAddress);

      const positions = pool.symbols.map((b) => {
        const position = pool.positions.find((p) => p.symbol === b.symbol);
        if (position) {
          return { ...b, ...position };
        } else {
          return {
            ...b,
            volume: "0",
            cost: "0",
            cumulativeFundingPerVolume: "0",
            traderPnl: "0",
            dpmmTraderPnl: "0",
            fundingAccrued: "0",
            initialMarginRequired: "0",
          };
        }
      });

      const position = getSymbolInfo(symbolName, positions);

      ObjectCache.set(this.poolAddress, `position_info`, {
        symbol: position,
        margin: pool.account.margin,
        volume: position.volume,
        cost: position.cost,
        trader: pool.account,
        symbols: pool.symbols,
        positions: pool.positions,
      });
      const res = {
        symbol: normalizeDeriSymbol(position.symbol),
        symbolUnit: normalizeSymbolUnit(position.symbol),
        //b0Unit: pool.bTokenSymbols && pool.bTokenSymbols[0],
        poolInitialMarginMultiplier:
          pool.parameters.poolInitialMarginMultiplier,
        price: position.curIndexPrice,
        indexPrice: position.curIndexPrice,
        markPrice: deriSymbolScaleIn(position.symbol, position.markPrice),
        displayMarkPrice: deriSymbolScaleIn(
          position.symbol,
          position.markPrice
        ),
        theoreticalPrice: position.theoreticalPrice
          ? position.theoreticalPrice.toString()
          : "",
        volume: position.volume,
        cost: position.cost,
        averageEntryPrice: bg(position.volume).eq(0)
          ? "0"
          : bg(position.cost).div(position.volume).toString(),
        margin: pool.account.margin,
        marginHeld: positions
          .reduce(
            (acc, p) =>
              bg(acc).plus(bg(p.volume).eq(0) ? "0" : p.initialMarginRequired),
            bg(0)
          )
          .toString(),
        marginHeldBySymbol: bg(position.volume).eq(0)
          ? "0"
          : position.initialMarginRequired,
        unrealizedPnl: positions
          .reduce((acc, p) => bg(acc).plus(p.traderPnl), bg(0))
          .toString(),
        unrealizedPnlList: positions.map((p) => [p.symbol, p.traderPnl]),
        fundingFee: positions
          .reduce((acc, p) => bg(acc).plus(p.fundingAccrued), bg(0))
          .toString(),
        liquidationPrice: bg(position.volume).eq(0)
          ? "0"
          : getLiquidationPrice(
              {
                trader: pool.account,
                symbols: pool.symbols,
                positions: pool.positions,
              },
              position.symbol,
              true
            ),
      };
      debug() &&
        console.log(
          `-- getPositionInfo end  (${startAt}): ${
            (Date.now() - startAt) / 1000
          }s`
        );
      return res;
    }
  }

  async getPositionInfos(accountAddress) {
    const pool = this.pool;
    // await this.pool.getInfo(accountAddress);
    const startAt = Date.now()
    debug() && console.log(`-- getPositionInfo start(${startAt})`)
    await this.pool.getSymbols();
    await this.pool.getPositions(accountAddress);

    // console.log(JSON.stringify(this.pool.positions))
    const positions = pool.symbols.map((b) => {
      const position = pool.positions.find((p) => p.symbol === b.symbol);
      if (position) {
        return { ...b, ...position };
      } else {
        return {
          ...b,
          volume: "0",
          cost: "0",
          cumulativeFundingPerVolume: "0",
          traderPnl: "0",
          dpmmTraderPnl: "0",
          fundingAccrued: "0",
          initialMarginRequired: "0",
        };
      }
    });
    const marginHeld = positions
      .reduce(
        (acc, p) =>
          bg(acc).plus(
            bg(p.netVolume).eq(0) ? "0" : bg(p.initialMarginRequired).abs()
          ),
        bg(0)
      )
      .toString();

    const res = positions
      .map((p) => {
        return {
          symbol: p.symbol,
          displaySymbol: normalizeDeriSymbol(p.symbol),
          symbolUnit: isPowerSymbol(p.symbol)
            ? normalizeDeriSymbol(p.symbol)
            : normalizeSymbolUnit(p.symbol),
          b0Unit: pool.bTokenSymbols && pool.bTokenSymbols[0],
          poolInitialMarginMultiplier:
            pool.parameters.poolInitialMarginMultiplier,
          price: p.curIndexPrice,
          markPrice: deriSymbolScaleIn(p.symbol, p.markPrice),
          volume: deriSymbolScaleOut(p.symbol, p.volume),
          cost: p.cost,
          notional: bg(p.volume).eq(0)
            ? "0"
            : isPowerSymbol(p)
            ? bg(p.volume).times(p.theoreticalPrice).toString()
            : bg(p.volume).times(p.curIndexPrice).toString(),
          averageEntryPrice: bg(p.volume).eq(0)
            ? "0"
            : deriSymbolScaleIn(p.symbol, bg(p.cost).div(p.volume).toString()),
          margin: pool.account.margin,
          marginHeld,
          marginHeldBySymbol: bg(p.volume).eq(0)
            ? "0"
            : p.initialMarginRequired,
          unrealizedPnl: p.dpmmTraderPnl,
          fundingFee: p.fundingAccrued,
          liquidationPrice: bg(p.volume).eq(0) ? '0' : getLiquidationPrice(
            {
              trader: pool.account,
              symbols: pool.symbols,
              positions: pool.positions,
            },
            p.symbol
          )
        };
      })
      .filter((p) => p.volume !== "0");

    debug() && console.log(`-- getPositionInfos end  (${startAt}): ${(Date.now() - startAt)/1000} s`)
    return res
  }

  async getEstimatedLiquidatePrice(accountAddress, newVolume) {
    const res = ObjectCache.get(this.poolAddress, `position_info`);
    if (!res) {
      throw new Error('please init object cache first.')
    }
    let {
      symbol,
      //
      trader,
      symbols,
      positions,
    } = res

    //  bg(volume).plus(bg(newVolume)),
    if (isOptionSymbol(symbol.symbol)) {
      return '0'
    } else {
      let position = positions.find((p) => p.symbol === symbol.symbol)
      let oldVolume
      if (position) {
        oldVolume = position.volume
        position = { ...position, volume: bg(position.volume).plus(newVolume).toString()}
      } else {
        oldVolume = '0'
        position = { symbol: symbol.symbol, volume: newVolume, traderPnl: '0', cost: '0' }
      }
      if (isPowerSymbol(symbol.symbol)) {
        position.initialMarginRequired = bg(position.volume).abs().times(symbol.theoreticalPrice).times(symbol.initialMarginRatio).toString()
        position.maintenanceMarginRequired = bg(position.initialMarginRequired).times(symbol.maintenanceMarginRatio).div(symbol.initialMarginRatio).toString()
        trader.initialMargin = bg(trader.initialMargin).plus(position.initialMarginRequired).minus(bg(oldVolume).abs().times(symbol.theoreticalPrice).times(symbol.initialMarginRatio)).toString()
        trader.maintenanceMargin = bg(trader.maintenanceMargin).plus(position.maintenanceMarginRequired).minus(bg(oldVolume).abs().times(symbol.theoreticalPrice).times(symbol.maintenanceMarginRatio)).toString()
        if (bg(oldVolume).eq(0)) {
          position.cost = bg(position.volume).times(symbol.theoreticalPrice).toString()
        }
      } else {
        position.initialMarginRequired = bg(position.volume).abs().times(symbol.curIndexPrice).times(symbol.initialMarginRatio).toString()
        position.maintenanceMarginRequired = bg(position.initialMarginRequired).times(symbol.maintenanceMarginRatio).div(symbol.initialMarginRatio).toString()
        trader.initialMargin = bg(trader.initialMargin).plus(position.initialMarginRequired).minus(bg(oldVolume).abs().times(symbol.curIndexPrice).times(symbol.initialMarginRatio)).toString()
        trader.maintenanceMargin = bg(trader.maintenanceMargin).plus(position.maintenanceMarginRequired).minus(bg(oldVolume).abs().times(symbol.curIndexPrice).times(symbol.maintenanceMarginRatio)).toString()
        if (bg(oldVolume).eq(0)) {
          position.cost = bg(position.volume).times(symbol.curIndexPrice).toString()
        } else {
          position.cost = bg(position.cost).plus(bg(newVolume).times(symbol.curIndexPrice)).toString()
        }
      }
      let newPositions = positions.length > 0
        ? positions.reduce((acc, p) => {
          if (p.symbol === position.symbol) {
            acc.push(position)
          } else {
            acc.push(p)
          }
          return acc
        }, [])
        : []
      if (oldVolume === '0') {
        newPositions.push(position)
      }
      const res = getLiquidationPrice(
        {
          trader,
          symbols,
          positions: newPositions,
        },
        symbol.symbol,
        true,
      )
      return res
    }
  }

  async getPoolMarkPrices() {
    const pool = this.pool;
    try {
      return pool.symbols.map((s) => {
        return {
          pool: this.poolAddress,
          symbol: s.symbol,
          symbolId: s.symbolId,
          markPrice: deriSymbolScaleIn(s.symbol, s.markPrice),
          indexPrice: s.curIndexPrice,
        };
      });
    } catch (err) {
      return [];
    }
  }

  async getEstimatedMargin(accountAddress, volume, leverage, symbolName) {
    await this.pool.getSymbols();
    const pool = this.pool;
    const symbolInfo = getSymbolInfo(symbolName, pool.symbols);
    if (isOptionSymbol(symbolInfo) || isPowerSymbol(symbolInfo)) {
      return bg(symbolInfo.initialMarginPerVolume).times(volume).toString();
    } else {
      return bg(volume)
        .abs()
        .times(symbolInfo.curIndexPrice)
        .div(leverage)
        .toString();
    }
  }

  async getEstimatedFee(volume, symbolName) {
    const pool = this.pool;
    // await pool.init();
    await pool.getSymbols();
    symbolName = checkToken(symbolName);
    const symbolInfo = getSymbolInfo(symbolName, pool.symbols);
    if (isOptionSymbol(symbolInfo)) {
      let fee;
      if (bg(symbolInfo.intrinsicValue).gt(0)) {
        fee = bg(volume)
          .abs()
          .times(symbolInfo.curIndexPrice)
          .times(symbolInfo.feeRatioITM)
          .toString();
      } else {
        const cost = calculateDpmmCost(
          symbolInfo.theoreticalPrice,
          symbolInfo.K,
          symbolInfo.netVolume,
          volume
        );
        fee = bg(cost).abs().times(symbolInfo.feeRatioOTM).toString();
      }
      return fee;
    } else if (isPowerSymbol(symbolInfo)) {
      const cost = calculateDpmmCost(
        symbolInfo.theoreticalPrice,
        symbolInfo.K,
        symbolInfo.netVolume,
        volume
      );
      return bg(cost).abs().times(symbolInfo.feeRatio).toString();
    } else {
      const { curIndexPrice, feeRatio } = symbolInfo;
      return bg(volume).abs().times(curIndexPrice).times(feeRatio).toString();
    }
  }

  async getFundingRate(symbolName) {
    //await this.init();
    const pool = this.pool;
    await this.pool.getSymbols();
    const symbol = getSymbolInfo(symbolName, pool.symbols);
    const { fundingPerSecond, fundingPerDay, netVolume } = symbol;
    const liquidity = pool.state.liquidity;
    let volume1, volume2;

    if (isOptionSymbol(symbol) || isPowerSymbol(symbol)) {
      [volume1, volume2] = calculateChangedVolume(
        symbol.markPrice,
        symbol.theoreticalPrice,
        symbol.K,
        symbol.netVolume,
        "0.02"
      );
    } else {
      [volume1, volume2] = calculateChangedVolume(
        symbol.markPrice,
        symbol.curIndexPrice,
        symbol.K,
        symbol.netVolume,
        "0.02"
      );
    }
    return {
      markPrice: deriSymbolScaleIn(symbol.symbol, symbol.markPrice),
      powerPrice: isPowerSymbol(symbol) ? deriSymbolScaleIn(symbol.symbol, symbol.powerPrice) : '',
      funding0: deriSymbolScaleIn(symbol.symbol, fundingPerDay),
      fundingPerSecond: deriSymbolScaleIn(symbol.symbol, fundingPerSecond),
      liquidity: liquidity,
      tradersNetVolume: deriSymbolScaleOut(symbol.symbol, netVolume),
      payoff: symbol.intrinsicValue || "",
      fundingPeriod: symbol.fundingPeriod,
      impactUpNotional: deriSymbolScaleOut(symbol.symbol, volume1),
      impactDownNotional: deriSymbolScaleOut(symbol.symbol, volume2),
      theoreticalPrice: deriSymbolScaleIn(symbol.symbol, symbol.theoreticalPrice)
    };
  }

  async getEstimatedFundingRate(newVolume, symbolName) {
    const pool = this.pool;
    await this.pool.getSymbols();
    const symbol = getSymbolInfo(symbolName, pool.symbols);
    if (!symbol) {
      return {
        funding1: "",
      };
    }
    let fundingPerSecond;
    if (isOptionSymbol(symbol)) {
      const markPrice = calculateDpmmPrice(
        symbol.theoreticalPrice,
        symbol.K,
        bg(symbol.netVolume).plus(newVolume)
      ).toString();
      //console.log('i',markPrice, symbol.markPrice, symbol.intrinsicValue, symbol.fundingPeriod)
      fundingPerSecond = bg(symbol.fundingPeriod).eq(0)
        ? "0"
        : bg(markPrice)
            .minus(symbol.intrinsicValue)
            .div(symbol.fundingPeriod)
            .toString();
    } else if (isPowerSymbol(symbol)) {
      const markPrice = calculateDpmmPrice(
        symbol.theoreticalPrice,
        symbol.K,
        bg(symbol.netVolume).plus(newVolume)
      ).toString();
      fundingPerSecond = bg(symbol.fundingPeriod).eq(0)
        ? "0"
        : bg(markPrice)
            .minus(symbol.powerPrice)
            .div(symbol.fundingPeriod)
            .toString();
    } else {
      const markPrice = calculateDpmmPrice(
        symbol.curIndexPrice,
        symbol.K,
        bg(symbol.netVolume).plus(newVolume)
      ).toString();
      //console.log('m',markPrice, symbol.markPrice, symbol.curIndexPrice, symbol.fundingPeriod)
      fundingPerSecond = bg(symbol.fundingPeriod).eq(0)
        ? "0"
        : bg(markPrice)
            .minus(symbol.curIndexPrice)
            .div(symbol.fundingPeriod)
            .toString();
    }
    return {
      funding1: bg(fundingPerSecond).times(SECONDS_IN_A_DAY).toString(),
    };
  }

  async getLiquidityUsed() {
    const pool = this.pool;
    await pool.getSymbols();
    const { poolInitialMarginMultiplier } = pool.parameters;
    return pool.symbols
      .reduce(
        (acc, s) =>
          acc.plus(
            bg(s.initialMarginRequired).abs().times(poolInitialMarginMultiplier)
          ),
        bg(0)
      )
      .div(pool.state.liquidity)
      .toString();
  }

  async getEstimatedLiquidityUsed(newVolume, symbolName) {
    const pool = this.pool;
    await pool.getSymbols();
    const { poolInitialMarginMultiplier } = pool.parameters;
    const symbolInfo = getSymbolInfo(symbolName, pool.symbols);
    if (symbolInfo) {
      if (isOptionSymbol(symbolInfo) || isPowerSymbol(symbolInfo)) {
        if (symbolInfo.initialMarginPerVolume) {
          return pool.symbols
            .reduce(
              (acc, s) =>
                s.symbol === symbolName
                  ? acc.plus(
                      bg(symbolInfo.netVolume)
                        .plus(newVolume)
                        .abs()
                        .times(symbolInfo.initialMarginPerVolume)
                        .times(poolInitialMarginMultiplier)
                    )
                  : acc.plus(
                      bg(symbolInfo.netVolume)
                        .abs()
                        .times(symbolInfo.initialMarginPerVolume)
                        .times(poolInitialMarginMultiplier)
                    ),
              bg(0)
            )
            .div(pool.state.liquidity)
            .toString();
        }
        return "";
      } else {
        return pool.symbols
          .reduce(
            (acc, s) =>
              s.symbol === symbolName
                ? acc.plus(
                    bg(s.netVolume)
                      .plus(newVolume)
                      .abs()
                      .times(s.curIndexPrice)
                      .times(s.initialMarginRatio)
                      .times(poolInitialMarginMultiplier)
                  )
                : acc.plus(
                    bg(s.tradersNetVolume)
                      .abs()
                      .times(s.initialMarginRatio)
                      .times(poolInitialMarginMultiplier)
                  ),
            bg(0)
          )
          .div(pool.state.liquidity)
          .toString();
      }
    }
    return "";
  }

  async getUserBTokensInfo(accountAddress=ADDRESS_ZERO) {
    const pool = this.pool;
    await pool.getInfo(accountAddress);
    await Promise.all([pool.getBTokens(accountAddress), pool.getSymbols()]);
    await Promise.all([
      pool.getMargins(accountAddress),
      pool.getPositions(accountAddress),
    ]);

    const b0Symbol = pool.bTokens[0].bTokenSymbol;
    const amountB0 = pool.account ? pool.account.tdAmountB0 : '0'
    // const amountB0 = pool.account.lpAmountB0;
    const margin = pool.account ? pool.account.margin : '0';
    const marginHeld = pool.positions.reduce(
      (acc, p) =>
        bg(acc).plus(bg(p.volume).eq(0) ? "0" : p.initialMarginRequired),
      bg(0)
    );
    const traderPnl = pool.positions.reduce(
      (acc, p) => bg(acc).plus(bg(p.volume).eq(0) ? "0" : p.traderPnl),
      bg(0)
    );
    const funding = pool.positions.reduce(
      (acc, p) => bg(acc).plus(bg(p.volume).eq(0) ? "0" : p.fundingAccrued),
      bg(0)
    );

    // const vApys = await Promise.all(
    //   pool.bTokens.reduce(
    //     (acc, b) => [...acc, getBTokenApyAndDiscount(b.bTokenSymbol)],
    //     []
    //   )
    // );

    const vApys = await getBTokenApyAndDiscounts(
      pool.chainId,
      this.poolAddress,
      pool.bTokens,
    );
    const margins = pool.bTokens.map((b) => {
      const margin = pool.margins.find(
        (m) => m.bTokenSymbol === b.bTokenSymbol
      );
      if (margin) {
        return {
          ...b,
          ...margin,
          // vaultBalance: pool.bTokenDecimals[margin.underlying]
          //   ? bg(
          //     bg(margin.vTokenBalance).times(margin.exchangeRate),
          //     18 - this.bTokenDecimals[margin.underlying]
          //   )
          //   : bg(margin.vTokenBalance).times(margin.exchangeRate).toString()
        };
      } else {
        return {
          ...b,
          vaultBalance: "0",
        };
      }
    });
    return margins.map((m, index) => {
      let availableBalance = "0";
      if (b0Symbol === m.bTokenSymbol) {
        const b0Margin = bg(m.vaultBalance || 0).plus(amountB0);
        const b0DynamicBalance = bg(b0Margin).times(m.bTokenPrice)
        // margin left over: 考虑非B0的margin在有仓位的情况下可以提出来多少
        const marginLeftover = max(
          bg(marginHeld).minus(margin).minus(traderPnl).plus(b0DynamicBalance),
          0
        );
        if (bg(amountB0).minus(funding).lt(0)) {
          availableBalance = max(
            bg(b0Margin)
              .minus(amountB0)
              .minus(marginLeftover)
              //.plus(traderPnl)
              .minus(funding),
            bg(0)
          ).toString();
        } else {
          availableBalance = max(
            bg(b0Margin)
              .minus(marginLeftover)
              //.plus(traderPnl)
              .minus(funding),
            bg(0)
          ).toString();
        }
      } else {
        if (bg(amountB0).minus(funding).lt(0)) {
          availableBalance = max(
            min(
              bg(margin)
                .minus(marginHeld)
                //.minus(amountB0)
                .div(m.bTokenPrice)
                .div(isArbiChain(this.pool.chainId) ? m.collateralFactor : vApys[index].factor)
                .div(1.25)
                .plus(
                  bg(traderPnl)
                    .minus(funding)
                    .minus(amountB0)
                    .div(m.bTokenPrice)
                ),
              bg(m.vaultBalance)
            ),
            bg(0)
          ).toString();
        } else {
          availableBalance = max(
            min(
              bg(margin)
                .minus(marginHeld)
                .div(m.bTokenPrice)
                .div(isArbiChain(pool.chainId) ? m.collateralFactor : vApys[index].factor)
                .div(1.25)
                .plus(bg(traderPnl).minus(funding).div(m.bTokenPrice)),
              bg(m.vaultBalance)
            ),
            bg(0)
          ).toString();
        }
      }
      return {
        bTokenAddress: m.bTokenAddress,
        bTokenSymbol: m.bTokenSymbol,
        bTokenPrice: m.bTokenPrice,
        availableBalance,
        walletBalance: m.walletBalance || '0',
        supplyApy: isArbiChain(pool.chainId) ? '0' : vApys[index].supplyApy.toString(),
        xvsApy: isArbiChain(pool.chainId) ? '0' : vApys[index].xvsApy.toString(),
        discount: bg(isArbiChain(pool.chainId) ? m.collateralFactor : vApys[index].factor).times(1.25).toString(),
      };
    });
  }

  async getFundingFee(accountAddress, symbolName) {
    const pool = this.pool;
    // await pool.getInfo();
    await pool.getPositions(accountAddress);
    try {
      const position = getSymbolInfo(symbolName, pool.positions);
      return position.fundingAccrued;
    } catch(err) {
      return '0'
    }
  }

  async getVolatility(symbolName) {
    const pool = this.pool;

    const symbolInfo = getSymbolInfo(symbolName, pool.symbols);
    if (isOptionSymbol(symbolInfo) || isPowerSymbol(symbolInfo)) {
      return symbolInfo.curVolatility;
    } else {
      return "";
    }
  }

  async getEstimatedTimePrice(newNetVolume, symbolName) {
    const pool = this.pool;
    const symbol = getSymbolInfo(symbolName, pool.symbols);
    if (symbol) {
      if (isOptionSymbol(symbol) || isPowerSymbol(symbol)) {
        const res = calculateDpmmCost(
          symbol.theoreticalPrice,
          symbol.K,
          symbol.netVolume,
          newNetVolume
        )
          .div(newNetVolume)
          .toString();
        return deriSymbolScaleIn(symbolName, res)
      } else {
        return calculateDpmmCost(
          symbol.curIndexPrice,
          symbol.K,
          symbol.netVolume,
          newNetVolume
        )
          .div(newNetVolume)
          .toString();
      }
    }
    return "";
  }

  async getEstimatedLpInfo(accountAddress, bTokenSymbol, newVolume) {
    const pool = this.pool;
    await Promise.all([pool.getSymbols(), pool.getAssets(accountAddress)]);
    let amountB0 = pool.account.lpAmountB0;
    const b0Symbol = pool.bTokens[0].bTokenSymbol;
    const bTokens = pool.bTokens.map((b) => {
      const asset = pool.assets.find(
        (a) => a.bTokenSymbol === b.bTokenSymbol
      );
      if (asset) {
        return { ...b, ...asset };
      } else {
        return { ...b, vaultBalance: "0" };
      }
    });
    const bToken = getBTokenInfo(bTokenSymbol, bTokens);
    //console.log('btoken', bToken)
    const removedLiquidity =
      bToken.bTokenSymbol === b0Symbol
        ? bg(amountB0).plus(bToken.vaultBalance)
        : bg(bToken.vaultBalance).times(bToken.bTokenPrice);
    // console.log('>', removedLiquidity.toString(), pool.state.liquidity);
    const newLiquidity = bg(pool.state.liquidity)
      .minus(removedLiquidity)
      .toString();
    let deltaTradersPnl = "0",
      funding = "0",
      removeLiquidityPenalty = "0";
    for (let symbol of pool.symbols) {
      let newTradersPnl;
      if (isOptionSymbol(symbol)) {
        newTradersPnl = calculateDpmmCost(
          symbol.theoreticalPrice,
          symbol.K,
          symbol.netVolume,
          bg(symbol.netVolume).negated()
        )
          .negated()
          .minus(symbol.netCost);
        const newK = calculateK2(
          symbol.curIndexPrice,
          symbol.theoreticalPrice,
          symbol.delta,
          symbol.alpha,
          newLiquidity
        );
        const newPnl = calculateDpmmCost(
          symbol.theoreticalPrice,
          newK,
          symbol.netVolume,
          bg(symbol.netVolume).negated()
        )
          .negated()
          .minus(symbol.netCost);
        removeLiquidityPenalty = bg(removeLiquidityPenalty).plus(
          bg(newPnl).minus(symbol.tradersPnl)
        );
      } else if (isPowerSymbol(symbol)) {
        newTradersPnl = calculateDpmmCost(
          symbol.theoreticalPrice,
          symbol.K,
          symbol.netVolume,
          bg(symbol.netVolume).negated()
        )
          .negated()
          .minus(symbol.netCost);
        const newK = calculateK3(
          symbol.symbol,
          symbol.curIndexPrice,
          newLiquidity,
          symbol.alpha
        );
        const newPnl = calculateDpmmCost(
          symbol.theoreticalPrice,
          newK,
          symbol.netVolume,
          bg(symbol.netVolume).negated()
        )
          .negated()
          .minus(symbol.netCost);
        removeLiquidityPenalty = bg(removeLiquidityPenalty).plus(
          bg(newPnl).minus(symbol.tradersPnl)
        );
      } else {
        newTradersPnl = calculateDpmmCost(
          symbol.curIndexPrice,
          symbol.K,
          symbol.netVolume,
          bg(symbol.netVolume).negated()
        )
          .negated()
          .minus(symbol.netCost);
        const newK = calculateK(
          symbol.curIndexPrice,
          newLiquidity,
          symbol.alpha
        );
        const newPnl = calculateDpmmCost(
          symbol.curIndexPrice,
          newK,
          symbol.netVolume,
          bg(symbol.netVolume).negated()
        )
          .negated()
          .minus(symbol.netCost);
        removeLiquidityPenalty = bg(removeLiquidityPenalty).plus(
          bg(newPnl).minus(symbol.tradersPnl)
        );
      }

      deltaTradersPnl = bg(deltaTradersPnl).plus(
        bg(newTradersPnl).minus(symbol.tradersPnl)
      );
      funding = bg(funding).plus(symbol.funding);
    }

    const cumulativePnlPerLiquidity = bg(
      pool.state.cumulativePnlPerLiquidity
    ).plus(
      bg(funding)
        .plus(removeLiquidityPenalty)
        .minus(deltaTradersPnl)
        .div(pool.state.liquidity)
    );
    // console.log(
    //   '-',
    //   amountB0.toString(),
    //   removeLiquidityPenalty.toString(),
    //   cumulativePnlPerLiquidity.toString(),
    //   pool.account.cumulativePnlPerLiquidity,
    //   pool.account.liquidity
    // );
    amountB0 = bg(amountB0)
      .minus(removeLiquidityPenalty)
      .plus(
        bg(cumulativePnlPerLiquidity)
          .minus(pool.account.cumulativePnlPerLiquidity)
          .times(pool.account.liquidity)
      );
    const assets = pool.bTokens.map((b) => {
      const asset = pool.assets.find(
        (a) => a.bTokenSymbol === b.bTokenSymbol
      );
      if (asset) {
        return { ...b, ...asset };
      } else {
        return { ...b, vaultBalance: "0", vTokenBalance: "0" };
      }
    });
    const actualWithdrawAmount = bg(newVolume).lte(0)
      ? "0"
      : bg(amountB0).gte(0)
      ? newVolume
      : max(bg(newVolume).plus(bg(amountB0).div(bToken.bTokenPrice)), bg(0)).toString();
    return {
      poolAddress: this.poolAddress,
      accountAddress,
      b0Penalty: bg(amountB0).toString(),
      bTokenPrice: bToken.bTokenPrice,
      bTokenSymbol: bToken.bTokenSymbol,
      isB0Staked: bg(assets[0].vTokenBalance).gt(0),
      actualWithdrawAmount,
    };
  }

  async getEstimatedTdInfo(accountAddress, bTokenSymbol, newVolume) {
    const pool = this.pool;
    await Promise.all([pool.getSymbols(), pool.getPositions()]);
    let amountB0 = pool.account.tdAmountB0;
    const bToken = getBTokenInfo(bTokenSymbol, pool.bTokens);
    const positions = pool.symbols.map((b) => {
      const position = pool.positions.find((p) => p.symbol === b.symbol);
      if (position) {
        return { ...b, ...position };
      } else {
        return {
          ...b,
          volume: "0",
          cost: "0",
          cumulativeFundingPerVolume: "0",
          traderPnl: "0",
          fundingAccrued: "0",
          initialMarginRequired: "0",
        };
      }
    });
    let traderFunding = "0";
    for (let position of positions) {
      //console.log(position.symbol, position.fundingAccrued)
      traderFunding = bg(traderFunding).plus(position.fundingAccrued);
    }
    //console.log('traderFunding', traderFunding.toString())
    amountB0 = bg(amountB0).minus(traderFunding);

    const margins = pool.bTokens.map((b) => {
      const margin = pool.margins.find(
        (a) => a.bTokenSymbol === b.bTokenSymbol
      );
      if (margin) {
        return { ...b, ...margin };
      } else {
        return { ...b, vaultBalance: "0", vTokenBalance: "0" };
      }
    });

    const actualWithdrawAmount = bg(newVolume).lte(0)
      ? "0"
      : bg(amountB0).gte(0)
      ? newVolume
      : max(bg(newVolume).plus(bg(amountB0).div(bToken.bTokenPrice)), bg(0)).toString();

    return {
      poolAddress: this.poolAddress,
      accountAddress,
      b0Penalty: bg(amountB0).toString(),
      bTokenPrice: bToken.bTokenPrice,
      bTokenSymbol: bToken.bTokenSymbol,
      isB0Staked: bg(margins[0].vTokenBalance).gt(0),
      actualWithdrawAmount,
    };
    // await pool.get
  }

  getEstimatedDpmmCost(newNetVolume) {
    const res = ObjectCache.get(this.poolAddress, "position_info");
    if (!res) {
      debug() && console.log('please init position_info object cache first.')
      return ''
    }
    const { symbol } = res;
    if (isOptionSymbol(symbol) || isPowerSymbol(symbol)) {
      return calculateDpmmCost(
        symbol.theoreticalPrice,
        symbol.K,
        symbol.netVolume,
        newNetVolume
      ).toString();
    } else {
      return calculateDpmmCost(
        symbol.curIndexPrice,
        symbol.K,
        symbol.netVolume,
        newNetVolume
      ).toString();
    }
  }

  getSimulatePnl(symbolName, indexPriceChangeRate) {
    //console.log('-- symbolName', symbolName, indexPriceChangeRate)
    const pool = this.pool
    if (!pool.symbols || !pool.symbols.length === 0) {
      return ''
    }
    const symbolInfo = getSymbolInfo(symbolName, pool.symbols);
    if (isPowerSymbol(symbolInfo)) {
      //console.log('-- symbolInfo', symbolInfo.curVolatility, symbolInfo.power)
      const indexPrice = bg(symbolInfo.curIndexPrice).times(bg(1).plus(indexPriceChangeRate))
      const oneHT = bg(1).minus(
            bg(symbolInfo.curVolatility)
              .times(symbolInfo.curVolatility)
              .times(symbolInfo.power)
              .times(bg(symbolInfo.power).minus(1))
              .div(2)
              .times(symbolInfo.fundingPeriod)
              .div(31536000)
          )
      // console.log('-- indexPrice ', symbolInfo.curIndexPrice, indexPrice.toString(), oneHT.toString(), symbolInfo.fundingPeriod)
      const powerPrice = indexPrice.times(indexPrice)
      const theoreticalPrice = powerPrice.div(oneHT)
      const K = bg(symbolInfo.power)
        .times(theoreticalPrice)
        .times(symbolInfo.alpha)
        .div(pool.state.liquidity);
      // console.log('-- powerPrice', powerPrice.toString(), theoreticalPrice.toString(), K.toString())
      const markPrice = calculateDpmmPrice(
        theoreticalPrice,
        K,
        symbolInfo.netVolume,
      )
      // console.log('-- markPrice', markPrice.toString())
      return bg(markPrice)
        .minus(symbolInfo.markPrice)
        .div(symbolInfo.markPrice)
        .toString();
    } else {
      return "";
    }
  }

  getSimulatePnls(symbolName, size) {
    //console.log('-- symbolName', symbolName, indexPriceChangeRate)
    const pool = this.pool
    const liquidity = pool.state.liquidity
    if (!pool.symbols || !pool.symbols.length === 0 || !liquidity) {
      return []
    }
    const symbolInfo = getSymbolInfo(symbolName, pool.symbols);
    const indexPriceStart = '0'
    const indexPriceEnd = symbolInfo.curIndexPrice * 2
    const indexPriceRange = bg(indexPriceEnd).minus(indexPriceStart).toString()
    const indexPriceList = Array(parseInt(size)).fill().map((_,index) => index).reduce((acc, i) =>{
      const prevousValue = acc.length === 0 ? 0 : acc[acc.length - 1]
      acc.push(bg(prevousValue).plus(bg(indexPriceRange).div(size)).toString())
      return acc
    }, ['0'])
    if (isPowerSymbol(symbolInfo)) {
      return indexPriceList.map((indexPrice) => {
          const oneHT = bg(1).minus(
          bg(symbolInfo.curVolatility)
          .times(symbolInfo.curVolatility)
          .times(symbolInfo.power)
          .times(bg(symbolInfo.power).minus(1))
          .div(2)
          .times(symbolInfo.fundingPeriod)
          .div(31536000))
          const theoreticalPrice = bg(indexPrice).times(indexPrice).div(oneHT);
          const K = calculateK3(symbolInfo.symbol, indexPrice, liquidity, symbolInfo.alpha)
          const markPrice =
            symbolInfo.curIndexPrice === indexPrice
              ? symbolInfo.markPrice
              : calculateDpmmPrice(
                  theoreticalPrice,
                  K,
                  symbolInfo.netVolume
                ).toString();
        return {
          indexPrice,
          markPrice: deriSymbolScaleIn(symbolInfo.symbol, markPrice),
          indexPriceChange: bg(symbolInfo.indexPrice).eq(0)
            ? "0"
            : bg(indexPrice)
                .minus(symbolInfo.curIndexPrice)
                .div(symbolInfo.curIndexPrice).toString(),
          markPriceChange: bg(symbolInfo.markPrice).eq(0)
            ? "0"
            : bg(markPrice)
                .minus(symbolInfo.markPrice)
                .div(symbolInfo.markPrice).toString(),
        };
      })
    } else if (isOptionSymbol(symbolInfo)) {
      return indexPriceList.map((indexPrice, index) => {
        const intrinsicValue = getIntrinsicPrice(
          indexPrice,
          symbolInfo.strikePrice,
          symbolInfo.isCall
        );
        const [timeValue, delta, u] = getEverlastingTimePriceAndDelta(
          indexPrice,
          symbolInfo.strikePrice,
          symbolInfo.curVolatility,
          bg(symbolInfo.fundingPeriod).div(31536000)
        );
        const K = calculateK2(indexPrice, bg(intrinsicValue).plus(timeValue), delta, symbolInfo.alpha, liquidity)
        const markPrice = indexPrice === symbolInfo.curIndexPrice ? symbolInfo.markPrice :calculateDpmmPrice(
          bg(intrinsicValue).plus(timeValue),
          K,
          symbolInfo.netVolume
        ).toString();
        return {
          indexPrice,
          markPrice,
          indexPriceChange: bg(symbolInfo.indexPrice).eq(0)
            ? "0"
            : bg(indexPrice)
                .minus(symbolInfo.curIndexPrice)
                .div(symbolInfo.curIndexPrice).toString(),
          markPriceChange: bg(symbolInfo.markPrice).eq(0)
            ? "0"
            : bg(markPrice)
                .minus(symbolInfo.markPrice)
                .div(symbolInfo.markPrice).toString(),
        };
      })
    } else {
      return indexPriceList.map((indexPrice) => {
        const K = calculateK(indexPrice, liquidity, symbolInfo.alpha);
        const markPrice = indexPrice === symbolInfo.curIndexPrice ? symbolInfo.markPrice : calculateDpmmPrice(
          indexPrice,
          K,
          symbolInfo.netVolume
        ).toString();
        return {
          indexPrice,
          markPrice,
          indexPriceChange: bg(symbolInfo.curIndexPrice).eq(0)
            ? "0"
            : bg(indexPrice)
                .minus(symbolInfo.curIndexPrice)
                .div(symbolInfo.curIndexPrice).toString(),
          markPriceChange: bg(symbolInfo.markPrice).eq(0)
            ? "0"
            : bg(markPrice)
                .minus(symbolInfo.markPrice)
                .div(symbolInfo.markPrice).toString(),
        };
      });
    }
  }

  async getMarginInfo(accountAddress) {
    const pool = this.pool;
    await pool.getSymbols();
    await pool.getPositions(accountAddress);

    const positions = pool.symbols.map((b) => {
      const position = pool.positions.find((p) => p.symbol === b.symbol);
      if (position) {
        return { ...b, ...position };
      } else {
        return {
          ...b,
          volume: "0",
          cost: "0",
          cumulativeFundingPerVolume: "0",
          traderPnl: "0",
          dpmmTraderPnl: "0",
          fundingAccrued: "0",
          initialMarginRequired: "0",
        };
      }
    });

    const margin = pool.account.margin
    const unrealizedPnl = positions
      .reduce((acc, p) => bg(acc).plus(p.traderPnl), bg(0))
      .toString()
    const fundingFee= positions
        .reduce((acc, p) => bg(acc).plus(p.fundingAccrued), bg(0))
        .toString()
    return {
      chainId: pool.chainId,
      poolAddress: pool.contractAddress,
      margin,
      dynamicEffectiveBalance: bg(margin).plus(unrealizedPnl).minus(fundingFee).toString(),
    };
  }
}

export const poolApiFactory = contractFactory(PoolApi);
