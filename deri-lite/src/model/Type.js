import { makeAutoObservable, observable, action, computed } from "mobx";
import { FUTURE, FUTURES, OPTION, POWER } from "../utils/Constants";
class Type {
  current = "future";

  constructor() {
    makeAutoObservable(this, {
      current: observable,
      setCurrent: action,
      isOption: computed,
      isPower: computed,
      isFuture: computed
    })
  }

  setCurrent(type) {
    this.current = type;
  }

  get isOption() {
    return this.current === OPTION
  }
  get isPower() {
    return this.current === POWER
  }

  get isFuture() {
    return this.current === FUTURE
  }
}
export default new Type()