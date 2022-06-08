import { makeAutoObservable, observable, action, runInAction } from "mobx";
import axios from "axios";
import { DeriEnv,deriToNatural } from "../lib/web3js/indexV2";
import config from '../config.json'

const oracleConfig = config[DeriEnv.get()]['oracle']

const CancelToken = axios.CancelToken;

export default class IndexPrice {
  index = 0.00
  source = CancelToken.source();
  cancel = false

  constructor(){
    makeAutoObservable(this,{
      index : observable,
      setIndex : action,
      setCancel : action,
      setSource : action
    })
  }


  async loadIndex(symbol) {
    if(symbol){
      const url = oracleConfig[symbol.toUpperCase()]
      const res = await axios.get(url,{ 
        params : {
          symbol : symbol
        },
        cancelToken: this.source.token,
      })
      if(res && res.data && this.cancel === false){      
        this.setIndex(deriToNatural(res.data.price).toFixed(2))
      }
    }     
  }

  setIndex(index){
    this.index = index;
  }

  setCancel(cancel){
    this.cancel = cancel
  }

  setSource(source){
    this.source = source
  }

  start(symbol){
    if(!this.inteval) {
      this.setCancel(false);
      this.setSource(CancelToken.source());
      this.inteval = setInterval(() => this.loadIndex(symbol),1000)
    }
  }


  pause() {
    this.setCancel(true);
    this.source.cancel();
    clearInterval(this.inteval)
    this.inteval = null;
  }
}