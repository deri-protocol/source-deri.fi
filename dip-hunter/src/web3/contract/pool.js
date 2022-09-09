import { throws } from "assert"
import { getDeriLensAddress} from "../config"
import { bg, max } from "../utils/bignumber"
import { isArbiChain, isBSCChain } from "../utils/chain"
import { SECONDS_IN_A_DAY } from "../utils/config"
import { ZERO_ADDRESS } from "../utils/constant"
import { getLensPropAlias } from "../utils/deri_lens"
import { debug, DeriEnv, Env } from "../utils/env"
import { contractFactory } from "../utils/factory"
import { getSymbolsOracleInfoForLens } from "../utils/oracle"
import { isOptionSymbol, isPowerSymbol, normalizeBNB, tokenToName } from "../utils/symbol"
import { deriLensFactoryProxy, ERC20Factory, symbolManagerImplementationFactory } from "./factory"
import { calculateDpmmCost, getInitialMarginRequired, getIntrinsicPrice } from "./symbol/shared"

const interval = 2000
export class Pool {
  constructor(chainId, poolAddress) {
    this.chainId = chainId
    this.poolAddress = poolAddress
    this.deriLensAddress = getDeriLensAddress(chainId)
    this.deriLens = deriLensFactoryProxy(chainId, this.deriLensAddress)
  }
  async init(accountAddress = ZERO_ADDRESS) {
    if (accountAddress !== ZERO_ADDRESS && (Date.now() - this._update_timestamp) < interval) {
      return { pool: this.poolAddress, account: this[accountAddress], symbols: this.symbols, bTokens: this.bTokens }
    }
    if (!this.symbolNames) {
      const symbols = await this.deriLens.getSymbolsInfo(this.poolAddress);
      this.symbolNames = symbols.map((s) => s.symbol)
    }
    const oracleSignatures = await getSymbolsOracleInfoForLens(this.chainId, this.symbolNames)
    debug() && console.log(`--- oracleSignatures: ${oracleSignatures}`)
    const info = await this.deriLens.getInfo(this.poolAddress, accountAddress, oracleSignatures);
    const { poolInfo, marketsInfo, symbolsInfo } = info;
    if (!this.symbolManager) {
      this.symbolManager = symbolManagerImplementationFactory(
        this.chainId,
        poolInfo.symbolManager
      );
      // bTokens
      for (let i = 0; i < marketsInfo.length; i++) {
        const market = marketsInfo[i];
        this[tokenToName(normalizeBNB(this.chainId, getLensPropAlias('underlyingSymbol', market)))] = ERC20Factory(
          this.chainId, getLensPropAlias('underlying', market)
        );
      }
    }
    if (!this.bTokens) {
      this.bTokens = marketsInfo.map((m) => ({
        bTokenSymbol: normalizeBNB(this.chainId, getLensPropAlias('underlyingSymbol', m)),
        bTokenAddress: getLensPropAlias('underlying', m),
        vTokenAddress: getLensPropAlias('vToken', m),
        vTokenSymbol: getLensPropAlias('vTokenSymbol', m),
        bTokenPrice: getLensPropAlias('underlyingPrice', m),
        vTokenBalance: getLensPropAlias('vTokenBalance', m),
        exchangeRate: m.exchangeRate || '',
        collateralFactor: m.collateralFactor || '',
        // bTokenOrder: getBTokenOrder(this.chainId, normalizeBNB(this.chainId, getLensPropAlias('underlyingSymbol', m))),
      }));
      // update btoken decimals
      const decimals = await Promise.all(
        this.bTokens.map((b) =>
          this[tokenToName(normalizeBNB(this.chainId, b.bTokenSymbol))].decimals()
        )
      );
      // use as decimals cache
      this.bTokenDecimals = {}
      for (let i = 0; i < this.bTokens.length; i++) {
        this.bTokens[i].bTokenDecimals = decimals[i];
        if (decimals[i] !== '18') {
          this.bTokenDecimals[this.bTokens[i].bTokenAddress] = parseInt(decimals[i])
          if (isBSCChain(this.chainId)) {
            this.bTokens[i].bTokenPrice = bg(this.bTokens[i].bTokenPrice, parseInt(decimals[i]) - 18).toString()
          }
        }
      }
      // b0 must at index 0
      this.bTokenSymbols = this.bTokens.map((b) => b.bTokenSymbol);
      // filter out USDT
      if (DeriEnv.get() !== Env.PROD && isArbiChain(this.chainId)) {
        this.bTokens = this.bTokens.filter((b) => b.bTokenSymbol !== 'USDT')
      }
    }
    if (accountAddress !== ZERO_ADDRESS && !this[accountAddress]) {
      this[accountAddress] = {}
    }
    this._updateBTokens(marketsInfo)
    this._updateSymbols(symbolsInfo)
    if (accountAddress !== ZERO_ADDRESS) {
      const { lpInfo, tdInfo } = info;
      this._updateLpInfo(lpInfo, accountAddress)
      this._updateTdInfo(tdInfo, accountAddress)
      this._updateTimestamp()
      return { pool: this.poolAddress, account: this[accountAddress], symbols: this.symbols, bTokens: this.bTokens }
    } else {
      // default
      this[accountAddress] = this[accountAddress] || {}
      this[accountAddress].positions = this[accountAddress].positions || []
      this[accountAddress].margins = this[accountAddress].margins || []
      this[accountAddress].assets = this[accountAddress].assets || []
    }
    return { pool: this.poolAddress, symbols: this.symbols, bTokens: this.bTokens }
  }

