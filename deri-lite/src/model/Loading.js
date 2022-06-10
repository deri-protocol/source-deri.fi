import { makeObservable, observable, action, computed } from "mobx";

class Loading {
  isLoading = false
  constructor(){
    makeObservable(this,{
      isLoading : observable,
      setIsLoading : action,
      loading : action,
      isShowMask : computed
    })
  }

  setIsLoading(isLoading){
    this.isLoading = isLoading
  }

  loading(){
    this.setIsLoading(true)
  }

  loaded(){
    this.setIsLoading(false)
  }

  get isShowMask(){
    return this.isLoading === true;
  }

  
}

export default new Loading();