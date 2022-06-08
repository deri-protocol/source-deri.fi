import { contractFactory } from "../../activity/utils"
import { bg, max, min } from "../../shared"
import { SECONDS_IN_A_DAY } from "../../shared/config";
import { getIndexInfo } from "../../shared/config/token"
import { checkSymbolId, getLiquidity } from "../../shared/utils/derijsnext"
import {
  calculateLiquidationPrice,
  calculateMaxRemovableLiquidity,
} from '../../v2/calculation';
import { perpetualPoolDpmmFactory } from './factory';
import { getOraclePriceFromCache2 } from '../../shared/utils/oracle';
import { calculateDpmmPrice } from "../../v2_lite_dpmm/calc";
import { ERC20Factory } from "../../shared/contract/factory";
import { liquidatePriceCache } from "../../shared/api/api_globals";

// PoolApi 
export class PoolApi {
  constructor(chainId, poolAddress) {
    this.chainId = chainId;
    this.poolAddress = poolAddress;
    this.pool = perpetualPoolDpmmFactory(chainId, poolAddress);
  }

  async init(usedByEstimatedApi) {
    await this.pool.init(usedByEstimatedApi);
  }

  // API
  async getLiquidityInfo(accountAddress, bTokenId) {
    const pool = this.pool;
    const [lTokenAsset, bTokens, symbols] = await Promise.all([
      pool.lToken.getAsset(accountAddress, bTokenId),
      pool.getBTokens(),
      pool.getSymbols(),
    ]);
    const { minPoolMarginRatio } = pool.parameters;
    const bTokenIndex = pool.bTokenIds.indexOf(bTokenId.toString());
    const { liquidity: poolLiquidity } = bTokens[bTokenIndex];
    const { liquidity, pnl, lastCumulativePnl } = lTokenAsset;
    const cost = symbols.reduce((acc, s) => acc.plus(s.notional), bg(0));
    const totalPnl = symbols.reduce((acc, s) => acc.plus(s.pnl), bg(0));

    const restLiquidity = bTokens.reduce((accum, b, index) => {
      if (index === parseInt(bTokenId)) {
        return accum.plus(b.pnl);
      } else {
        return accum.plus(
          bg(b.liquidity).times(b.price).times(b.discount).plus(b.pnl)
        );
      }
    }, bg(0));
    const maxRemovableShares = calculateMaxRemovableLiquidity(
      bTokens[bTokenIndex],
      liquidity,
      cost,
      totalPnl,
      restLiquidity,
      minPoolMarginRatio
    ).toString();
    const approximatePnl = bg(pnl)
      .plus(
        bg(bTokens[bTokenIndex].cumulativePnl)
          .minus(lastCumulativePnl)
          .times(liquidity)
      )
      .toString();

    return {
      poolLiquidity,
      shares: liquidity,
      maxRemovableShares,
      pnl: approximatePnl,
      bToken0Symbol: pool.bTokenSymbols[0],
      swappedPnl: !!bTokens[bTokenIndex].price ? bg(approximatePnl).div(bTokens[bTokenIndex].price).toString() : '',
    };
  }

  async getSpecification(symbolId) {
    await this.init();
    const pool = this.pool
    const {
      minPoolMarginRatio,
      initialMarginRatio,
      liquidationCutRatio,
      protocolFeeCollectRatio,
      minLiquidationReward,
      maxLiquidationReward,
      maintenanceMarginRatio,
      minBToken0Ratio,
    } = pool.parameters;
    const symbolIndex = checkSymbolId(symbolId, pool.activeSymbolIds);
    const symbolInfo = pool.symbols[symbolIndex];

    const { symbol, multiplier, feeRatio } = symbolInfo;

    return {
      symbol,
      bTokenSymbol: pool.bTokenSymbols,
      bTokenMultiplier: pool.bTokens.map((b) => b.discount),
      multiplier,
      feeRatio,
      fundingRateCoefficient: bg(1).div(pool.fundingPeriod).toString(),
      minPoolMarginRatio,
      minInitialMarginRatio: initialMarginRatio,
      minMaintenanceMarginRatio: maintenanceMarginRatio,
      minLiquidationReward,
      maxLiquidationReward,
      liquidationCutRatio,
      protocolFeeCollectRatio,
      indexConstituents: getIndexInfo(symbol),
    };
  }

