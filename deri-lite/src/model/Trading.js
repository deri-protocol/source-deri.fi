import { observable, action, computed, makeObservable, autorun } from "mobx";
import Position from "./Position";
import Contract from "./Contract";
import History from './History'
import { eqInNumber, storeConfig, getConfigFromStore, restoreChain, getFormatSymbol, getMarkpriceSymbol, getDefaultNw, percentTimesAmount, precision, firstLetterUppercase, toPlainString, getCookie, setCookie, equalIgnoreCase } from "../utils/utils";
import { getFundingRate, DeriEnv, getVolatility, sortOptionSymbols, getVenusEarned } from "../lib/web3js/index";
import { bg } from "../lib/web3js/index";
import Intl from "./Intl";
import version from './Version'
import Type from "./Type";
import PoolManager from "./PoolManager";
import ApiProxy from "./ApiProxy";
import { OPTION, FUTURE, BUY, TRADE_ENTRY_VOLUME_STATUS, TRADE_ENTRY_DOLLAR_STATUS, TRADE_ENTRY_PERCENTAGE_STATUS, TRADE_ENTRY_SLIDER_STATUS, SELL, TRADING_APPEND_POSITION_STATUS, TRADING_CLOSE_POSITION_STATUS, TRADING_CREATE_POSITION_STATUS, SKIP_TRADE_CONFIRMATION, LONG, SHORT, CALL_OPTION, VERSION_V3, VERSION_V3_LITE, VERSION_V2_LITE, VERSION_V2, POWER, SHORT_NAME_MAP, COOKIE_DEFAULT_POWERS_SYMBOL_KEY, COOKIE_DEFAULT_FUTURES_SYMBOL_KEY, COOKIE_DEFAULT_OPTIONS_SYMBOL_KEY, FUTURES } from "../utils/Constants";
import Category from "./Category";

/**
 * 交易模型
 * 关联对象
 * 1. chain
 * 2. Oracle
 * 3. position
 * 4. contract
 * 5. history
 * 计算
 * 1. dynamic balance
 * 2. available blance
 * 响应事件
 * 1. chain change
 * 2. chain’s symbol changed
 * 3. index update
 * 4. volum change
 * 5. margin change
 * 输出
 * 1. dynamic balance
 * 2. margin
 * 3. available balance
 * 4. volume
 * 5. specs
 * 6. spec
 * 7. position
 * 8. contract
 * 9. fundingRate
 */

export default class Trading {
  version = null;
  wallet = null;
  type = null;
  volume = ''
  paused = false
  slideIncrementMargin = 0
  position = {}
  positions = []
  contract = {}
  fundingRate = {}
  volatility = ''
  history = []
  userSelectedDirection = 'long'
  supportChain = true
  optionsConfigs = {}
  pools = []
  allPools = []
  pool = {}
  closeOnly = false
  inputPercentageValue = ''
  direction = ''
  entryStatus = TRADE_ENTRY_VOLUME_STATUS
  inputDollarValue = ''
  inputSliderValue = ''
  impactPreview = {}
  symbols = [];
  currentSymbol = {}
  beforeChangedSymbol = {}
  loaded = false
  venusEarned = ''
  slippage = 0.001
  tradeInfo = {}
  subscribed = false

  constructor() {
    makeObservable(this, {
      volume: observable,
      inputPercentageValue: observable,
      slideIncrementMargin: observable,
      fundingRate: observable,
      volatility: observable,
      position: observable,
      positions: observable,
      history: observable,
      contract: observable,
      userSelectedDirection: observable,
      supportChain: observable,
      pools: observable,
      allPools: observable,
      pool: observable,
      symbols: observable,
      currentSymbol: observable,
      closeOnly: observable,
      direction: observable,
      entryStatus: observable,
      inputDollarValue: observable,
      inputSliderValue: observable,
      impactPreview: observable,
      venusEarned: observable,
      loaded: observable,
      slippage: observable,
      tradeInfo: observable,
      setVenusEarned: action,
      setWallet: action,
      setSymbols: action,
      setCurrentSymbol: action,
      setCloseOnly: action,
      setContract: action,
      setPosition: action,
      setPositions: action,
      setVolume: action,
      setUserSelectedDirection: action,
      setFundingRate: action,
      setVolatility: action,
      setHistory: action,
      setDirection: action,
      setEntryStatus: action,
      setInputDollarValue: action,
      setInputSliderValue: action,
      setImpactPreview: action,
      setSlippage: action,
      setPool: action,
      setAllPools: action,
      setTradeInfo: action,
      TransactionFeeTip: computed,
      fundingFeeValueTip: computed,
      fundingCoefficientTip: computed,
      rateTip: computed,
      multiplierTip: computed,
      powerMultiplierTip: computed,
      powerMarkPriceTip: computed,
      isNegative: computed,
      isPositive: computed,
      feeDisplay: computed,
      maxEntryVolume: computed,
      minEntryVolume: computed,
      curTradeUnit: computed,
      minTradeScaleDecimal: computed,
      calcMinTradeScaleDecimal: computed,
      dollarValue: computed,
      maxDollarValue: computed,
      maxAvailableMargin: computed,
      positionTradingStatus: computed,
      sliderValue: computed,
      volumeValue: computed,
      displayVolume: computed,
      realTradeVolume: computed,
      hasFormatUnit: computed,
      hasSpecialFormat: computed,
      formatSliderValue: computed,
      sliderStyle: computed,
      accountInfo: computed,
      inputHelpText: computed,
      directionDisplay: computed,
      tradeWarn: computed,
      initialMarginRatio: computed,
      maintenanceMarginRatio: computed,
      isAccountReady: computed,
      isTradingReady: computed,
      skipTradeConfirmation: computed,
      fundingFeeTip: computed,
      symbolInfo: computed,
      symbolInfos: computed,
      directionChanged: computed,
      volumeChanged: computed,
      tradeBToken: computed,
      isRetired: computed,
      takePrice: computed,// 开仓价格,
      displaySymbolMultiplier: computed,
      index: computed,
      markPrice: computed,
    })
    this.positionInfo = new Position()
    this.contractInfo = new Contract();
    this.historyInfo = new History();
    this.poolManager = new PoolManager();

    autorun(async () => {
      this.loadTransSummary();
    })

  }

