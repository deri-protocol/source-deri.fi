import * as api from "../lib/web3js/index";

class ApiProxy {
  status = 'waiting'
  async request(method,params=[],options = {}){
    const apis = await import('../lib/web3js/index')
    let res = null;    
    try {
      res = await apis[method].call(this,...params)
    } catch(e){
      console.log(e)
    }
    return this.processResponse(res,options)
  }

  syncRequest(method,params = [], options ={}) {
    const res = api[method].call(this,...params)  
    return this.processResponse(res,options)
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