  async getPositionInfo(accountAddress, symbolId) {
    const pool = this.pool;
    const { initialMarginRatio, maintenanceMarginRatio } = pool.parameters;
    const symbolIndex = checkSymbolId(symbolId, pool.activeSymbolIds);
    const oracleAddress =
      pool.offChainOracleSymbolIds.indexOf(symbolId) > -1
        ? ''
        : pool.symbols[symbolIndex].oracleAddress;
    const [
      bTokens,
      symbols,
      lastTimestamp,
      margins,
      price,
    ] = await Promise.all([
      pool.getBTokens(),
      pool.getSymbols(),
      pool.getLastTimestamp(),
      pool.pToken.getMargins(accountAddress),
      getOraclePriceFromCache2.get(
        this.chainId,
        pool.symbols[symbolIndex].symbol,
        oracleAddress
      ),
    ]);
    const positions = await pool.getPositions(accountAddress)

    const symbol = symbols[symbolIndex];
    const position = positions[symbolIndex];
    // const { volume } = position
    // const { multiplier, indexPrice } = symbol
    const margin = bTokens
      .reduce(
        (acc, b, index) =>
          acc.plus(bg(b.price).times(b.discount).times(margins[index])),
        bg(0)
      )
      .toString();
    const marginHeld = symbols.reduce((acc, s, index) => {
      return acc.plus(
        bg(s.indexPrice)
          .times(s.multiplier)
          .times(positions[index].volume)
          .times(initialMarginRatio)
          .abs()
      );
    }, bg(0));
    const marginHeldBySymbol = bg(position.volume)
      .times(symbol.multiplier)
      .times(symbol.indexPrice)
      .times(initialMarginRatio)
      .abs();

    const unrealizedPnl = positions.reduce(
      (acc, p) => acc.plus(p.traderPnl),
      bg(0)
    );
    const unrealizedPnlList = symbols.map((s, index) => {
      return [s.symbol, positions[index].traderPnl];
    });
    const totalCost = positions.reduce((acc, p) => acc.plus(p.cost), bg(0));
    const dynamicCost = symbols.reduce((acc, s, index) => {
      if (index !== parseInt(symbolId)) {
        return acc.plus(
          bg(positions[index].volume).times(s.dpmmPrice).times(s.multiplier)
        );
      } else {
        return acc;
      }
    }, bg(0));
    const fundingFee = bg(symbol.cumulativeFundingRate)
      .minus(position.lastCumulativeFundingRate)
      .plus(
        bg(symbol.dpmmPrice)
          .minus(symbol.indexPrice)
          .times(symbol.multiplier)
          .div(pool.fundingPeriod)
          .times(bg(Math.floor(Date.now() / 1000)).minus(lastTimestamp))
      )
      .times(position.volume)
      .toString();

    // set liquidatePrice cache
    liquidatePriceCache.set(this.poolAddress, {
      volume: position.volume,
      margin,
      totalCost,
      dynamicCost,
      price,
      multiplier: symbol.multiplier,
      minMaintenanceMarginRatio: maintenanceMarginRatio,
    });

    return {
      symbol: symbol.symbol,
      price: price,
      markPrice: symbol.dpmmPrice.toString(),
      volume: bg(position.volume).times(symbol.multiplier).toString(),
      averageEntryPrice: bg(position.volume).eq(0)
        ? '0'
        : bg(position.cost)
            .div(position.volume)
            .div(symbol.multiplier)
            .toString(),
      margin: margin,
      marginHeld: marginHeld.toString(),
      marginHeldBySymbol: marginHeldBySymbol.toString(),
      unrealizedPnl: unrealizedPnl.toString(),
      unrealizedPnlList,
      fundingFee,
      liquidationPrice: calculateLiquidationPrice(
        position.volume,
        margin,
        totalCost,
        dynamicCost,
        symbol.multiplier,
        maintenanceMarginRatio
      ).toString(),
    };
  }

