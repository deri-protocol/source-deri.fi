import { computed, makeAutoObservable, observable } from "mobx";
import { FUTURES, OPTION, POWER } from "../utils/Constants";

//symbol category
class Category {
  current = 'futures'

  constructor(){
    makeAutoObservable(this,{
      current : observable,
      isPower : computed,
      isFutures : computed,
      isOption : computed
    })
  }

  setCurrent(category){
    this.current =category
  }

  get isPower(){
    return this.current === POWER
  }

  get isFutures() {
    return this.current === FUTURES
  }

  get isOption(){
    return this.current === OPTION
  }
}

export default new Category();