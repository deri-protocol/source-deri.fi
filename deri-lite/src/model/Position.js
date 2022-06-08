import { getPositionInfo ,bg,getPositionInfos, DeriEnv} from "../lib/web3js/indexV2"
import { eqInNumber, getDefaultNw } from '../utils/utils';
import type from "./Type";

export default class Position {

   callback = () => {}
   callbackALL = ()=>{}
   wallet = null;
   spec = null
   counter = 0
 
   mockPositionInfo = {
    averageEntryPrice: "",
    liquidationPrice: "",
    margin: "20000",
    marginHeld: "10068.26538",
    marginHeldBySymbol : "293.16152",
    unrealizedPnl: "3.1311",
    volume: "800",
    premiumFundingAccrued:'',
    deltaFundingAccrued:'',
    strikePrice:0,
    timePrice:0,
    volatility:0,
    isCall:false,
   }

   async load(wallet,spec,callback){
     this.wallet= wallet; 
     this.spec = spec
     if(callback){
      this.callback = callback
     }
     if(spec && spec.pool){
      const chainId = wallet && wallet.detail ? wallet.detail.chainId : getDefaultNw(DeriEnv.get()).id
      const account = wallet && wallet.detail ? wallet.detail.account : null;
      const position = await getPositionInfo(chainId,spec.pool,account,spec.symbolId)
      if(position){
        if(this.callback){
          this.callback(position)
        }
      }
      return position;
     }
   }

   async loadAll(wallet,spec,callback){
    this.wallet= wallet; 
    this.spec = spec
    if(callback){
      this.callbackALL = callback
    }
    if(spec && spec.pool){
      const chainId = wallet && wallet.detail ? wallet.detail.chainId : getDefaultNw(DeriEnv.get()).id
      const account = wallet && wallet.detail ? wallet.detail.account : null;
      let res  = await getPositionInfos(chainId,spec.pool,account,spec.symbolId)
      let positions = [] 
      if(res.length) {
        positions = res.map(item => {
          item.balanceContract = bg(item.margin).plus(item.unrealizedPnl).toString()
          item.direction = (+item.volume) > 0 ? 'LONG' : (!item.volume || eqInNumber(item.volume, 0) || !item.volume ? '--' : 'SHORT')
          return item
        })
      }
      if(positions){
        if(this.callbackALL){
          this.callbackALL(positions)
        }
      }
      return positions;
    }
   } 

   startAll(){
    this.paused = false;
    if(!this.started){
      this.runInAction(async () => await this.loadAll(this.wallet,this.spec))
    }
    this.started = true
  }

   start(){   
    this.paused = false;
    if(!this.startedAll){
      this.runInAction(async () => await this.load(this.wallet,this.spec))
    }
    this.startedAll = true
   }

   runInAction(action){
    this.timer = window.setTimeout(async () => {
      if(!this.paused){
        const position = await action();
        if(position) {
          this.runInAction(action);
        }
      }
    },3000)
   }

   pause(){
    this.paused = true
   }

   resume(){
    this.clean();
    this.start(this.callback)
   }

   clean(){
     this.started = false;
     this.startedAll = false;
     this.paused = false;
     this.timer = null;
   }
 
}