  async getPositionInfos(accountAddress) {
    const pool = this.pool;
    const { initialMarginRatio, maintenanceMarginRatio } = pool.parameters;
    const [
      bTokens,
      symbols,
      lastTimestamp,
      margins,
    ] = await Promise.all([
      pool.getBTokens(),
      pool.getSymbols(),
      //pool.getPositions(accountAddress),
      pool.getLastTimestamp(),
      pool.pToken.getMargins(accountAddress),
    ]);
    const positions = await pool.getPositions(accountAddress)

    const totalCost = positions.reduce((acc, p) => acc.plus(p.cost), bg(0));

    return positions
      .map((p, index) => {
        const symbolIndex = index;
        const symbol = symbols[symbolIndex];
        const position = positions[symbolIndex];
        const margin = bTokens
          .reduce(
            (acc, b, index) =>
              acc.plus(bg(b.price).times(b.discount).times(margins[index])),
            bg(0)
          )
          .toString();
        const marginHeld = symbols.reduce((acc, s, index) => {
          return acc.plus(
            bg(s.indexPrice)
              .times(s.multiplier)
              .times(positions[index].volume)
              .times(initialMarginRatio)
              .abs()
          );
        }, bg(0));
        const marginHeldBySymbol = bg(position.volume)
          .times(symbol.multiplier)
          .times(symbol.indexPrice)
          .times(initialMarginRatio)
          .abs();
        const unrealizedPnl = p.traderPnl
        const dynamicCost = symbols.reduce((acc, s, idx) => {
          if (idx !== index) {
            return acc.plus(
              bg(positions[idx].volume).times(s.dpmmPrice).times(s.multiplier)
            );
          } else {
            return acc;
          }
        }, bg(0));
        const fundingFee = bg(symbol.cumulativeFundingRate)
          .minus(position.lastCumulativeFundingRate)
          .plus(
            bg(symbol.dpmmPrice)
              .minus(symbol.indexPrice)
              .times(symbol.multiplier)
              .div(pool.fundingPeriod)
              .times(bg(Math.floor(Date.now() / 1000)).minus(lastTimestamp))
          )
          .times(position.volume)
          .toString();
        return {
          symbolId: symbolIndex.toString(),
          symbol: symbol.symbol,
          price: symbol.indexPrice,
          volume: bg(position.volume).times(symbol.multiplier).toString(),
          averageEntryPrice: bg(position.volume).eq(0)
            ? '0'
            : bg(position.cost)
                .div(position.volume)
                .div(symbol.multiplier)
                .toString(),
          margin: margin,
          marginHeld: marginHeld.toString(),
          marginHeldBySymbol: marginHeldBySymbol.toString(),
          unrealizedPnl: unrealizedPnl.toString(),
          fundingFee,
          liquidationPrice: calculateLiquidationPrice(
            position.volume,
            margin,
            totalCost,
            dynamicCost,
            symbol.multiplier,
            maintenanceMarginRatio
          ).toString(),
        };
      })
      .filter((p) => p.volume !== '0');
  }

  async getEstimatedMargin(accountAddress, volume, leverage, symbolId) {
    const pool = this.pool;
    if (!pool.isSymbolsUpdated()) {
      await pool.getSymbols();
    }
    const symbolIndex = checkSymbolId(symbolId, pool.activeSymbolIds);
    const { multiplier, indexPrice } = pool.symbols[symbolIndex];
    return bg(volume)
      .abs()
      .times(multiplier)
      .times(indexPrice)
      .div(leverage)
      .toString();
  }

  async getEstimatedFee(volume, symbolId) {
    const pool = this.pool;
    if (!pool.isSymbolsUpdated()) {
      await pool.getSymbols();
    }
    const symbolIndex = checkSymbolId(symbolId, pool.activeSymbolIds);
    const { multiplier, indexPrice, feeRatio } = pool.symbols[symbolIndex];
    return bg(volume)
      .abs()
      .times(multiplier)
      .times(indexPrice)
      .times(feeRatio)
      .toString();
  }

  async getFundingRate(symbolId) {
    await this.init()
    const pool = this.pool
    if (!pool.isSymbolsUpdated()) {
      await pool.getSymbols();
    }
    const symbolIndex = checkSymbolId(symbolId, pool.activeSymbolIds);
    const {funding, fundingPerSecond, tradersNetVolume, multiplier } = pool.symbols[symbolIndex]
    const liquidity = pool.state.liquidity
    return {
      funding0: bg(funding).div(multiplier).toString(),
      fundingPerSecond: bg(fundingPerSecond).div(multiplier).toString(),
      liquidity: liquidity,
      volume: '-',
      tradersNetVolume: bg(tradersNetVolume).times(multiplier).toString(),
    };
  }


  async getEstimatedFundingRate(newVolume, symbolId) {
    const pool = this.pool
    if (!pool.isSymbolsUpdated()) {
      await pool.getSymbols();
    }
    const symbolIndex = checkSymbolId(symbolId, pool.activeSymbolIds);
    const symbol = { ...pool.symbols[symbolIndex] };
    symbol.dpmmPrice = calculateDpmmPrice(
      symbol.indexPrice,
      symbol.K,
      bg(symbol.tradersNetVolume).plus(newVolume).toString(),
      symbol.multiplier
    ).toString();
    symbol.fundingPerSecond = bg(symbol.dpmmPrice)
      .minus(symbol.indexPrice)
      //.times(symbol.multiplier)
      .div(pool.fundingPeriod)
      .toString();
    return {
      funding1: bg(symbol.fundingPerSecond).times(SECONDS_IN_A_DAY).toString(),
    };
  }

