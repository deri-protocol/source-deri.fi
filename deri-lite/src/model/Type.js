import { makeAutoObservable, observable, action, computed } from "mobx";


class Type {
  current = null;
  
  constructor(){
    makeAutoObservable(this,{
      current:observable,
      setCurrent : action,
      isOption : computed,
      isFuture : computed
    })
  }

  setCurrent(type){
    this.current = type;
  }

  get isOption() {
    return this.current === 'option'
  }

  get isFuture() {
    return this.current === 'future'
  }
}
export default new Type()