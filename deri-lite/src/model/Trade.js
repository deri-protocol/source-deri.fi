import { makeAutoObservable, observable, action, computed } from "mobx"
import { getPositionInfo } from "../lib/web3js/index";


export default class Trade {
  //index price
  index = '0.000'
  //specification
  spec = {}
  //trade info
  info = {}
  //position info
  position = {}

  constructor(){
    makeAutoObservable(this,{
        info : observable,
        position : observable,
        getIndex : action,
        getPosition : action,
      }
    )
  }

  init(wallet){
    //1.
  }

  //index changed
  freshIndex(index){

  }

  //switch spec
  switchSpec(symbol){

  }

  //volume changed
  onVolumeChange(volume){

  }

  //margin changed
  onMarginChange(margin){

  }


  /**
   * get current position 
   * @param {Wallet} wallet 
   * @param {Spec} spec 
   */
  async getPosition(wallet = {},spec = {}){
    const {detail = {}} = wallet
    const position = await getPositionInfo(detail.chainId,spec.pool,detail.account).catch(e => console.log(e));
    if(position){
      this.position = {...position}
    }
  }




}