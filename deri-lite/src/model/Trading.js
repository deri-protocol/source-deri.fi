import { observable, action, computed, makeObservable } from "mobx";
import Oracle from "./Oracle";
import Position from "./Position";
import Contract from "./Contract";
import History from './History'
import Config from "./Config";
import { eqInNumber, storeConfig, getConfigFromStore, restoreChain, getFormatSymbol, getMarkpriceSymbol, getDefaultNw } from "../utils/utils";
import { getFundingRate, priceCache, DeriEnv, getVolatility } from "../lib/web3js/indexV2";
import { bg } from "../lib/web3js/indexV2";
import Intl from "./Intl";
import version from './Version'
import type from './Type'
import Type from "./Type";

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
  configs = []
  config = null;
  index = ''
  markPrice = ''
  volume = ''
  priceDecimals = 2
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

  constructor() {
    makeObservable(this, {
      index: observable,
      markPrice: observable,
      volume: observable,
      slideIncrementMargin: observable,
      fundingRate: observable,
      volatility: observable,
      position: observable,
      positions: observable,
      history: observable,
      contract: observable,
      priceDecimals: observable,
      userSelectedDirection: observable,
      supportChain: observable,
      setWallet: action,
      setConfigs: action,
      setOptionConfigs: action,
      setConfig: action,
      setPriceDecimals: action,
      setIndex: action,
      setMarkPrice: action,
      setContract: action,
      setPosition: action,
      setPositions: action,
      setVolume: action,
      setUserSelectedDirection: action,
      // setSupportChain : action,
      setFundingRate: action,
      setVolatility: action,
      setHistory: action,
      setSlideMargin: action,
      amount: computed,
      fundingRateTip: computed,
      optionFundingRateTip: computed,
      initialMarginRatioTip: computed,
      maintenanceMarginRatioTip: computed,
      TransactionFeeTip: computed,
      dpmmFundingRateTip: computed,
      fundingCoefficientTip: computed,
      rateTip: computed,
      multiplierTip: computed,
      TotalNetPositionTip: computed,
      direction: computed,
      volumeDisplay: computed,
      isNegative: computed,
      isPositive: computed
    })
    this.configInfo = new Config();
    this.indexOracle = new Oracle();
    this.markOracle = new Oracle();
    this.positionInfo = new Position()
    this.contractInfo = new Contract();
    this.historyInfo = new History()
  }

  /**
   * 初始化
   * wallet and version changed will init
   */
  async init(wallet, finishedCallback) {
    const isOption = Type.isOption
    const all = await this.configInfo.load(version, isOption);
    //如果连上钱包，有可能当前链不支持
    if (wallet.isConnected()) {
      this.setWallet(wallet);
      this.setConfigs(all.filter(c => eqInNumber(wallet.detail.chainId, c.chainId)))
      const defaultConfig = this.configs.length > 0 ? this.configs[0] : all[0] // this.getDefaultConfig(this.configs, wallet);
      //如果还是为空，则默认用所有config的第一条
      this.setConfig(defaultConfig);
      //如果没有钱包或者链接的链不一致，设置默认config，BTCUSD
    } else if (!wallet.isConnected() || !wallet.supportWeb3()) {
      //没有钱包插件
      this.setConfigs(all.filter(c => eqInNumber(getDefaultNw(DeriEnv.get()).id, c.chainId)))
      const defaultConfig = all.length > 0 ? all[0] : {}
      this.setConfig(defaultConfig)
    }
    this.loadByConfig(this.wallet, this.config, true, finishedCallback, isOption)
  }

  async onSymbolChange(spec, finishedCallback, isOption) {
    const config = this.configs.find(config => config.pool === spec.pool && config.symbolId === spec.symbolId)
    //v1 只需要比较池子地址，v2 需要比较symbolId
    const changed = version.isV1 ? spec.pool !== this.config.pool : spec.symbolId !== this.config.symbolId
    this.onChange(config, changed, finishedCallback, isOption)
  }

  async onChange(config, changed, finishedCallback, isOption) {
    if (config) {
      this.clean();
      this.setConfig(config)
      this.loadByConfig(this.wallet, config, changed, finishedCallback, isOption);
      if (changed) {
        this.store(config)
      }
    } else {
      finishedCallback && finishedCallback()
    }
  }

  async loadByConfig(wallet, config, symbolChanged, finishedCallback, isOption) {
    //切换指数
    if (symbolChanged && config) {
      this.indexOracle.addListener('indexPrice', data => {
        this.setIndex(data.close)
      })
      this.markOracle.addListener('markPrice',data => {
        this.setMarkPrice(data.close)
      })
    }
    if (config) {
      Promise.all([
        this.positionInfo.load(wallet, config, position => {
          this.setPosition(position)
          this.syncFundingRate(wallet, config, isOption)
          type.isOption && this.syncVolatility(wallet, config);
        }),
        this.contractInfo.load(wallet, config, isOption),
        this.loadFundingRate(wallet, config, isOption),
        this.positionInfo.loadAll(wallet, config, positions => this.setPositions(positions)),
      ]).then(results => {
        if (results.length === 4) {
          if(results[0]) {
            this.setIndex(results[0].price)
            this.setMarkPrice(results[0].markPrice);
            this.setPosition(results[0]);
          }
          results[1] && this.setContract(results[1]);
          results[2] && this.setFundingRate(results[2]);
          results[3] && this.setPositions(results[3]);
        }
      }).finally(e => {
        finishedCallback && finishedCallback()
        this.indexOracle.load(getFormatSymbol(config.symbol.split('-')[0]))
        this.markOracle.load(getFormatSymbol(config.markpriceSymbolFormat || `${config.symbol}-MARKPRICE`))
        this.positionInfo.start()
        this.positionInfo.startAll();
        this.resume();
      })
    } else {
      finishedCallback && finishedCallback()
    }
    const histories = await this.historyInfo.load(wallet, config, isOption)
    this.setHistory(histories);
  }

  refreshCache() {
    const { pool } = this.config;
    const symbol = type.isOption ? this.config.symbol.split('-')[0] : this.config.symbol
    priceCache.clear();
    priceCache.update(pool, symbol)
  }


  //优先使用session storage 的，如果缓存跟用户当前链一直，则命中缓存，否则取当前配置第一条
  getDefaultConfig(configs = [], wallet) {
    let defaultConfig = null;
    if (configs.length > 0) {
      const fromStore = this.getFromStore();
      if (fromStore && eqInNumber(wallet.detail.chainId, fromStore.chainId)) {
        defaultConfig = fromStore;
      }
      if (defaultConfig) {
        //虽然从缓存获得config ，需要判断池子地址是否一致，否则用可用config的第一条
        const pos = configs.findIndex(c => c.pool === defaultConfig.pool);
        if (pos === -1) {
          defaultConfig = configs[0];
        }
      } else {
        defaultConfig = configs[0]
      }
    }
    return defaultConfig;
  }

  //存起来
  store(config) {
    storeConfig(version.current, config)
  }

  getFromStore() {
    return getConfigFromStore(version.current)
  }

  async syncFundingRate() {
    //资金费率和仓位同步
    const fundingRate = await this.loadFundingRate(this.wallet, this.config)
    if (fundingRate) {
      this.setFundingRate(fundingRate)
    }
  }

  async syncVolatility(wallet, config) {
    const chainId = wallet && wallet.isConnected() ? wallet.detail.chainId : getDefaultNw(DeriEnv.get()).id
    if (config) {
      const volatility = await getVolatility(chainId, config.pool, config.symbolId);
      this.setVolatility(volatility)
    }
  }

  async refresh() {
    this.pause()
    this.positionInfo.load(this.wallet, this.config, position => {
      this.setPosition(position);
      this.syncFundingRate();
      type.isOption && this.syncVolatility(this.wallet, this.config);
    });
    this.positionInfo.loadAll(this.wallet, this.config, positions => this.setPositions(positions))
    this.syncFundingRate();
    type.isOption && this.syncVolatility(this.wallet, this.config);
    this.wallet && this.wallet.isConnected() && this.wallet.loadWalletBalance(this.wallet.detail.chainId, this.wallet.detail.account)
    const history = await this.historyInfo.load(this.wallet, this.config)
    if (history) {
      this.setHistory(history)
    }
    this.positionInfo.start();
    this.positionInfo.startAll();
    this.setVolume('')
    this.resume();
  }

  /**
   * 暂停实时读取index和定时读取position
   */
  pause() {
    this.setPaused(true)
    this.indexOracle.pause();
    this.markOracle.pause();
    this.positionInfo.pause();
  }

  /**
   * 恢复读取
   */
  resume() {
    this.setPaused(false)
    this.indexOracle.resume();
    this.markOracle.resume();
    this.positionInfo.resume();
  }

  setWallet(wallet) {
    this.wallet = wallet;
  }

  setConfigs(configs) {
    if (type.isOption) {
      this.setOptionConfigs(configs)
    }
    this.configs = configs
  }

  setOptionConfigs(configs) {
    this.optionsConfigs = this.groupConfigBySymbol(configs)
  }

  groupConfigBySymbol(configs = []) {
    return configs.reduce((total, config) => {
      const symbol = config.symbol.split('-')[0]
      if (!total[symbol]) {
        total[symbol] = []
      }
      total[symbol].push(config)
      return total;
    }, [])
  }

  setConfig(config) {
    //just for v2 and lite version in futrue
    if (type.isFuture && (version.isV2 || version.isV2Lite)) {
      config.markpriceSymbolFormat = getMarkpriceSymbol(config)
    } else if(type.isOption){
      config.markpriceSymbolFormat = getMarkpriceSymbol(config)
    }
    this.config = config
    this.setPriceDecimals(config)
  }

  setPriceDecimals(config) {
    if (config && config.decimals) {
      this.priceDecimals = config.decimals
    } else {
      this.priceDecimals = 2
    }
  }

  setIndex(index) {
    this.index = index;
  }

  setMarkPrice(markPrice) {
    this.markPrice = markPrice;
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

  setVolume(volume) {
    this.volume = volume;
  }

  setPaused(paused) {
    this.paused = paused
  }

  setUserSelectedDirection(direction) {
    this.userSelectedDirection = direction
  }

  setSlideMargin(slideIncrementMargin) {
    if (slideIncrementMargin !== '') {
      this.slideIncrementMargin = slideIncrementMargin
      const position = this.position;
      const price = position.price || this.index
      const increment = slideIncrementMargin - position.marginHeld
      let MarginRatio = type.isOption ? this.contract.initialMarginRatio : this.contract.minInitialMarginRatio;
      let volume = bg(increment).div(bg(bg(price).times(bg(this.contract.multiplier).times(bg(MarginRatio))))).toString()
      volume = +volume * +this.contract.multiplier
      let multiplier = this.contract.multiplier
      if (multiplier <= 1) {
        let index = this.contract.multiplier.indexOf('.')
        let num = this.contract.multiplier.slice(index);
        let length = num.length
        let value = volume.toString()
        if (value.indexOf(".") !== -1) {
          value = value.substring(0, value.indexOf(".") + length)
        }
        this.setVolume(value)
      } else {
        let length = multiplier.length - 1
        let value = parseInt(volume).toString()
        let num = value.slice(-length);
        value = value.slice(0, -length)
        num = num.replace(/\d/gi, '0')
        value = value + num
        this.setVolume(value)
      }

    }
  }

  clean() {
    this.pause();
    this.indexOracle.clean();
    this.markOracle.clean();
    this.positionInfo.clean();
    this.version = null;
    this.config = null;
    this.markPrice = ''
    this.index = ''
    this.volume = ''
    this.fundingRate = {}
    this.volatility = ''
    this.position = {}
    this.positions = []
    this.contract = {}
    this.history = []
    this.userSelectedDirection = 'long'
  }

  get volumeDisplay() {
    if ((type.isFuture && Math.abs(this.volume) === 0 && isNaN(this.volume)) || this.volume === '' || this.volume === '-' || this.volume === 'e') {
      return '';
    } else {
      return Math.abs(this.volume)
    }
  }


  get amount() {
    const position = this.position
    const contract = this.contract;
    let initVolume = this.volume === '' || isNaN(this.volume) ? 0 : Math.abs(this.volume)
    // let optionVolume = type.isOption ? (+initVolume / +this.contract.multiplier):initVolume;
    let optionVolume = (+initVolume / +this.contract.multiplier);
    const volume = optionVolume
    let { margin, marginHeldBySymbol: currentSymbolMarginHeld, marginHeld, unrealizedPnl } = position
    const price = position.price || this.index
    //v2
    let otherMarginHeld = bg(marginHeld).minus(currentSymbolMarginHeld)
    otherMarginHeld = otherMarginHeld.isNaN() ? bg(0) : otherMarginHeld;
    const contractValue = volume * price * contract.multiplier;
    const incrementMarginHeld = type.isOption ? contractValue * contract.initialMarginRatio : contractValue * contract.minInitialMarginRatio
    let totalMarginHeld = bg(marginHeld);

    //如果当前仓位为正仓用户做空或者当前仓位为负仓用户做多，总仓位相减,取绝对值
    if ((this.isPositive && this.userSelectedDirection === 'short') || (this.isNegative && this.userSelectedDirection === 'long')) {
      totalMarginHeld = totalMarginHeld.minus(incrementMarginHeld);
      if (totalMarginHeld.lt(otherMarginHeld)) {
        totalMarginHeld = otherMarginHeld.plus(otherMarginHeld.minus(totalMarginHeld).abs())
      }
      currentSymbolMarginHeld = bg(currentSymbolMarginHeld).minus(incrementMarginHeld).abs().toFixed(2)
    } else {
      totalMarginHeld = bg(marginHeld).plus(incrementMarginHeld)
      if (currentSymbolMarginHeld) {
        currentSymbolMarginHeld = bg(currentSymbolMarginHeld).plus(incrementMarginHeld).toFixed(2);
      }
    }

    const dynBalance = margin && bg(margin).plus(unrealizedPnl).toFixed(2);
    //总保证金和当前symbol保证金不能超过余额
    totalMarginHeld = totalMarginHeld.gt(dynBalance) ? dynBalance : totalMarginHeld.toFixed(2)
    if (currentSymbolMarginHeld) {
      currentSymbolMarginHeld = (+currentSymbolMarginHeld) > (+dynBalance) ? dynBalance : (+currentSymbolMarginHeld).toFixed(2);
    }
    let available = bg(dynBalance).minus(totalMarginHeld).toFixed(2)
    const exchanged = bg(volume).multipliedBy(contract.multiplier).toFixed(4)
    const totalVolume = this.userSelectedDirection === 'short' ? (-this.volumeDisplay + (+position.volume)) : ((+this.volumeDisplay) + (+position.volume))
    const totalContractValue = (+totalVolume) * price
    const curContractValue = (+this.volumeDisplay) * price
    const leverage = Math.abs(curContractValue / (+dynBalance)).toFixed(1);
    const afterLeverage = Math.abs((+totalContractValue) / (+dynBalance)).toFixed(1);
    available = (+available) < 0 ? 0 : available
    return {
      volume: this.volume,
      dynBalance: dynBalance,
      margin: totalMarginHeld,
      available: available,
      exchanged: exchanged,
      currentSymbolMarginHeld: currentSymbolMarginHeld,
      leverage: leverage,
      afterLeverage: afterLeverage
    }
  }

  get direction() {
    // 正仓
    if (this.margin !== '') {
      if ((+this.position.volume) > 0) {
        if (Math.abs(this.volume) > Math.abs(this.position.volume)) {
          return 'long'
        } else {
          return 'short'
        }
      } else if ((+this.position.volume) < 0) {
        //负仓
        if ((+this.volume) > Math.abs(+this.position.volume)) {
          return 'short'
        } else {
          return 'long'
        }
      }
    }
    return 0
  }

  //正仓
  get isPositive() {
    return bg(this.position.volume).gt(0);
  }

  //负仓
  get isNegative() {
    return bg(this.position.volume).isNegative();
  }

  //资金费率
  async loadFundingRate(wallet, config, isOption) {
    if (config) {
      const chainId = wallet && wallet.isConnected() && wallet.isSupportChain(isOption) ? wallet.detail.chainId : getDefaultNw(DeriEnv.get()).id
      if (config) {
        const res = await getFundingRate(chainId, config.pool, config.symbolId).catch(e => console.error('getFundingRate was error,maybe network is wrong'))
        return res;
      }
    }
  }

  get fundingRateTip() {
    if (version && version.isV2) {
      if (this.fundingRate && this.fundingRate.fundingRatePerBlock && this.config) {
        if (Intl.locale === 'zh') {
          return `${Intl.get('lite', 'funding-rate-per-block')} = ${this.fundingRate.fundingRatePerBlock}` +
            `\n ${Intl.get('lite', 'per-block')} ${Intl.get('lite', '1-long-contract-pays-1-short-contract')} (${this.fundingRate.fundingRatePerBlock} * ${Intl.get('lite', 'index-price-camelize')} * ${this.contract.multiplier} ) ${this.config.bTokenSymbol}`
        } else {
          return `${Intl.get('lite', 'funding-rate-per-block')} = ${this.fundingRate.fundingRatePerBlock}` +
            `\n${Intl.get('lite', '1-long-contract-pays-1-short-contract')} (${this.fundingRate.fundingRatePerBlock} * ${Intl.get('lite', 'index-price-camelize')} * ${this.contract.multiplier} ) ${this.config.bTokenSymbol} ${Intl.get('lite', 'per-block')}`
        }

      }
    } else {
      if (this.fundingRate && this.fundingRate.fundingRatePerBlock && this.config) {
        if (Intl.locale === 'zh') {
          return `${Intl.get('lite', 'funding-rate-per-block')} = ${this.fundingRate.fundingRatePerBlock}` +
            `\n${Intl.get('lite', 'per-block')} ${Intl.get('lite', '1-long-contract-pays-1-short-contract')} ${this.fundingRate.fundingRatePerBlock} ${this.config.bTokenSymbol} `
        } else {
          return `${Intl.get('lite', 'funding-rate-per-block')} = ${this.fundingRate.fundingRatePerBlock}` +
            `\n${Intl.get('lite', '1-long-contract-pays-1-short-contract')} ${this.fundingRate.fundingRatePerBlock} ${this.config.bTokenSymbol} ${Intl.get('lite', 'per-block')})`
        }
      }
    }
    return ''
  }

  get optionFundingRateTip() {
    if (this.fundingRate && this.fundingRate.premiumFundingPerSecond && this.config) {
      if (Intl.locale === 'zh') {
        return `${Intl.get('lite', 'funding-rate-per-second')} = ${this.fundingRate.premiumFundingPerSecond}` +
          `\n ${Intl.get('lite', 'per-second')} ${Intl.get('lite', '1-long-contract-pays-1-short-contract')} ${this.fundingRate.premiumFundingPerSecond} ${this.config.bTokenSymbol} `
      } else {
        return `${Intl.get('lite', 'funding-rate-per-second')} = ${this.fundingRate.premiumFundingPerSecond}` +
          `\n${Intl.get('lite', '1-long-contract-pays-1-short-contract')} ${this.fundingRate.premiumFundingPerSecond} ${this.config.bTokenSymbol} ${Intl.get('lite', 'per-second')}`
      }
    }
    return ''
  }
  get dpmmFundingRateTip() {
    if (this.fundingRate && this.fundingRate.fundingPerSecond && this.config) {
      if (Intl.locale === 'zh') {
        return `${Intl.get('lite', 'funding-rate-per-second')} = ${this.fundingRate.fundingPerSecond}` +
          `\n ${Intl.get('lite', 'per-second')} ${Intl.get('lite', '1-long-contract-pays-1-short-contract')} ${this.fundingRate.fundingPerSecond} ${this.config.bTokenSymbol} `
      } else {
        return `${Intl.get('lite', 'funding-rate-per-second')} = ${this.fundingRate.fundingPerSecond}` +
          `\n${Intl.get('lite', '1-long-contract-pays-1-short-contract')} ${this.fundingRate.fundingPerSecond} ${this.config.bTokenSymbol} ${Intl.get('lite', 'per-second')}`
      }
    }
    return ''
  }

  get rateTip() {
    if (this.fundingRate && this.fundingRate.funding0 && this.markPrice) {
      return `${Intl.get('lite', 'rate-hover-one')} ${bg(this.fundingRate.funding0).div(bg(this.markPrice)).times(bg(100)).toString()}% ${Intl.get('lite', 'rate-hover-two')}`
    }
    return ''
  }

  get fundingCoefficientTip() {
    if (this.contract && this.contract.fundingRateCoefficient && this.config.unit) {
      if (Intl.locale === 'zh') {
        return `1${this.config.unit} ${Intl.get('lite', 'funding-coefficient-hove-one')} ${Intl.get('lite', 'funding-coefficient-hove-two')}${this.contract.fundingRateCoefficient} ${Intl.get('lite', 'funding-coefficient-hove-three')} ${bg(this.contract.fundingRateCoefficient).times(bg(86400)).toString()} ${Intl.get('lite', 'per-day')}
      `
      } else {
        return `${Intl.get('lite', 'funding-coefficient-hove-one')} ${this.config.unit} ${Intl.get('lite', 'funding-coefficient-hove-two')} ${this.contract.fundingRateCoefficient} ${Intl.get('lite', 'funding-coefficient-hove-three')} ${bg(this.contract.fundingRateCoefficient).times(bg(86400)).toString()} ${Intl.get('lite', 'per-day')}
      `
      }

    }
    return ''
  }

  get initialMarginRatioTip() {
    if (this.contract && this.contract.initialMarginRatioOrigin) {
      return `${Intl.get('lite', 'in-the-money-initial')} = ${this.contract.initialMarginRatioOrigin}` +
        `\n${Intl.get('lite', 'out-of-money-initial')} = ${Intl.get('lite', 'in-max')}(${this.contract.initialMarginRatioOrigin}${Intl.get('lite', 'otm-ratio-initial')} ${this.contract.initialMarginRatioOrigin / 10})` +
        `\n\n${Intl.get('lite', 'otm-ratio-max')}`
    }
    return ''
  }
  get maintenanceMarginRatioTip() {
    if (this.contract && this.contract.maintenanceMarginRatioOrigin) {
      return `${Intl.get('lite', 'in-the-money-maintenance')} = ${this.contract.maintenanceMarginRatioOrigin}` +
        `\n${Intl.get('lite', 'out-of-money-maintenance')} = ${Intl.get('lite', 'in-max')}(${this.contract.maintenanceMarginRatioOrigin}${Intl.get('lite', 'otm-ratio-maintenance')} ${this.contract.maintenanceMarginRatioOrigin / 10})` +
        `\n\n${Intl.get('lite', 'otm-ratio-max')}`
    }
    return ''
  }

  get multiplierTip() {
    if (this.contract && this.config) {
      return `${Intl.get('lite', 'the-notional-value-of')} ${this.contract.multiplier}${this.config.unit}`
    }
    return ''
  }

  get TransactionFeeTip() {
    if (this.contract && (this.contract.feeRatioITM && this.contract.feeRatioOTM)) {
      return `${Intl.get('lite', 'transaction-fee-tip-in-the-money')} ${this.contract.underlier} ${Intl.get('lite', 'price')}  * ${bg(this.contract.feeRatioITM).times(bg(100)).toString()} %` +
        `\n ${Intl.get('lite', 'transaction-fee-tip-out-of-money')} * ${bg(this.contract.feeRatioOTM).times(bg(100)).toString()} %`
    }
    return ''
  }
  get TotalNetPositionTip() {
    if (this.contract && this.fundingRate.tradersNetVolume && this.config) {
      return `${Intl.get('lite', 'notional-of-total-net-position')} ${this.fundingRate.tradersNetVolume} ${this.config.unit}`
    }
    return ''
  }

}