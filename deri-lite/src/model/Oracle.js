import { makeAutoObservable, observable, action} from "mobx";
import { equalIgnoreCase } from "../utils/utils";
import webSocket from "./WebSocket";

class Oracle {
  symbol = null
  timeType = 'min'
  index = 0.00
  kData = []
  ws = null
  paused = false;
  listeners = {}

  constructor(){
    makeAutoObservable(this,{
      index : observable,
      kData : observable,
      setIndex : action,
    })
  }

  load(symbol,timeType = 'min'){    
    if(this.symbol === null || (this.symbol !== symbol && this.timeType !== timeType)) {
      webSocket.subscribe('get_kline_update',{symbol,time_type : 'min'},data => {
        if(!this.paused && equalIgnoreCase(symbol,data.symbol)) {
          this.setIndex(data.close)
          for(const key of Object.keys(this.listeners)){
            if(typeof this.listeners[key] === 'function'){
              this.listeners[key](data)
            }
          }
        }
      })
    }

    this.setSymbol(symbol)
    this.setTimeType(timeType);
  }

  addListener(id,listener){
    if(!this.listeners[id]) {
      this.listeners[id] = listener
    }    
  }

  unsubscribeBars(symbol){
    symbol && webSocket.unsubscribe('un_get_kline',{symbol : symbol,time_type : 'min'});
  }


  resume(){
    this.setPause(false)
  }

  pause(){
    this.setPause(true)
  }

  clean(){
    this.unsubscribeBars(this.symbol);
    this.symbol = null
  }

  setIndex(index){
    if(!this.paused) {
      this.index = index;
    }
  }

  setSymbol(symbol){
    this.symbol = symbol
  }

  setTimeType(timeType){
    this.timeType = timeType;
  }
  setPause(paused){
    this.paused = paused
  }
}

export default Oracle