  async loadTransSummary() {
    if (this.realTradeVolume && this.wallet && this.symbolInfo && this.accountInfo) {
      const { chainId, account } = this.wallet.detail;
      const { symbolId, address } = this.symbolInfo
      const symbolParam = this.symbolInfo.isAllV3 ? this.symbolInfo.symbol : symbolId
      let params = [chainId, address, Math.abs(this.realTradeVolume), symbolParam]
      const fee = await ApiProxy.request('getEstimatedFee', params)
      const volume = this.direction === SELL ? -this.realTradeVolume : this.realTradeVolume
      params = [chainId, address, account, volume, symbolParam]
      const liqPrice = await ApiProxy.request('getEstimatedLiquidatePrice', params)
      params = [chainId, address, volume, symbolParam]
      const markPriceAfter = await ApiProxy.request('getEstimatedTimePrice', params);

      const liqPriceBefore = this.position.liquidationPrice

      const marginUsageAfter = this.positionTradingStatus === TRADING_CLOSE_POSITION_STATUS
        ?
        bg(this.accountInfo.marginUsage).minus(this.accountInfo.curSymbolMarginUsage).plus(bg(this.accountInfo.curSymbolMarginUsage).minus(this.sliderValue).abs()).toNumber()
        :
        bg(this.accountInfo.marginUsage).plus(this.sliderValue).abs().toNumber()
      const unrealizedPnl = this.calculateUnrealizePnl(volume)
      const impact = {
        fee: fee,
        tradePrice: markPriceAfter,
        availableMargin: this.accountInfo.availableMargin,
        availableMarginAfter: bg(this.accountInfo.dynEffMargin).plus(unrealizedPnl).minus(fee).minus(marginUsageAfter).toNumber(),
        marginUsage: this.accountInfo.marginUsage,
        marginUsageAfter: marginUsageAfter,
        liqPrice: liqPriceBefore,
        liqPriceAfter: liqPrice
      }
      this.setImpactPreview(impact)
    }
  }
  getChainId(wallet) {
    if (wallet.isConnected()) {
      if (wallet.supportCurNetwork) {
        return wallet.detail.chainId || wallet.detail.id;
      } else {
        return getDefaultNw(DeriEnv.get()).id
      }
    } else if (wallet.status === 'disconnected') {
      return getDefaultNw(DeriEnv.get()).id
    }else {
      return wallet.detail.chainId || wallet.detail.id;
    }
  }

  /**
   * 初始化
   * wallet and version changed will init
   */
  async init(wallet, finishedCallback, isRetired, symbol, baseToken = '') {
    const chainId = this.getChainId(wallet);
    if (!chainId) {
      return;
    }
    const isOption = Type.isOption
    const type = Type.current
    let pools = await this.poolManager.loadByType(type);
    let allPools = await this.poolManager.loadAllPool();
    pools = pools.filter(p => !p.retired)
    allPools = allPools.filter(p => !p.retired)

    pools = pools.filter(p => eqInNumber(chainId, p.chainId) && p.symbols.some(s => s.category === Category.current))
    allPools = allPools.filter(p => eqInNumber(chainId, p.chainId))
    if (!pools || pools.length === 0 || !allPools || allPools.length === 0) {
      console.error('can not pool in current network')
      return;
    }
    this.setWallet(wallet);
    this.setAllPools(allPools)
    this.setPools(pools)
    const allSymbols = allPools.reduce((total, pool) => total.concat(pool.symbols), []).filter(s => !s.offline)
    let pool = null;
    let defaultSymbol = null;
    const cookie = this.getSymbolFromCookie();
    //symbol in path 优先级最高，cookie 次之，默认第一个池子和池子的第一个symbol
    if (symbol) {
      //&& p.bTokens.some(t => equalIgnoreCase(t.bTokenSymbol, baseToken))
      pool = pools.find(p => equalIgnoreCase(p.bTokenSymbol, baseToken) && p.symbols.some(s => equalIgnoreCase(s.displaySymbol, symbol)))
      defaultSymbol = pool && pool.symbols.find(s => equalIgnoreCase(s.displaySymbol, symbol))
    } else if (cookie && cookie.symbol && !isRetired) {
      pool = pools.find(p => (equalIgnoreCase(p.bTokenSymbol, cookie.baseToken) || p.bTokens.some(t => equalIgnoreCase(t.bTokenSymbol, cookie.baseToken))) && p.symbols.some(s => equalIgnoreCase(s.displaySymbol, cookie.symbol)))
      defaultSymbol = allSymbols.find(s => equalIgnoreCase(s.symbol, cookie.symbol) && equalIgnoreCase(s.bTokenSymbol, cookie.baseToken))
    }
    if (!pool) {
      pool = pools[0]
    }
    if (!pool) {
      console.error('can not find pool with symbol ', symbol)
      return;
    }
    //url 和 cookie 都没有 指明symbol，从当前pool的
    if (!defaultSymbol && pool) {
      defaultSymbol = Type.isOption
        ? (pool.symbols.find(s => s.symbol === 'BTCUSD-40000-C') || pool.symbols[0])
        : pool.symbols.find(s => s.category === Category.current)
    }

    this.setPool(pool)
    this.setSymbols(allSymbols)
    this.setCurrentSymbol(defaultSymbol);
    this.loadBySymboInfo(this.wallet, defaultSymbol, finishedCallback, isOption)
  }

