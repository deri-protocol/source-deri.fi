import { makeObservable, observable, action } from "mobx";
import { getContractAddressConfig, DeriEnv, sortOptionSymbols } from "../lib/web3js/index";

export default class Config {
  all = []

  constructor() {
    makeObservable(this, {
      all: observable,
      setAll: action
    })
  }

  async load(version, isOptions) {
    let current = version && version.current;
    if (isOptions) {
      current = 'option'
    }
    let configs = await getContractAddressConfig(DeriEnv.get())
    if (configs.success) {
      let configList = configs.response.data
      if (isOptions) {
        configList = sortOptionSymbols(configList)
      }
      this.setAll(configList)
    }
    return this.all;
  }

  setAll(all) {
    this.all = all;
  }

}