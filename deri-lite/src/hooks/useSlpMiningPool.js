import {useState,useEffect} from 'react';

import {
  getPoolLiquidity,
  getSlpContractAddressConfig,
  getSlpPoolInfoApy,
  DeriEnv
} from '../lib/web3js/indexV2'
import { deriNatural} from '../utils/utils';

const env = DeriEnv.get();

export default function useSlpMiningPool(){
  const [slpPools, setSlpPools] = useState([])

  useEffect(() => {
    const slpConfig = getSlpContractAddressConfig(env).map(async config => {
      const liqPool = await getPoolLiquidity(config.chainId,config.pool);
      const apyPool = await getSlpPoolInfoApy(config.chainId,config.pool)
      let sushiApy =  0.22008070161007/liqPool.liquidity;
      sushiApy = (sushiApy * 100).toFixed(2) + "%";
      let deriapy = deriNatural(apyPool.apy)
      if (deriapy == "0") {
        deriapy = "--";
      } else {
        deriapy = (deriapy * 100).toFixed(2) + "%";
      }
      return Object.assign(config,{
        deriapy,
        sushiApy,
        bTokenSymbol : 'DERI-USDT SLP'
      })
    })
    Promise.all(slpConfig).then(pools => {
      setSlpPools(pools)
    })
    return () => {
      slpPools.length = 0
    }
  },[])

  return slpPools;
}