  async loadBySymboInfo(wallet, currentSymbol, finishedCallback, isOption) {
    if (currentSymbol) {
      const position = await this.positionInfo.load(wallet, currentSymbol, position => {
        if (!this.paused && (!position.symbol || position.symbol === currentSymbol.displaySymbol)) {
          this.setPosition(position)
          this.initVenusEarned(wallet, currentSymbol);
        }
      })
      const contract = await this.contractInfo.load(wallet, currentSymbol, isOption)
      const histories = await this.historyInfo.load(wallet, currentSymbol, isOption)
      const fundingRate = await this.loadFundingRate(wallet,currentSymbol,isOption)
      this.setCurrentSymbol(currentSymbol)
      this.setPosition(position)
      this.setLoaded(true)
      this.setContract(contract)
      this.setHistory(histories);
      this.initVenusEarned(wallet, currentSymbol)
      this.setFundingRate(fundingRate)
      this.positionInfo.start()
      this.resume();
      finishedCallback && finishedCallback()
    } else {
      finishedCallback && finishedCallback()
    }
  }



  async initVenusEarned(wallet, symbolInfo) {
    const chainId = wallet && wallet.isConnected() ? wallet.detail.chainId : getDefaultNw(DeriEnv.get()).id
    if (symbolInfo && symbolInfo.isAllV3 && wallet) {
      const venusEarned = await ApiProxy.request('getVenusEarned', [chainId, symbolInfo.address, wallet.detail.account, { asTrader: true }])
      this.setVenusEarned(venusEarned)
    }
  }

  async refresh() {
    this.pause()
    this.setInputDollarValue('')
    this.setInputSliderValue('')
    this.setInputPercentageValue('')
    this.setVolume('')
    this.setCloseOnly(false);

    this.positionInfo.load(this.wallet, this.symbolInfo, position => {
      this.setPosition(position);
    });
    const history = await this.historyInfo.load(this.wallet, this.currentSymbol)
    if (history) {
      this.setHistory(history)
    }
    this.positionInfo.start();
    this.resume();
  }

  /**
   * 暂停实时读取index和定时读取position
   */
  pause() {
    this.setPaused(true)
    this.positionInfo.pause();
  }

  /**
   * 恢复读取
   */
  resume() {
    this.setPaused(false)
    this.positionInfo.resume();
  }


  setCookie(value, category, baseToken = '') {
    setCookie(this.getCookieKey(category), JSON.stringify({ symbol: value, baseToken: baseToken }))
  }


  getSymbolFromCookie() {
    const cookie = getCookie(this.getCookieKey(Category.current))
    if (cookie) {
      try {
        const obj = JSON.parse(cookie)
        return obj
      } catch (e) {
        return null
      }
    }
    return null
  }

  getCookieKey(category) {
    if (category === FUTURES) {
      return COOKIE_DEFAULT_FUTURES_SYMBOL_KEY
    } else if (category === OPTION) {
      return COOKIE_DEFAULT_OPTIONS_SYMBOL_KEY;
    } else {
      return COOKIE_DEFAULT_POWERS_SYMBOL_KEY
    }
  }

  setLoaded(loaded) {
    this.loaded = loaded
  }

  setWallet(wallet) {
    this.wallet = wallet;
  }

  setPools(pools) {
    this.pools = pools;

  }

  setPool(pool) {
    this.pool = pool
  }

  setAllPools(allPools) {
    this.allPools = allPools
  }

  setTradeInfo(tradeInfo) {
    this.tradeInfo = tradeInfo
  }

  setSymbols(symbols) {
    this.symbols = symbols;
  }

  setCurrentSymbol(symbol) {
    this.currentSymbol = symbol;
  }

  setVenusEarned(venusEarned) {
    this.venusEarned = venusEarned
  }

  setPosition(position) {
    if (position) {
      this.position = position
    }
  }

  setPositions(positions) {
    if (positions) {
      this.positions = positions
    }
  }

  setContract(contract) {
    this.contract = contract
  }

  setHistory(history) {
    this.history = history
  }

  setFundingRate(fundingRate) {
    this.fundingRate = fundingRate;
  }

  setVolatility(volatility) {
    this.volatility = volatility
  }

  setSlippage(value) {
    this.slippage = value
  }

  setVolume(volume) {
    this.volume = volume;
  }

  setInputPercentageValue(percentage) {
    this.inputPercentageValue = percentage
    if (percentage) {
      const curNotional = percentTimesAmount(percentage, this.maxAvailableMargin);
      const volume = this.calculateVolume(curNotional);
      this.setVolume(volume)
    }
  }

  setInputDollarValue(dollarValue) {
    this.inputDollarValue = dollarValue
    const volume = dollarValue ? this.calculateVolume(bg(dollarValue).times(this.initialMarginRatio)) : ''
    this.setVolume(volume)
  }

  setInputSliderValue(value) {
    this.setEntryStatus(TRADE_ENTRY_SLIDER_STATUS);
    this.inputSliderValue = value
    const volume = this.calculateVolume(value);
    this.setVolume(volume)
  }