  async getBTokens() {
    const marketsInfo = await this.deriLens.getMarketsInfo(this.poolAddress)
    this._updateBTokens(marketsInfo)
  }
  async getSymbols() {
    const oracleSignatures = await getSymbolsOracleInfoForLens(this.chainId, this.symbolNames)
    // debug() && console.log('-- oracleSignatures: ', oracleSignatures)
    const symbolsInfo = await this.deriLens.getSymbolsInfo(this.poolAddress, oracleSignatures || [])
    this._updateSymbols(symbolsInfo)
  }
  async getLpInfo(accountAddress) {
    const lpInfo = await this.deriLens.getLpInfo(this.poolAddress, accountAddress)
    this._updateLpInfo(lpInfo, accountAddress)
  }
  async getTdInfo(accountAddress) {
    const tdInfo = await this.deriLens.getTdInfo(this.poolAddress, accountAddress)
    this._updateTdInfo(tdInfo, accountAddress)
    this._updateTimestamp()
    return { account: this[accountAddress], pool: this.poolAddress }
  }
  getEstimatedFee(symbol, newVolume) {
    if (isOptionSymbol(symbol)) {
      // let fee;
      // if (bg(symbol.intrinsicValue).gt(0)) {
      //   fee = bg(newVolume)
      //     .abs()
      //     .times(symbol.curIndexPrice)
      //     .times(symbol.feeRatioITM)
      //     .toString();
      // } else {
      //   const cost = calculateDpmmCost(
      //     symbol.theoreticalPrice,
      //     symbol.K,
      //     symbol.netVolume,
      //     newVolume
      //   );
      //   fee = bg(cost).abs().times(symbol.feeRatioOTM).toString();
      // }
      const feeNotional = bg(symbol.curIndexPrice).times(symbol.feeRatioNotional).times(newVolume).abs()
      const cost = calculateDpmmCost(
        symbol.theoreticalPrice,
        symbol.K,
        symbol.netVolume,
        newVolume
      );
      const feeMark = bg(cost).times(symbol.feeRatioMark).abs()
      if (feeNotional.lt(feeMark)) {
        return feeNotional.toString()
      } else {
        return feeMark.toString()
      }
    } else if (isPowerSymbol(symbol)) {
      const cost = calculateDpmmCost(
        symbol.theoreticalPrice,
        symbol.K,
        symbol.netVolume,
        newVolume
      );
      return bg(cost).abs().times(symbol.feeRatio).toString();
    } else {
      const { curIndexPrice, feeRatio } = symbol;
      const res = bg(newVolume).abs().times(curIndexPrice).times(feeRatio).toString();
      return res
    }
  }
  getEstimatedCost(symbol, newVolume) {
    if (isOptionSymbol(symbol) || isPowerSymbol(symbol)) {
      return calculateDpmmCost(
        symbol.theoreticalPrice,
        symbol.K,
        symbol.netVolume,
        newVolume
      )
    } else {
      return calculateDpmmCost(
        symbol.curIndexPrice,
        symbol.K,
        symbol.netVolume,
        newVolume
      )
    }
  }
  getEstimatedPnl(symbol, newVolume) {
    const price = (isPowerSymbol(symbol) || isOptionSymbol(symbol)) ? symbol.theoreticalPrice : symbol.curIndexPrice
    return bg(price).times(newVolume).minus(this.getEstimatedCost(symbol, newVolume))
  }
  getEstimatedMarginHeld(symbol, newVolume) {
    return bg(newVolume).abs().times(symbol.initialMarginPerVolume)
  }

