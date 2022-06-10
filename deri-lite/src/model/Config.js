import { makeObservable, observable, action } from "mobx";
import { getContractAddressConfig, DeriEnv, sortOptionSymbols } from "../lib/web3js/index";
import Pool from "./Pool"

export default class Config {
  all = []

  constructor() {
    makeObservable(this, {
      all: observable,
      setAll: action
    })
  }

  async load(version, Type) {
    let current = Type.current
    let pools = await getContractAddressConfig(DeriEnv.get())
    pools = pools.filter(p =>  p.versionId === version.current)
    pools.map(pool => new Pool(pool))
    this.setAll(pools)
    return this.all;
  }

  setAll(all) {
    this.all = all;
  }

}