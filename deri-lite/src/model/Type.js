import { makeAutoObservable, observable, action, computed } from "mobx";


class Type {
  current = "futures";
  
  constructor(){
    makeAutoObservable(this,{
      current:observable,
      setCurrent : action,
      isOption : computed,
      isPower:computed,
      isFuture : computed
    })
  }

  setCurrent(type){
    this.current = type;
  }

  get isOption() {
    return this.current === 'option'
  }
  get isPower() {
    return this.current === 'power'
  }

  get isFuture() {
    return this.current === "futures"
  }
}
export default new Type()