  calculateVolume(value) {
    if (this.position && this.contract && this.symbolInfo && this.initialMarginRatio) {
      const volume = value ? (value / this.takePrice / this.initialMarginRatio).toFixed(this.calcMinTradeScaleDecimal) : 0
      return volume
    }
    return 0
  }



  setPaused(paused) {
    this.paused = paused
  }

  setUserSelectedDirection(direction) {
    this.userSelectedDirection = direction
  }

  setCloseOnly(closeOnly) {
    this.closeOnly = closeOnly
  }

  setDirection(direction) {
    this.direction = direction
  }

  setEntryStatus(status) {
    this.entryStatus = status
  }

  setImpactPreview(impact) {
    this.impactPreview = impact
  }

  groupConfigBySymbol(symbols = []) {
    return symbols.reduce((total, config) => {
      const symbol = config.symbol.split('-')[0]
      if (!total[symbol]) {
        total[symbol] = []
      }
      config['underlier'] = symbol
      config['zone'] = symbol
      total[symbol].push(config)
      return total;
    }, [])
  }


  //资金费率
  async loadFundingRate(wallet, currentSymbol, isOption) {
    if (currentSymbol) {
      const chainId = wallet && wallet.isConnected() && wallet.isSupportChain(isOption) ? wallet.detail.chainId : getDefaultNw(DeriEnv.get()).id
      if (currentSymbol) {
        const symbolParam = currentSymbol.isAllV3 ? currentSymbol.symbol : currentSymbol.symbolId
        const res = await ApiProxy.request('getFundingRate', [chainId, currentSymbol.address, symbolParam]).catch(e => console.error('getFundingRate was error,maybe network is wrong'))
        return res;
      }
    }
  }


  doTransaction() {
    const volume = toPlainString(this.direction === SELL ? -this.realTradeVolume : this.realTradeVolume)
    const symbolParam = this.pool.isAllV3 ? this.symbolInfo.symbol : this.symbolInfo.symbolId
    return ApiProxy.request('tradeWithMargin', [this.wallet.detail.chainId, this.currentSymbol.address, this.wallet.detail.account, volume, symbolParam, this.slippage], { includeResponse: true, write: true, subject: `${Intl.get('lite', this.direction)} ${Intl.get('lite', 'order')}` })
  }

  clean() {
    this.pause();
    this.positionInfo.clean();
    this.version = null;
    this.beforeChangedSymbol = this.currentSymbol
    this.setCurrentSymbol({})
    this.setTradeInfo({})
    this.setVolume('')
    this.setVolatility('')
    this.setPosition({})
    this.setPositions([])
    this.setContract({})
    this.setHistory([])
    this.setLoaded(false)
    this.subscribed = false
  }

  get index() {
    return this.tradeInfo && this.tradeInfo.indexPrice
  }

  get markPrice() {
    return this.tradeInfo && this.tradeInfo.markPrice
  }

  get accountInfo() {
    const position = this.position;
    if (position && position.margin !== undefined && position.unrealizedPnl !== undefined && position.marginHeld !== undefined) {
      const { volume = 0, margin = 0, unrealizedPnl = 0, fundingFee = 0, marginHeld = 0, price = 0, marginHeldBySymbol = 0 } = position
      const dynEffMargin = bg(margin).plus(unrealizedPnl).minus(fundingFee);
      const marginUsagePercent = dynEffMargin.gt(0) ? bg(marginHeld).div(dynEffMargin).times(100) : bg(0)
      return {
        dynEffMargin: dynEffMargin.toString(),
        marginUsage: marginHeld,
        availableMargin: dynEffMargin.minus(marginHeld).lt(0) ? 0 : dynEffMargin.minus(marginHeld).toString(),
        curSymbolMarginUsage: marginHeldBySymbol,
        curSymbolNotional: bg(volume).abs().times(this.initialMarginRatio).times(this.takePrice).toString(),
        marginUsagePercent: marginUsagePercent.gt(200) ? 200 : marginUsagePercent.toFixed(2)
      }
    }
    return {}
  }

  //正仓
  get isPositive() {
    return bg(this.position.volume).gt(0);
  }

  //负仓
  get isNegative() {
    return bg(this.position.volume).isNegative();
  }



  calculateTransactionFee(volume) {
    const fee = this.feeDisplay
    const cost = this.calculateCost(volume);
    if (Array.isArray(fee)) {
      if (this.contract.isCall) {
        if (this.contract.strike >= this.position.price) {
          return bg(cost).times(fee[2]).div(100).abs().toNumber()
        } else {
          return bg(this.position.price).times(volume).times(fee[2]).div(100).abs().toNumber()
        }
      } else {
        if (this.contract.strike < this.position.price) {
          return bg(cost).times(fee[2]).div(100).abs().toNumber()
        } else {
          return bg(this.position.price).times(volume).times(fee[2]).div(100).abs().toNumber()
        }
      }
    } else {
      return bg(cost).times(fee).div(100).abs().toNumber()
    }
  }

  calculateCost(volume) {
    if (this.wallet && this.pool) {
      const params = [this.pool.chainId, this.pool.address, volume]
      const cost = ApiProxy.syncRequest('getEstimatedDpmmCost', params);
      return cost;
    }
    return 0;
  }

  calculateUnrealizePnl(volume) {
    const price = Type.isFuture && !this.symbolInfo.isPower ? this.position.price : this.position.theoreticalPrice
    const unrealizedPnl = bg(price).times(volume).minus(this.calculateCost(volume)).toNumber()
    return unrealizedPnl;
  }

  get displaySymbolMultiplier() {
    return 1 / SHORT_NAME_MAP[this.symbolInfo.formattedUnit]
  }

