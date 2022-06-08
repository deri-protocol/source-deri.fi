import { getTradeHistory } from "../lib/web3js/indexV2";


export default class History {

   async load(wallet,config,isOptions){
      if(wallet && wallet.isSupportChain(isOptions) && wallet.detail.chainId && config && config.pool){
         const all = await getTradeHistory(wallet.detail.chainId,config.pool,wallet.detail.account,config.symbolId); 
         return all;
      } else {
         return []
      }
   }
}