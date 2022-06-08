import { useWallet } from "use-wallet";
import { importAll,getEnv, eqInNumber } from "../utils/utils";
import {useEffect, useState} from 'react'

const configs =  importAll(require.context('../config/',true,/chain.*.json/))

export default function useChain(){
  const wallet = useWallet();
  const [chains, setChains] = useState([]);
  useEffect(() => {
    if(wallet.isConnected()) {
      const c = configs[getEnv()].sort((c1,c2) => {
        if(eqInNumber(c1.chainId,wallet.chainId) && !eqInNumber(c2.chainId,wallet.chainId)) {
          return -1
        } else if(!eqInNumber(c1.chainId,wallet.chainId) && eqInNumber(c2.chainId,wallet.chainId)) {
          return 1;
        } else {
          return 1
        }
      })
      setChains(c)
    } else if(wallet.status === 'disconnected') {
      const c = configs[getEnv()].sort((c1,c2) => c1.isDefault && !c2.isDefault ? -1 : !c1.isDefault && c2.isDefault  ? 1 : 0)
      setChains(c)
    }
  }, [wallet]);
  return chains
}