  get feeDisplay() {
    if (Type.isFuture) {
      return this.contract.feeRatio ? this.contract.feeRatio * 100 : 0
    } else {
      if (this.contract.isCall) {
        if (this.contract.strike >= this.position.indexPrice) {
          return [Intl.get('lite', 'mark-price'), '*', this.contract.feeRatioOTM * 100]
        } else {
          return this.contract.underlier ? [`${this.contract.underlier} ${Intl.get('lite', 'price')}`, '*', this.contract.feeRatioITM * 100] : ['', '']
        }
      } else {
        if (this.contract.strike < this.position.indexPrice) {
          return [Intl.get('lite', 'mark-price'), '*', this.contract.feeRatioOTM * 100]
        } else {
          return this.contract.underlier ? [`${this.contract.underlier} ${Intl.get('lite', 'price')}`, '*', this.contract.feeRatioITM * 100] : ['', '']
        }
      }
    }
  }

  get fundingFeeValueTip() {
    if (this.fundingRate && this.fundingRate.fundingPerSecond && this.symbolInfo) {
      const text = this.symbolInfo.isPower ? { unit: this.symbolInfo.displaySymbol } : { unit: this.symbolInfo.unit }
      return `${Intl.eval('lite', '1-long-contract-pays-1-short-contract', text)} :
             ${this.fundingRate.funding0} ${this.symbolInfo.bTokenSymbol} /  ${Intl.get('lite', 'day')}  ${Intl.get('lite', 'or')} 
             ${this.fundingRate.fundingPerSecond} ${this.symbolInfo.bTokenSymbol} /  ${Intl.get('lite', 'second')}`
    }
    return ''
  }

  get rateTip() {
    if (this.fundingRate && this.fundingRate.funding0 && this.fundingRate.markPrice) {
      return `${Intl.get('lite', 'rate-hover-one')} ${bg(this.fundingRate.funding0).div(bg(this.fundingRate.markPrice)).times(bg(100)).toString()}% * ${Intl.get('lite', 'rate-hover-two')}`
    }
    return ''
  }

  get powerMultiplierTip() {
    if (this.symbolInfo && this.symbolInfo.displaySymbol && this.symbolInfo.symbol && this.contract.displayMultiplier) {
      return Intl.eval('lite', 'power-multiplier-hover', {
        unit: this.symbolInfo.symbol,
        symbol: this.symbolInfo.displaySymbol,
        value: this.contract.displayMultiplier
      })
    }
    return ''
  }

  get powerMarkPriceTip() {
    if (this.symbolInfo && this.symbolInfo.displaySymbol && this.symbolInfo.symbol) {
      return Intl.eval('lite', 'power-mark-price', {
        unit: this.symbolInfo.symbol,
        symbol: this.symbolInfo.displaySymbol,
        multiplier: this.displaySymbolMultiplier
      })
    }
    return ""
  }

  get fundingCoefficientTip() {
    if (this.contract && this.contract.fundingRateCoefficient && this.symbolInfo) {
      const propName = this.symbolInfo.isPower ?"Theoretical Price": "Index Price"
      return Intl.eval('lite', 'funding-coefficient-hover', {
        unit: this.symbolInfo.unit,
        value: this.contract.fundingRateCoefficient,
        pricePropName: propName.toLowerCase()
      })
    }
    return ''
  }



  get multiplierTip() {
    if (this.contract && this.pool) {
      return `${Intl.get('lite', 'the-notional-value-of')} ${this.contract.minTradeUnit}${this.symbolInfo.unit}`
    }
    return ''
  }

  get TransactionFeeTip() {
    if (this.contract && (this.contract.feeRatioITM && this.contract.feeRatioOTM)) {
      return `In-the-money: Transaction Fee  =  ${this.contract.underlier} Price * ${bg(this.contract.feeRatioITM).times(bg(100)).toString()} %` +
        ` Out-of-money: Transaction Fee = Mark Price * ${bg(this.contract.feeRatioOTM).times(bg(100)).toString()} %`
    }
    return ''
  }

  /**
   * 最大输入数量
   * 分为两种情况
   * 1. closeOnly false
   *  max entry volume = dynamic effective margin / symbol's price (etc BTC) 
   * 2. closeOnly true
   *  max entry volume = current symbol margin held / symbol's price (etc BTC)
   */
  get maxEntryVolume() {
    const maxVolume = this.calculateVolume(this.maxAvailableMargin);
    return this.hasSpecialFormat ? bg(maxVolume).div(SHORT_NAME_MAP[this.symbolInfo.formattedUnit]).toFixed(this.minTradeScaleDecimal) : maxVolume
  }


  //最小输入数量
  get minEntryVolume() {
    return this.contract && this.hasSpecialFormat ? bg(this.contract.multiplier).div(SHORT_NAME_MAP[this.symbolInfo.formattedUnit]).toNumber() : this.contract.minTradeUnit;
  }

  get curTradeUnit() {
    return this.symbolInfo && this.symbolInfo.displayUnit ? `${this.symbolInfo.displayUnit}` : ''
  }

  //有效数字
  get minTradeScaleDecimal() {
    return this.contract && precision(this.contract.minTradeUnit)
  }

  get calcMinTradeScaleDecimal() {
    return this.contract && precision(this.contract.multiplier)
  }

  get dollarValue() {
    if (this.entryStatus === TRADE_ENTRY_DOLLAR_STATUS) {
      return this.inputDollarValue
    } else {
      const value = bg(this.displayVolume).times(this.takePrice).toFixed(2)
      return this.hasSpecialFormat ? bg(value).times(SHORT_NAME_MAP[this.symbolInfo.formattedUnit]).toFixed(2) : value
    }
    // this.entryStatus !== TRADE_ENTRY_DOLLAR_STATUS && !this.inputDollarValue && this.realTradeVolume ? bg(this.realTradeVolume).times(this.takePrice).toFixed(2) : this.inputDollarValue
  }

