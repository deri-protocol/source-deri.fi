import { observable, action, computed, makeObservable } from "mobx";
import Pool from './Pool'
import apiProxy from './ApiProxy'
import { DeriEnv, bg } from '../lib/web3js/index';
import {FUTURE,OPTION,POWER,FUTURES, VERSION_V3} from '../utils/Constants'
import blackList from "../blackList.json"
const openBlackList = blackList['openPoolList']
export default class PoolManager {
  pools = []
  lpPools = []
  openPools = []
  retiredPools = []
  constructor() {
    makeObservable(this, {
      pools: observable,
      retiredPools:observable,
      setPools: action,
      setLpPools: action,
      setRetiredPools:action,
      v2Pools: computed,
      v3Pools : computed,
      innoPools: computed,
      setOpenPools: action,
      optionsPools: computed,
      ammPools: computed,
      futurePools: computed
    })
  }

  async load() {
    const pools = await apiProxy.request('getPoolConfigList');
    this.loadDoubleMingingPool()
    const mapPools = pools.map(pool => new Pool(pool))
    let pool = mapPools.filter(pool => pool.retired)
    let sortPool = this.sortPool(mapPools)
    this.setPools(sortPool)
    this.setRetiredPools(pool)
    return sortPool;
  }


  sortPool(pool){
    let bscPool = []
    let polygonPool = [];
    let abrPool = []
    pool.map(pool=>{
      if(+pool.chainId === 42161 || +pool.chainId === 421611){
        abrPool.push(pool)
      }
      if(+pool.chainId === 56 || +pool.chainId === 97 ){
        bscPool.push(pool)
      }
      if(+pool.chainId === 137){
        polygonPool.push(pool)
      }
    })
    let sort = abrPool.concat(bscPool).concat(polygonPool)
    return sort
  }

  async loadByType(type) {
    let pools = await apiProxy.request('getPoolConfigList');
    return pools.filter(p => p.type.includes(type)).map(pool => new Pool(pool))
  }
  
  async loadAllPool(){
    const pools = await apiProxy.request('getPoolConfigList')
    return pools.map(pool => new Pool(pool));
  }

  async loadByCategory(category){
    let pools = await apiProxy.request('getPoolConfigList');
    return pools.filter(p => p.catetory === category)
  }

  async loadOpen() {
    const pools = await apiProxy.request('getPoolOpenConfigList');
    const mapPools = pools.map(pool => new Pool(pool))
    let openPools = mapPools.filter(p => !openBlackList.includes(p.address))
    this.setOpenPools(openPools)
    return mapPools
  }

  async loadDoubleMingingPool() {
    const pools = await apiProxy.request('getLpConfigList');
    if (pools.length) {
      const mapPools = pools.map(pool => new Pool(pool))
      this.setLpPools(mapPools)
      return mapPools;
    }
  }

  setPools(pools) {
    this.pools = pools;
  }
  setLpPools(pools) {
    this.lpPools = pools
  }
  setRetiredPools(pools){
    this.retiredPools = pools
  } 

  setOpenPools(pools) {
    this.openPools = pools
  }

  get ammPools() {
    return this.pools.filter(p => (p.type[0] !== 'lp' ) && (!p.retired || p.address=== '0x4ad5cb09171275A4F4fbCf348837c63a91ffaB04'))
  }

  get v2Pools() {
    return this.pools.filter(p => p.version === FUTURE)
  }

  get v3Pools(){
    return this.pools.filter(p => p.version === VERSION_V3)
  }

  get innoPools() {
    return []
  }

  get optionsPools() {
    return this.pools.filter(p => p.type.includes(OPTION))
  }

  get futurePools() {
    return this.pools.filter(p => p.type.includes(FUTURE))
  }


}