  async getLiquidityUsed() {
    const pool = this.pool;
    if (!pool.isSymbolsUpdated()) {
      await pool.getSymbols();
    }
    const { minPoolMarginRatio } = pool.parameters;
    return pool.symbols
      .reduce(
        (acc, s) =>
          acc.plus(
            bg(s.tradersNetVolume)
              .abs()
              .times(s.indexPrice)
              .times(s.multiplier)
              .times(minPoolMarginRatio)
          ),
        bg(0)
      )
      .div(pool.state.liquidity)
      .toString();
  }

  async getEstimatedLiquidityUsed(newVolume, symbolId) {
    const pool = this.pool;
    if (!pool.isSymbolsUpdated()) {
      await pool.getSymbols();
    }

    const { minPoolMarginRatio } = pool.parameters;
    const symbolIndex = checkSymbolId(symbolId, pool.activeSymbolIds);
    //console.log(pool.symbols, poolMarginRatio, pool.stateValues)
    return pool.symbols
      .reduce(
        (acc, s, index) =>
          index === symbolIndex
            ? acc.plus(
                bg(s.tradersNetVolume)
                  .plus(newVolume)
                  .abs()
                  .times(s.indexPrice)
                  .times(s.multiplier)
                  .times(minPoolMarginRatio)
              )
            : acc.plus(
                bg(s.tradersNetVolume)
                  .abs()
                  .times(s.indexPrice)
                  .times(s.multiplier)
                  .times(minPoolMarginRatio)
              ),
        bg(0)
      )
      .div(pool.state.liquidity)
      .toString();
  }

  async getPoolBTokensBySymbolId(accountAddress, symbolId) {
    const pool = this.pool;
    if (!pool.isSymbolsUpdated()) {
      await pool.getSymbols();
    }
    if (!pool.isPositionsUpdated()) {
      await pool.getPositions(accountAddress);
    }
    const { initialMarginRatio } = pool.parameters
    const margins = await pool.pToken.getMargins(accountAddress);
    const balances = await Promise.all(
      pool.bTokens.reduce(
        (acc, i) => [
          ...acc,
          ERC20Factory(this.chainId, i.bTokenAddress).balanceOf(accountAddress),
        ],
        []
      )
    );

    const margin = pool.bTokens.reduce((accum, a, index) => {
      return accum.plus(bg(a.price).times(a.discount).times(margins[index]))
    }, bg(0)).toString()
    const marginHeld = pool.symbols.reduce((acc, s, index) => {
      return acc.plus(
        bg(s.indexPrice)
          .times(s.multiplier)
          .times(pool.positions[index].volume)
          .times(initialMarginRatio)
          .abs()
      );
    }, bg(0)).toString();
    const pnl = pool.positions.reduce((acc, p) => acc.plus(p.traderPnl), bg(0)).toString();

    for (let i = 0; i < pool.bTokenIds.length; i++) {
      const bToken = pool.bTokens[i]
      bToken.walletBalance = balances[i]
      bToken.availableBalance = max(
        min(
          bg(margin)
            .minus(marginHeld)
            .plus(pnl)
            .div(pool.bTokens[i].price)
            .div(pool.bTokens[i].discount),
          bg(margins[i])
        ),
        bg(0)
      ).toString();
    }
    return pool.bTokens.map((b, index) => {
      return {
        bTokenId: index.toString(),
        bTokenAddress: b.bTokenAddress,
        bTokenSymbol: pool.bTokenSymbols[index],
        availableBalance: b.availableBalance,
        walletBalance: b.walletBalance,
      }
    })
  }

  async getFundingFee(accountAddress, symbolId) {
    const pool = this.pool;
    if (!pool.isSymbolsUpdated()) {
      await pool.getSymbols();
    }
    if (!pool.isPositionsUpdated()) {
      await pool.getPositions(accountAddress);
    }
    const symbolIndex = checkSymbolId(symbolId, pool.activeSymbolIds);
    return pool.positions[symbolIndex].fundingAccrued;
  }
}




export const poolApiFactory = contractFactory(PoolApi);