  get maxDollarValue() {
    return bg(this.calculateVolume(this.maxAvailableMargin)).times(this.takePrice).toFixed(2);
  }

  get sliderValue() {
    if (this.entryStatus === TRADE_ENTRY_SLIDER_STATUS) {
      return this.inputSliderValue
    } else {
      const value = this.displayVolume && this.takePrice && this.initialMarginRatio ? bg(this.displayVolume).times(this.initialMarginRatio).times(this.takePrice).toNumber() : 0;
      return this.hasSpecialFormat
        ? bg(value).times(SHORT_NAME_MAP[this.symbolInfo.formattedUnit]).toFixed(this.minTradeScaleDecimal) :
        value
      // return value
    }
  }

  get volumeValue() {
    const value = this.entryStatus !== TRADE_ENTRY_VOLUME_STATUS ? bg(this.volume).toFixed(this.minTradeScaleDecimal) : this.volume
    return value
  }

  //解析用户输入的volume，根据单位不一样，值不一样
  get displayVolume() {
    if (this.entryStatus !== TRADE_ENTRY_VOLUME_STATUS && this.hasSpecialFormat) {
      return bg(this.volume).div(SHORT_NAME_MAP[this.symbolInfo.formattedUnit]).toFixed(this.minTradeScaleDecimal)
    } else {
      return this.volume
    }
  }

  get realTradeVolume() {
    if ((this.hasSpecialFormat) && this.volume) {
      return bg(this.displayVolume).times(SHORT_NAME_MAP[this.symbolInfo.formattedUnit]).toFixed(this.calcMinTradeScaleDecimal)
    } else {
      return this.volume
    }
  }


  //symbol 是否需要另外的multiplier
  get hasFormatUnit() {
    return this.symbolInfo && this.symbolInfo.showUnitConversion
  }

  get hasSpecialFormat() {
    return this.symbolInfo && this.symbolInfo.formattedUnit
  }



  //开仓价格
  get takePrice() {
    return this.symbolInfo && this.position && (this.symbolInfo.category === POWER)
      ? bg(this.position.theoreticalPrice).toFixed(0)
      : this.position.price
  }

  get formatSliderValue() {
    return this.sliderValue && bg(this.sliderValue).toFixed(this.minTradeScaleDecimal)
  }


  //只负责平仓交易状态下slider bar 的渐变，其他状态css控制
  get sliderStyle() {
    const buyColor = '#59AE99';
    const sellColor = '#CE5E5E';
    const railBuyColor = 'rgba(89, 174, 153, 0.1)'
    const railsSellColor = 'rgba(206, 94, 94, 0.1)'
    const defaultStyle = {
      trackStyle: {
      },
      railStyle: {
      },
      handleStyle: {
      }
    }
    let trackStartColor, trackEndColor;
    let railStartColor, railEndColor;
    let handleColor;
    let startPercent
    // let margin, available;
    const sliderBarLength = 331;
    if (this.positionTradingStatus === TRADING_CLOSE_POSITION_STATUS) {
      if (!this.closeOnly) {
        //右边往左，右边是占用比例
        startPercent = bg(this.accountInfo.curSymbolMarginUsage).div(this.maxAvailableMargin)
        const start = bg(sliderBarLength).times(startPercent).toNumber()
        const gradient = start + 20
        const end = sliderBarLength - start
        if (this.isPositive) {
          trackStartColor = buyColor;
          trackEndColor = sellColor
          railStartColor = railBuyColor;
          railEndColor = railsSellColor
          handleColor = bg(this.sliderValue).gt(this.accountInfo.curSymbolMarginUsage) ? sellColor : buyColor
        } else {
          trackStartColor = sellColor;
          trackEndColor = buyColor;
          railStartColor = railsSellColor;
          railEndColor = railBuyColor
          handleColor = bg(this.sliderValue).gt(this.accountInfo.curSymbolMarginUsage) ? buyColor : sellColor
        }
        return {
          trackStyle: {
            background: `linear-gradient(to right, ${trackStartColor} ${start}px, ${trackEndColor} ${gradient}px ,${trackEndColor} ${end}px`
          },
          railStyle: {
            background: `linear-gradient(to right, ${railStartColor} ${start}px, ${railEndColor} ${gradient}px ,${railEndColor} ${end}px`
          },
          handleStyle: {
            background: handleColor,
            borderColor: handleColor
          }
        }
      } else {
        return defaultStyle;
      }
    } else {
      return defaultStyle;
    }
  }

  //正在交易状态，（开仓、加仓、平仓）
  get positionTradingStatus() {
    if ((this.isPositive && this.direction === BUY) || (this.isNegative && this.direction === SELL)) {
      return TRADING_APPEND_POSITION_STATUS;
    } else if ((this.isPositive && this.direction === SELL) || (this.isNegative && this.direction === BUY)) {
      return TRADING_CLOSE_POSITION_STATUS;
    } else {
      return TRADING_CREATE_POSITION_STATUS;
    }

  }