  async updateState(accountAddress = ZERO_ADDRESS) {
    if (accountAddress !== ZERO_ADDRESS) {
      await Promise.all([
        this.getSymbols(),
        this.getTdInfo(accountAddress),
      ])
      this._updateTimestamp()
    } else {
      await this.getSymbols()
    }
  }

  // internal method
  _updateTimestamp(){
    this.update_timestamp = Date.now()
  }
  async _updateBTokens(marketsInfo) {
    this.bTokenDecimals = this.bTokenDecimals || {}
    if (this.bTokens && this.bTokens.length > 0) {
      this.bTokens = this.bTokens.reduce((acc, b) => {
        const market = marketsInfo.find((m) => normalizeBNB(this.chainId, getLensPropAlias('underlyingSymbol', m)) === b.bTokenSymbol)
        if (market) {
          acc.push({
            ...b,
            bTokenPrice: this.bTokenDecimals[b.bTokenAddress] && isBSCChain(this.chainId)
              ? bg(
                getLensPropAlias('underlyingPrice', market),
                this.bTokenDecimals[b.bTokenAddress] - 18
              ).toString()
              : getLensPropAlias('underlyingPrice', market),
            vTokenBalance: getLensPropAlias('vTokenBalance', market),
            exchangeRate: market.exchangeRate || '',
          })
        } else {
          acc.push(b)
        }
        return acc
      }, []);
    }
  }

