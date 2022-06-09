import { getPositionInfo, bg, getPositionInfos, DeriEnv } from "../lib/web3js/index"
import { eqInNumber, getDefaultNw } from '../utils/utils';
import type from "./Type";

export default class Position {

  callback = () => { }
  callbackALL = () => { }
  wallet = null;
  spec = null
  counter = 0

  mockPositionInfo = {
    averageEntryPrice: "",
    liquidationPrice: "",
    margin: "20000",
    marginHeld: "10068.26538",
    marginHeldBySymbol: "293.16152",
    unrealizedPnl: "3.1311",
    volume: "800",
    premiumFundingAccrued: '',
    deltaFundingAccrued: '',
    strikePrice: 0,
    timePrice: 0,
    volatility: 0,
    isCall: false,
  }

  async load(wallet, symbolInfo, callback) {
    this.wallet = wallet;
    this.spec = symbolInfo
    if (callback) {
      this.callback = callback
    }
    if (symbolInfo && symbolInfo.pool) {
      const chainId = wallet && wallet.detail ? wallet.detail.chainId : getDefaultNw(DeriEnv.get()).id
      const account = wallet && wallet.detail ? wallet.detail.account : null;
      const position = await getPositionInfo(chainId, symbolInfo.pool, account, symbolInfo.symbol)
      if (position) {
        if (this.callback) {
          this.callback(position)
        }
      }
      return position;
    }
  }

  start() {
    this.paused = false;
    if (!this.startedAll) {
      this.runInAction(async () => await this.load(this.wallet, this.spec))
    }
    this.startedAll = true
  }

  runInAction(action) {
    this.timer = window.setTimeout(async () => {
      if (!this.paused) {
        const position = await action();
        if (position) {
          this.runInAction(action);
        }
      }
    }, 3000)
  }

  pause() {
    this.paused = true
  }

  resume() {
    this.clean();
    this.start(this.callback)
  }

  clean() {
    this.started = false;
    this.startedAll = false;
    this.paused = false;
    this.timer = null;
  }

}