  get maxAvailableMargin() {
    let max = this.accountInfo.availableMargin ? this.accountInfo.availableMargin : 0;
    if (this.accountInfo && this.accountInfo.curSymbolMarginUsage && this.accountInfo.availableMargin !== undefined) {
      //平仓
      if (this.positionTradingStatus === TRADING_CLOSE_POSITION_STATUS) {
        if (this.closeOnly) {
          max = this.accountInfo.curSymbolNotional;
        } else {
          max = bg(this.accountInfo.curSymbolMarginUsage).times(2).plus(this.accountInfo.availableMargin).toNumber()
        }
      } else {
        max = this.accountInfo.availableMargin ? this.accountInfo.availableMargin : 0
      }
      // max available volume
      // future = max + unrealizePnl + transactionFee
      // option = max + transactionFee
      if (this.pool && this.initialMarginRatio && !this.closeOnly) {
        let maxVolume = this.calculateVolume(max)
        let unrealizedPnl;
        let fee;
        if (this.positionTradingStatus === TRADING_CLOSE_POSITION_STATUS) {
          const originMax = max
          const closePnl = - (bg(this.calculateCost(-(+this.position.volume))).plus(this.position.cost).toNumber())
          const othersMarginHeld = bg(this.accountInfo.marginUsage).minus(this.accountInfo.curSymbolMarginUsage)
          // console.log('this.position.unrealizedPnlList',this.position.unrealizedPnlList)
          // console.log('this.symbolInfo.symbol',this.symbolInfo.symbol)
          const curSymbolUnrealizedPnl = this.position.unrealizedPnlList.find(item => item[0] === this.symbolInfo.symbol)[1]
          const availMargin = bg(this.accountInfo.dynEffMargin).minus(othersMarginHeld).minus(curSymbolUnrealizedPnl).plus(closePnl).minus(this.calculateTransactionFee(-(+this.position.volume)))

          maxVolume = this.calculateVolume(availMargin.toNumber())
          let totalMaxVolume = bg(maxVolume).plus(Math.abs(this.position.volume)).toNumber()
          totalMaxVolume = this.direction === BUY ? totalMaxVolume : -totalMaxVolume
          const totalUnrealizedPnl = this.calculateUnrealizePnl(totalMaxVolume)
          const totalFee = this.calculateTransactionFee(totalMaxVolume)

          fee = this.calculateTransactionFee(-(+this.position.volume));
          unrealizedPnl = this.calculateUnrealizePnl(-(+this.position.volume))

          max = availMargin.plus(totalUnrealizedPnl).minus(unrealizedPnl).minus(totalFee).plus(fee).toNumber()
          max = bg(max).gt(0) ? max : 0;

          if (availMargin > max) {
            maxVolume = this.calculateVolume(availMargin)
            maxVolume = this.direction === BUY ? maxVolume : -maxVolume
            // console.log("availMargin", availMargin, "max", max, 'maxVolume', maxVolume, this.direction)
            max = this.calculateAvaiableMargin(max, availMargin, availMargin, maxVolume, this.direction, 0)
          } else {
            maxVolume = this.calculateVolume(max)
            maxVolume = this.direction === BUY ? maxVolume : -maxVolume
            // console.log("availMargin", availMargin, "max", max, 'maxVolume', maxVolume, this.direction)
            max = this.calculateAvaiableMargin(availMargin, max, availMargin, maxVolume, this.direction, 0)
          }
          max = bg(max).plus(bg(this.accountInfo.curSymbolMarginUsage))
        }

        else {
          maxVolume = this.direction === BUY ? maxVolume : -maxVolume
          unrealizedPnl = this.calculateUnrealizePnl(maxVolume)
          const originMax = max;
          fee = this.calculateTransactionFee(maxVolume)
          max = bg(max).plus(unrealizedPnl).minus(fee).toNumber();
          max = bg(max).gt(0) ? max : 0;
          // max = bg(originMax).plus(max).div(2).toNumber()
          if (originMax > max) {
            maxVolume = this.calculateVolume(originMax)
            maxVolume = this.direction === BUY ? maxVolume : -maxVolume
            max = this.calculateAvaiableMargin(max, originMax, originMax, maxVolume, this.direction, 0)
          } else {
            maxVolume = this.calculateVolume(max)
            maxVolume = this.direction === BUY ? maxVolume : -maxVolume
            max = this.calculateAvaiableMargin(originMax, max, originMax, maxVolume, this.direction, 0)
          }
        }
      }
    }
    return bg(max).toFixed(this.minTradeScaleDecimal)
  }

  calculateAvaiableMargin(iBegin, iEnd, dynamic, volume, direction, iter) {
    const unrealizedPnl = this.calculateUnrealizePnl(volume);
    const fee = this.calculateTransactionFee(volume);
    const marginUsage = bg(this.takePrice).times(volume).times(this.initialMarginRatio).abs();
    const result = bg(dynamic).plus(unrealizedPnl).minus(fee).minus(marginUsage).toNumber()
    const stopValue = bg(dynamic).times(0.01).toNumber()
    iter = iter + 1
    // console.log('result ',result, 'iBegin', bg(iBegin).toNumber(), 'iEnd', iEnd, 'volume', volume, 'stopValue', stopValue, 'iter', iter)


    if ((result <= stopValue && result >= 0) || iter >= 5) {
      // console.log('finish', 'iEnd', iEnd)
      return iEnd;
    } else {
      const middleMargin = bg(iBegin).plus(iEnd).div(2).toNumber();
      let maxVolume;
      let begin, end;
      if (result < 0) {
        begin = iBegin
        end = middleMargin
        maxVolume = this.calculateVolume(middleMargin);
        maxVolume = direction === BUY ? maxVolume : -maxVolume
      } else if (result > stopValue) {
        begin = middleMargin
        end = iEnd
        maxVolume = this.calculateVolume(end);
        maxVolume = direction === BUY ? maxVolume : -maxVolume
      }
      else {
        begin = middleMargin;
        end = iEnd;
        maxVolume = this.calculateVolume(end);
        maxVolume = direction === BUY ? maxVolume : -maxVolume
      }
      return this.calculateAvaiableMargin(begin, end, dynamic, maxVolume, direction, iter)
    }
  }