  _updateSymbols(symbolsInfo) {
    if (this.symbols && this.symbols.length > 0) {
      this.symbols = this.symbols.reduce((acc, symbol) => {
        const s = symbolsInfo.find((si) => si.symbol === symbol.symbol)
        if (s) {
          const res = {
            ...symbol,
            K: s.K,
            cumulativeFundingPerVolume: s.cumulativeFundingPerVolume,
            curCumulativeFundingPerVolume: s.curCumulativeFundingPerVolume,
            curIndexPrice: s.curIndexPrice,
            curVolatility: s.curVolatility,
            delta: s.delta,
            funding: s.funding,
            fundingTimestamp: s.fundingTimestamp,
            indexPrice: s.indexPrice,
            initialMarginRequired: s.initialMarginRequired,
            markPrice: s.markPrice,
            nPositionHolders: s.nPositionHolders,
            netCost: s.netCost,
            netVolume: s.netVolume,
            timeValue: s.timeValue,
            tradersPnl: s.tradersPnl,
            u: s.u,
            power: s.power || "",
            hT: s.hT || "",
            powerPrice: s.powerPrice || "",
          }
          if (s.category === 'power') {
            res.theoreticalPrice = s.theoreticalPrice
          }
          acc.push(res)
        } else {
          acc.push(symbol)
        }
        return acc
      }, [])
    } else {
      this.symbols = symbolsInfo.map((s) => ({
        alpha: s.alpha,
        category: s.category,
        K: s.K,
        cumulativeFundingPerVolume: s.cumulativeFundingPerVolume,
        curCumulativeFundingPerVolume: s.curCumulativeFundingPerVolume,
        curIndexPrice: s.curIndexPrice,
        curVolatility: s.curVolatility,
        delta: s.delta,
        feeRatio: s.feeRatio,
        // feeRatioITM: s.feeRatioITM,
        // feeRatioOTM: s.feeRatioOTM,
        feeRatioNotional: s.feeRatioNotional,
        feeRatioMark: s.feeRatioMark,
        funding: s.funding,
        fundingPeriod: s.fundingPeriod,
        fundingTimestamp: s.fundingTimestamp,
        implementation: s.implementation,
        indexPrice: s.indexPrice,
        initialMarginRatio: s.initialMarginRatio,
        minInitialMarginRatio: s.minInitialMarginRatio,
        initialMarginRequired: s.initialMarginRequired,
        isCall: s.isCall,
        isCloseOnly: s.isCloseOnly,
        maintenanceMarginRatio: s.maintenanceMarginRatio,
        manager: s.manager,
        markPrice: s.markPrice,
        minTradeVolume: s.minTradeVolume,
        nPositionHolders: s.nPositionHolders,
        netCost: s.netCost,
        netVolume: s.netVolume,
        oracleManager: s.oracleManager,
        priceId: s.priceId,
        pricePercentThreshold: s.pricePercentThreshold,
        strikePrice: s.strikePrice,
        symbol: s.symbol,
        symbolAddress: s.symbolAddress,
        symbolId: s.symbolId,
        timeThreshold: s.timeThreshold,
        timeValue: s.timeValue,
        tradersPnl: s.tradersPnl,
        u: s.u,
        volatilityId: s.volatilityId,
        power: s.power || "",
        hT: s.hT || "",
        powerPrice: s.powerPrice || "",
        theoreticalPrice: s.category === 'power' ? s.theoreticalPrice : "",
      }));
    }
    this.symbols = this.symbols.map((s) => {
      //s.curTimestamp = Math.floor(Date.now()/1000)
      if (isOptionSymbol(s)) {
        s.intrinsicValue = getIntrinsicPrice(
          s.curIndexPrice,
          s.strikePrice,
          s.isCall
        );
        s.theoreticalPrice = bg(s.intrinsicValue)
          .plus(s.timeValue)
          .toString();
        s.fundingPerSecond = bg(s.fundingPeriod).eq(0)
          ? "0"
          : bg(s.markPrice)
            .minus(s.intrinsicValue)
            .div(s.fundingPeriod)
            .toString();
        s.initialMarginPerVolume = max(
          bg(getInitialMarginRequired(s)).times(
            bg(s.initialMarginRatio).div(s.maintenanceMarginRatio)
          ),
          bg(s.curIndexPrice).times(s.minInitialMarginRatio)
        ).abs().toString();
        s.maintenanceMarginPerVolume = getInitialMarginRequired(s).toString();
        //console.log(s.theoreticalPrice, s.K, s.netVolume, s.netCost)
        s.curTradersPnl = calculateDpmmCost(
          s.theoreticalPrice,
          s.K,
          s.netVolume,
          bg(s.netVolume).negated()
        )
          .negated()
          .minus(s.netCost)
          .toString();
      } else if (isPowerSymbol(s)) {
        // s.oneHT = bg(1).minus(
        //   bg(s.curVolatility)
        //     .times(s.curVolatility)
        //     .times(s.power)
        //     .times(bg(s.power).minus(1))
        //     .div(2)
        //     .times(s.fundingPeriod)
        //     .div(31536000)
        // ).toString()
        // s.powerPrice = bg(s.curIndexPrice).times(s.curIndexPrice).toString()
        // s.theoreticalPrice = bg(s.powerPrice).div(s.oneHT).toString()
        s.oneHT = bg(1).minus(s.hT).toString()
        s.fundingPerSecond = bg(s.fundingPeriod).eq(0)
          ? "0"
          : bg(s.markPrice)
            .minus(s.powerPrice)
            .div(s.fundingPeriod)
            .toString();
        s.curTradersPnl = calculateDpmmCost(
          s.theoreticalPrice,
          s.K,
          s.netVolume,
          bg(s.netVolume).negated()
        )
          .negated()
          .minus(s.netCost)
          .toString();
        s.maintenanceMarginPerVolume = bg(s.theoreticalPrice).times(s.maintenanceMarginRatio).toString()
        s.initialMarginPerVolume = bg(s.maintenanceMarginPerVolume)
          .times(s.initialMarginRatio)
          .div(s.maintenanceMarginRatio)
          .toString();
      } else {
        s.fundingPerSecond = bg(s.fundingPeriod).eq(0)
          ? "0"
          : bg(s.markPrice)
            .minus(s.curIndexPrice)
            .div(s.fundingPeriod)
            .toString();
        s.initialMarginPerVolume = bg(s.curIndexPrice)
          .times(s.initialMarginRatio)
          .toString();
        s.maintenanceMarginPerVolume = bg(s.initialMarginPerVolume)
          .times(s.maintenanceMarginRatio).div(s.initialMarginRatio)
          .toString();
        s.curTradersPnl = calculateDpmmCost(
          s.curIndexPrice,
          s.K,
          s.netVolume,
          bg(s.netVolume).negated()
        )
          .negated()
          .minus(s.netCost)
          .toString();
      }
      s.fundingPerDay = bg(s.fundingPerSecond)
        .times(SECONDS_IN_A_DAY)
        .toString();
      return s;
    });
    return this.symbols
  }
  _updateLpInfo(lpInfo, accountAddress) {
    this[accountAddress] = this[accountAddress] || {}
    if (lpInfo.lTokenId !== '0') {
      this[accountAddress].lTokenId = lpInfo.lTokenId;
      this[accountAddress].lpVault = lpInfo.vault;
    }
    if (lpInfo.markets.length > 0) {
      this.assets = lpInfo.markets.map((m) => ({
        bTokenAddress: getLensPropAlias('underlying', m),
        vTokenAddress: getLensPropAlias('vToken', m),
        bTokenSymbol: normalizeBNB(this.chainId, getLensPropAlias('underlyingSymbol', m)),
        vTokenSymbol: getLensPropAlias('vTokenSymbol', m),
        bTokenPrice: this.bTokens.find((b) => b.bTokenSymbol === normalizeBNB(this.chainId, getLensPropAlias('underlyingSymbol', m))).bTokenPrice,
        exchangeRate: m.exchangeRate || '',
        vTokenBalance: getLensPropAlias('vTokenBalance', m),
      }));
      for (let asset of this.assets) {
        asset.vaultBalance = (!asset.exchangeRate)
          ? asset.vTokenBalance
          : this.bTokenDecimals[asset.bTokenAddress]   // fix non-18 decimal bToken issue
            ? bg(
              bg(asset.vTokenBalance).times(asset.exchangeRate),
              18 - this.bTokenDecimals[asset.bTokenAddress]
            ).toString()
            : bg(asset.vTokenBalance).times(asset.exchangeRate).toString();
      }
    } else {
      this.assets = []
    }
  }
  _updateTdInfo(tdInfo, accountAddress) {
    this[accountAddress] = this[accountAddress] || {}
    if (tdInfo.pTokenId !== '0') {
      this[accountAddress].pTokenId = tdInfo.pTokenId;
      this[accountAddress].tdVault = tdInfo.vault;
    }
    if (tdInfo.markets.length > 0) {
      this.margins = tdInfo.markets.map((m) => ({
        bTokenAddress: getLensPropAlias('underlying', m),
        vTokenAddress: getLensPropAlias('vToken', m),
        bTokenSymbol: normalizeBNB(this.chainId, getLensPropAlias('underlyingSymbol', m)),
        vTokenSymbol: getLensPropAlias('vTokenSymbol', m),
        bTokenPrice: this.bTokens.find((b) => b.bTokenSymbol === normalizeBNB(this.chainId, getLensPropAlias('underlyingSymbol', m))).bTokenPrice,
        exchangeRate: m.exchangeRate || '',
        vTokenBalance: getLensPropAlias('vTokenBalance', m),
      }));
      for (let margin of this.margins) {
        margin.vaultBalance = (!margin.exchangeRate)
          ? margin.vTokenBalance
          : this.bTokenDecimals[margin.bTokenAddress]   // fix non-18 decimal bToken issue
            ? bg(
              bg(margin.vTokenBalance).times(margin.exchangeRate),
              18 - this.bTokenDecimals[margin.bTokenAddress]
            ).toString()
            : bg(margin.vTokenBalance).times(margin.exchangeRate).toString();
      }
    } else {
      this.margins = []
    }
    if (tdInfo.positions.length > 0) {
      this[accountAddress].positions = tdInfo.positions;
    } else {
      this[accountAddress].positions = []
    }
    //this.account.xvsBalance = await this.xvsToken.balanceOf(accountAddress)
    this[accountAddress].margin =
      !this[accountAddress].pTokenId
        ? "0"
        : bg(tdInfo.amountB0).plus(tdInfo.vaultLiquidity).toString();
    this._updatePositions(accountAddress)
  }
  _updatePositions(accountAddress) {
    let fundingAccrued = '0',
      initialMargin = '0',
      maintenanceMargin = '0',
      traderPnl = '0',
      dpmmTraderPnl = '0',
      res = [];
    if (Array.isArray(this[accountAddress].positions) && this[accountAddress].positions.length > 0) {
      this[accountAddress].positions = this[accountAddress].positions.map((p) => {
        const symbol = this.symbols.find((s) => p.symbol === s.symbol);
        // console.log(symbol.symbol)
        if (symbol) {
          p.fundingAccrued = bg(p.volume)
            .times(
              bg(symbol.curCumulativeFundingPerVolume)
                //.plus(diff)
                .minus(p.cumulativeFundingPerVolume)
            )
            .toString();
          if (isOptionSymbol(symbol)) {
            const res = getInitialMarginRequired(symbol)
            p.initialMarginRequired = max(
              bg(res)
                .times(
                  bg(symbol.initialMarginRatio).div(
                    symbol.maintenanceMarginRatio
                  )
                )
                .abs(),
              bg(symbol.curIndexPrice).times(symbol.minInitialMarginRatio)
            ).times(p.volume).abs().toString();
            p.maintenanceMarginRequired = bg(symbol.maintenanceMarginPerVolume).times(p.volume).toString();
            p.traderPnl = bg(symbol.theoreticalPrice).times(p.volume).minus(p.cost).toString();
            p.dpmmTraderPnl = calculateDpmmCost(
              symbol.theoreticalPrice,
              symbol.K,
              symbol.netVolume,
              bg(p.volume).negated()
            )
              .negated()
              .minus(p.cost)
              .toString();
          } else if (isPowerSymbol(symbol)) {
            p.maintenanceMarginRequired = bg(p.volume)
              .abs()
              .times(symbol.maintenanceMarginPerVolume).toString();
            p.initialMarginRequired = bg(p.volume)
              .abs()
              .times(symbol.initialMarginPerVolume).toString();
            p.traderPnl = bg(symbol.theoreticalPrice).times(p.volume).minus(p.cost).toString();
            p.dpmmTraderPnl = calculateDpmmCost(
              symbol.theoreticalPrice,
              symbol.K,
              symbol.netVolume,
              bg(p.volume).negated()
            )
              .negated()
              .minus(p.cost)
              .toString();
          } else {
            p.initialMarginRequired = bg(p.volume)
              .abs()
              .times(symbol.curIndexPrice)
              .times(symbol.initialMarginRatio)
              .toString();
            p.maintenanceMarginRequired = bg(p.initialMarginRequired)
              .times(symbol.maintenanceMarginRatio)
              .div(symbol.initialMarginRatio)
              .toString();
            p.traderPnl = bg(symbol.curIndexPrice)
              .times(p.volume)
              .minus(p.cost)
              .toString();
            p.dpmmTraderPnl = calculateDpmmCost(
              symbol.curIndexPrice,
              symbol.K,
              symbol.netVolume,
              bg(p.volume).negated()
            )
              .negated()
              .minus(p.cost)
              .toString();
          }
          fundingAccrued = bg(fundingAccrued).plus(p.fundingAccrued)
          traderPnl = bg(traderPnl).plus(p.traderPnl)
          dpmmTraderPnl = bg(dpmmTraderPnl).plus(p.dpmmTraderPnl)
          initialMargin = bg(initialMargin).plus(p.initialMarginRequired)
          maintenanceMargin = bg(maintenanceMargin).plus(
            bg(p.maintenanceMarginRequired)
          );
        }
        return p;
      });
      res = this[accountAddress].positions;
    }
    if (accountAddress != ZERO_ADDRESS) {
      this[accountAddress].fundingAccrued = fundingAccrued.toString()
      this[accountAddress].traderPnl = traderPnl.toString()
      this[accountAddress].dpmmTraderPnl = dpmmTraderPnl.toString()
      this[accountAddress].initialMargin = initialMargin.toString()
      this[accountAddress].maintenanceMargin = maintenanceMargin.toString()
      this[accountAddress].dynamicMargin = bg(this[accountAddress].margin)
        //.minus(this.account.initialMargin)
        .minus(this[accountAddress].fundingAccrued)
        .plus(this[accountAddress].traderPnl)
        .toString();
    }
    return res
  }
}

export const poolFactory = contractFactory(Pool);