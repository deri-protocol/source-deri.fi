import { useState, useEffect } from 'react';
import {
  DeriEnv,
  getContractAddressConfig,
  getPoolLiquidity,
  getPoolInfoApy,
  getLpContractAddressConfig,
  getLpPoolInfoApy,
  getPreminingContractConfig
} from '../lib/web3js/indexV2'
import config from '../config.json'
import { formatAddress, isLP, isSushiLP, isCakeLP, eqInNumber, groupByNetwork, combineSymbolfromPoolConfig, mapPoolInfo } from '../utils/utils';
import Intl from '../model/Intl';
import { version } from '@babel/core';


const env = DeriEnv.get();
const { chainInfo } = config[env]

export default function useMiningPool(isNew,wallet,retired){
  const [loaded,setLoaded] = useState(false)
  const [pools, setPools] = useState([])
  const [v1Pools, setV1Pools] = useState([])
  const [v2Pools, setV2Pools] = useState([])
  const [optionPools, setOptionPools] = useState([])
  const [legacyPools, setLegacyPools] = useState([])
  const [preminingPools, setPreminingPools] = useState([])


  useEffect(() => {
    const loadConfig = async () => {
      let v2Configs = getContractAddressConfig(env,'v2')
      const liteConfigs = getContractAddressConfig(env,'v2_lite')
      const optionConfigs = getContractAddressConfig(env,'option')
      let configs = v2Configs.concat(liteConfigs).concat(optionConfigs);
      if(retired){
        let v1Configs = getContractAddressConfig(env,'v1')
        const preminingPools = getPreminingContractConfig(env);
        configs = configs.concat(preminingPools);
        configs = configs.concat(v1Configs)
      }
      configs = combineSymbolfromPoolConfig(configs);
      configs = configs.map((config) => mapPoolInfo(config,wallet,chainInfo))

      const slpConfig = getLpContractAddressConfig(env).map(async config => {
        // const liqInfo = await getPoolLiquidity(config.chainId,config.pool) || {}
        // const apyPool = await getPoolInfoApy(config.chainId,config.pool) || {} 
        const pool = config.pool || ''      
        let lpApy;
        let label;
        if(isLP(config.pool)){
          // let lapy = await getLpPoolInfoApy(config.chainId,config.pool);
          // lpApy = lapy && ((+lapy.apy2) * 100).toFixed(2);           
        }
        if(isSushiLP(config.pool)){
          label = Intl.get('mining','sushi-apy')
        }
        if(isCakeLP(config.pool)){
          label = Intl.get('mining','cake-apy')
        }
        return Object.assign(config,{
          network : chainInfo[config.chainId].name,
          // liquidity : liqInfo.liquidity,
          // apy : ((+apyPool.apy) * 100).toFixed(2),
          formatAdd : formatAddress(pool),
          // lpApy : lpApy,
          address : pool,
          type : 'lp',
          label:label,
          buttonText : 'STAKING'
        })    
      })
      const allConfigs = configs.concat(slpConfig)
      Promise.all(allConfigs).then(pools => {
        const airDrop = {
          network : 'BSC',
          bTokenSymbol : 'GIVEAWAY',
          liquidity : '5500',
          symbol : '--', 
          airdrop : true,
          chainId : 56,
          apy : '--',
          buttonText : 'CLAIM'
        }
        let timestamp = new Date()
        //1637316000
        if(timestamp.getTime() <= 1637316000000){
          pools.push(airDrop)
        }
        let v1Pools = pools.filter(p => (p.version === 'v1' || !p.version) && !p.retired)
        let v2Pools = pools.filter(p => (p.version === 'v2' || p.version === 'v2_lite' || p.version === 'v2_lite_dpmm'  ) && !p.retired)
        let optionPools = pools.filter(p => (p.version === 'option') && !p.retired)
        const legacy = pools.filter(p => p.retired && !p.premining && p.version !== 'v2' && p.version !== 'v2_lite' && p.version !== 'option')
        const preminings = pools.filter(p =>  p.retired && p.premining) 
        let openPools = pools.filter(p => p.isOpen)
        
        //新版本按照网络来分组
        if(isNew){
          v1Pools = groupByNetwork(v1Pools);
          v2Pools = groupByNetwork(v2Pools);
          optionPools =groupByNetwork(optionPools)
          openPools = groupByNetwork(openPools)
        }
        setV2Pools(v2Pools);
        setV1Pools(v1Pools);
        setOptionPools(optionPools)
        setPools(pools);
        setLegacyPools(legacy);
        setPreminingPools(preminings)
        setLoaded(true)
      })
    }
    loadConfig();
    return () => pools.length = 0
  }, [])
  return [loaded, pools, v1Pools, v2Pools, optionPools, legacyPools, preminingPools];
}