  //当前仓位margin 占用
  // get curMarginUsage() {
  //   return bg(this.volume).times(this.position.price).times(this.initialMarginRatio).toNumber();
  // }

  get initialMarginRatio() {
    return this.contract && this.contract.initialMarginRatio;
  }

  get maintenanceMarginRatio() {
    return this.contract && this.contract.maintenanceMarginRatio
  }

  get directionDisplay() {
    if (this.direction === BUY) {
      return 'long'
    } else {
      return 'short'
    }
  }

  //power's volume need to times multiplier
  getPowerVolume(volume) {
    if (this.symbolInfo.isPower) {
      return bg(volume).div(SHORT_NAME_MAP[this.symbolInfo.formattedUnit]).toFixed(this.minTradeScaleDecimal)
    } else {
      return volume
    }
  }

  get inputHelpText() {
    let openText = this.pool && this.symbolInfo && `${Intl.get('lite', 'open-a')} ${bg(this.getPowerVolume(this.realTradeVolume)).toFixed(this.minTradeScaleDecimal)} ${this.symbolInfo.unit} ${this.directionDisplay} ${this.symbolInfo.optionType} ${Intl.get('lite', 'position').toLowerCase()}`
    if (this.positionTradingStatus === TRADING_CLOSE_POSITION_STATUS) {
      let percentage = bg(this.sliderValue).div(this.maxAvailableMargin).times(100);
      percentage = percentage.gt(100) || (+this.displayVolume) + (+this.position.volume) === 0 ? 100 : percentage.toFixed(0, 0)
      const closeText = `${percentage}% ${Intl.get('lite', 'close-position')}`
      if (this.closeOnly) {
        return closeText;
      } else {
        let percentage = bg(this.sliderValue).div(bg(this.accountInfo.curSymbolNotional).toFixed(2)).times(100)
        const closeText = `${percentage.gt(100) ? 100 : percentage.toFixed(0)}% ${Intl.get('lite', 'close-position')}`
        const amount = this.direction === BUY ? this.realTradeVolume : -this.realTradeVolume
        const volume = bg(this.getPowerVolume(bg(this.position.volume).plus(amount).abs()))
        if (percentage.gt(100) && volume.gt(this.contract.minTradeUnit)) {
          openText = `${Intl.get('lite', 'open-a')} ${volume.toFixed(this.minTradeScaleDecimal)} ${this.symbolInfo.unit} ${this.directionDisplay} ${this.symbolInfo.optionType} ${Intl.get('lite', 'position').toLowerCase()}`
          return `${closeText} + ${openText}`
        } else {
          return closeText
        }
      }
    } else {
      return openText
    }
  }

  get tradeWarn() {
    return this.isRetired || (!this.closeOnly && this.maxAvailableMargin && !isNaN(this.realTradeVolume) && this.realTradeVolume && bg(this.realTradeVolume).eq(this.calculateVolume(this.maxAvailableMargin)));
  }

  get isAccountReady() {
    return this.wallet && this.pool && this.pool.address
  }

  get isTradingReady() {
    return this.maxAvailableMargin > 0 && this.displayVolume > 0
  }

  get isRetired() {
    return this.pool && this.pool.retired
  }

  get skipTradeConfirmation() {
    return sessionStorage.getItem(SKIP_TRADE_CONFIRMATION) === '1'
  }

  get fundingFeeTip() {
    if (Type.isFuture) {
      if (Category.isPower && this.symbolInfo.symbolWithoutPower) {
        return Intl.eval('lite', 'daily-funding-hover-power', { unit: this.symbolInfo.symbolWithoutPower })

      } else {
        return Intl.get('lite', 'daily-funding-hover-future')
      }
    } else {
      return Intl.get('lite', 'daily-funding-hover-option')
    }
  }



  get symbolInfos() {
    let symbols = this.symbols
    return symbols;
  }

  get symbolInfo() {
    return this.currentSymbol || {};
  }

  get directionChanged() {
    return {
      className: (+this.volumeChanged.nowValue) > 0 ? 'to-long' : (+this.volumeChanged.nowValue) < 0 ? 'to-short' : 'close',
      before: firstLetterUppercase(this.isPositive ? LONG : this.isNegative ? SHORT : Intl.get('lite', 'none')),
      now: firstLetterUppercase((+this.volumeChanged.nowValue) > 0 ? LONG : (+this.volumeChanged.nowValue) < 0 ? SHORT : '')
    }
  }

  get volumeChanged() {
    const curVolume = this.direction === BUY ? this.realTradeVolume : -this.realTradeVolume;
    let nowVolume = bg(curVolume).plus(this.position.volume).toNumber()
    const beforeVolume = this.getPowerVolume(this.position.volume);
    return {
      before: (+this.position.volume) === 0 ? '' : `${bg(beforeVolume).toFixed(this.minTradeScaleDecimal)} ${this.symbolInfo.unit}`,
      nowValue: this.getPowerVolume(nowVolume),
      now: `${this.getPowerVolume(nowVolume)} ${this.symbolInfo.unit}`,
      totalVolume: this.getPowerVolume(this.realTradeVolume),
      notional: bg(nowVolume).times(this.position.price).toNumber()
    }
  }

  get tradeBToken() {
    return this.symbolInfo && this.symbolInfo.bTokenSymbol ? this.symbolInfo.bTokenSymbol : 'BUSD'
  }


}