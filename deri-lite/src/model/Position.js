import { getPositionInfo, bg, getPositionInfos, DeriEnv } from "../lib/web3js/index"
import { eqInNumber, getDefaultNw, greaterThan } from '../utils/utils';
import type from "./Type";
import ApiProxy from "./ApiProxy";
import { makeObservable, observable, action } from "mobx";
import { VERSION_V3, VERSION_V2_LITE } from "../utils/Constants";

export default class Position {
  callback = () => { }
  wallet = null;
  symbolInfo = null


  async load(wallet, symbolInfo, callback) {
    this.wallet = wallet;
    this.symbolInfo = symbolInfo
    let position = {}
    if (callback) {
      this.callback = callback
    }
    if (symbolInfo && symbolInfo.address && wallet.supportCurNetwork) {
      const chainId = wallet.isConnected() && wallet.supportCurNetwork ? wallet.detail.chainId : getDefaultNw(DeriEnv.get()).id
      const account = wallet.isConnected() && wallet.supportCurNetwork ? wallet.detail.account : null;
      const symbolParam = symbolInfo.isAllV3 ? symbolInfo.symbol : symbolInfo.symbolId
      position = await ApiProxy.request('getPositionInfo', [chainId, symbolInfo.address, account, symbolParam])
    }
    if (this.callback) {
      this.callback(position)
    }
    return position
  }

  wrapperForDisplay(item) {
    item.balanceContract = bg(item.margin).plus(item.unrealizedPnl).toString()
    item.direction = greaterThan(item.volume, 0) ? 'Long' : (!item.volume || eqInNumber(item.volume, 0) || !item.volume ? '--' : 'Short')
    if (item.direction === 'Long') {
      item.directionColor = 'green'
    } else if (item.direction === 'Short') {
      item.directionColor = 'red'
    }
    if (greaterThan(item.unrealizedPnl, 0)) {
      item.unrealizedPnlColor = 'green'
    } else {
      item.unrealizedPnlColor = 'red'
    }

    if (greaterThan(item.fundingFee, 0)) {
      item.fundingFeeColor = 'green'
    } else {
      item.fundingFeeColor = 'red'
    }

    if (item.volume) {
      item.notional = bg(Math.abs(item.volume)).times(item.price).toString();
      item.notionalColor = 'gray'
    }
    if (item.markPrice && item.averageEntryPrice) {
      item.unrealizedPnlRate = bg(item.unrealizedPnl).div(Math.abs(item.cost)).times(100).toString();
      item.unrealizedPnlRateColor = 'gray'
    }
    item['fundingFee'] = -item['fundingFee']
    const symboleInArray = item.symbol.split('-')
    item['isOptions'] = symboleInArray.length > 1 ? true : false
    item['underlier'] = symboleInArray[0]
    return item;
  }


  start() {
    this.paused = false;
    if (!this.startedAll) {
      this.runInAction(async () => await this.load(this.wallet, this.symbolInfo))
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