import * as apis from '../web3/index'
import { show, hide } from "react-functional-modal";
import ChainInteraction from "../components/ChainInteraction/ChainInteraction";
import {MODAL_OPTIONS} from '../utils/Constants'

class ApiProxy {
  async request(method,options = {}){
    let res = null;
    if(options.write) {
      const {subject} = options
      Object.assign(options,{
        onAccept : () => {
          this.onProcessing(subject,'success',options)
          window.setTimeout(() => this.close(subject),2000)
        },
        onReject : () => {
          this.onProcessing(subject,'reject',options)
          window.setTimeout(() => this.close(subject),2000)
        }
      })
      this.onProcessing(subject,'pending',options)
    }
    try {
      res = await apis[method].call(this,options)
    } catch(e){
      console.log(e)
    }
    return this.processResponse(res,options)
  }

  syncRequest(method,params = [], options ={}) {
    const res = apis[method].call(this,...params)  
    return this.processResponse(res,options)
  }

  close (subject){
    hide(this.getMessageKey(subject))
  }

  getMessageKey(subject = ''){
    return `transaction-box-${subject.split(/\s+/).join('-')}`
  }

  onProcessing(subject,status,options){
    const {direction = 'DEPOSIT',approved} = options;
    const key = this.getMessageKey(subject)
    this.close(key);
    const params = {
      ...MODAL_OPTIONS,
        style : {
          background: "rgba(0, 0, 0, 0.4)" ,
          zIndex : 11111111,
        },
        key : key
    }
    show(<ChainInteraction title={subject} status={status} direction={direction.toUpperCase()} approved={approved} close={() => this.close(subject)}/>,params)
  }

  

  processResponse(res,options){
    if(options.includeResponse){
      if(res && res.response){
        return res
      } 
    } else {
      if(res && res.response){
        return res.response.data
      } 
    }
    return res
  }
}

export default new ApiProxy();