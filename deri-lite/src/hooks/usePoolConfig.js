import React, { useState, useEffect } from 'react'
import { getPoolConfigList } from '../lib/web3js/api_wrapper/config_api'
import {
  DeriEnv,
  getContractAddressConfig,
  getPoolLiquidity,
  getPoolInfoApy,
  getLpContractAddressConfig,
  getLpPoolInfoApy,
  getPreminingContractConfig,
  getUserInfoAll,
  getLiquidityInfo,
  openConfigListCache,
  getPoolOpenConfigList
} from '../lib/web3js/indexV2'
import config from '../config.json'
import { formatAddress, isLP, isSushiLP, isCakeLP } from '../utils/utils';

const env = DeriEnv.get();
const { chainInfo } = config[env]

export function usePoolConfig({type}){
  const [poolConfig, setPoolConfig] = useState([])

  const mapPool = async poolConfig => {
    const {chainId,pool,bTokenId} = poolConfig;
    const liqInfo = await getPoolLiquidity(chainId,pool,bTokenId) || {}
    const poolParam = await getPoolInfoApy(chainId,pool,bTokenId) || {}
    const address = poolConfig.pool

    //slp
    let lpApy,label;
    if(poolConfig.isLp){
      let lapy = await getLpPoolInfoApy(chainId,pool);
      lpApy = lapy && ((+lapy.apy2) * 100).toFixed(2);           
    }
    if(isSushiLP(pool)){
      label = Intl.get('mining','sushi-apy')
    }
    if(isCakeLP(pool)){
      label = Intl.get('mining','cake-apy')
    }
    const item = { 
      network : chainInfo[config.chainId] && chainInfo[config.chainId].name,
      liquidity : liqInfo.liquidity,
      apy :  ((+poolParam.apy) * 100).toFixed(2),//percent
      lpApy : lpApy,
      formatAdd : formatAddress(address),
      address : address,
      type : isLP(address) ? 'lp' : 'perpetual',
      buttonText : 'STAKING',
      multiplier : poolParam.multiplier,
      label : label
    }
    return {...config,...item}
  }

  //按照池子的标签分类，标签：v2、v2_lite、v2_lite_open、options,lp
  const groupByVersion = poolConfigs => {
    return poolConfigs.reduce((total,config) => {
      const key = config.isLP ? 'lp' : config.version
      if(!total[key]){
        total[key] = []
      }
      total[key].push(config)
      return total;
    },{})
  }

  useEffect(() => {
    let configs ;
    if(type){
      configs = getPoolConfigList(type)
    } else {
      configs = getPoolConfigList()
    }
    const slpConfigs = getLpContractAddressConfig();
    const all = [...configs,...slpConfigs]
    const airDrop = {
      network : 'BSC',
      bTokenSymbol : 'GIVEAWAY',
      liquidity : '6048',
      symbol : '--',
      airdrop : true,
      chainId : 56,
      buttonText : 'CLAIM'
    }
    all.push(airDrop)
    configs = groupByVersion(all);
    const keys = Object.keys(configs);
    for(let i = 0 ; i < keys.length; i++){
       configs[keys[i]].map(mapPool)
    }
    setPoolConfig(all);

  }, [type])
  return poolConfig;
}