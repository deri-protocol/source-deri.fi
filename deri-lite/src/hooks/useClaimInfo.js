import { useState, useEffect } from 'react'
import { getUserInfoAll ,deriToNatural} from '../lib/web3js/indexV2';


export default function useClaimInfo(wallet){
  const [claimInfo, setClaimInfo] = useState({});
  let interval = null;

  const loadClaimInfo =  async () => {
    if(wallet.isConnected()){
      const claimInfo  = await getUserInfoAll(wallet.detail.account);
      const claimed = (+claimInfo.total).toFixed(2);
      const unclaimed = claimInfo.valid ? (+claimInfo.amount).toFixed(2) : 0;
      const harvestDeriLp = (+claimInfo.lp).toFixed(2);
      const harvestDeriTrade = (+claimInfo.trade).toFixed(2);
      const chainId = claimInfo.chainId
      setClaimInfo({claimed,unclaimed,harvestDeriLp,harvestDeriTrade,chainId})
    }
  }

  useEffect(() => {
    interval = window.setInterval(loadClaimInfo,1000 * 60 *3);
      loadClaimInfo();
    return () => clearInterval(interval);
  }, [wallet.detail.account])
  return [claimInfo,interval];
}