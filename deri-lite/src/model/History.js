import { getTradeHistory } from "../lib/web3js/index";
import ApiProxy from "./ApiProxy";


export default class History {

   async load(wallet,symbolInfo,isOptions){
      if(wallet && wallet.isSupportChain(isOptions) && wallet.detail.chainId && symbolInfo && symbolInfo.address){
         const symbolParam = symbolInfo.isAllV3 ? symbolInfo.symbol : symbolInfo.symbolId
         const all = await ApiProxy.request('getTradeHistory',[wallet.detail.chainId,symbolInfo.address,wallet.detail.account,symbolParam]);
         return all;
      } else {
         return []
      }
   }
}