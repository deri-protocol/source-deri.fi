
// const range = (n) => [...Array(n).keys()];

import { toWei } from "../../utils/bignumber";
import { processResult } from "../../utils/lang";

export const addMethods = (klass, fns = []) => {
  if (fns.length > 0) {
    for (let i = 0; i < fns.length; i++) {
      klass = fns[i](klass);
    }
    return klass;
  } else {
    return klass;
  }
};
export const overrideMethods = (klass, fns = []) => {
  if (fns.length > 0) {
    for (let i = 0; i < fns.length; i++) {
      const fn = fns[i][0]
      const args = fns[i].slice(1)
      // console.log(fn, args)
      klass = fn(klass)(...args);
    }
    return klass;
  } else {
    return klass;
  }
};

export const processMethod = (klass) => (methodName, propList = []) => {
  const originMethod = klass.prototype[methodName];
  klass.prototype[methodName] = async function (...args) {
    const res = await originMethod.apply(this, args);
    return processResult(res, propList);
  };
  return klass;
};

export const processTxMethod = (klass) => (methodName, toWeiArgPositions = []) => {
  const originMethod = klass.prototype[methodName];
  klass.prototype[methodName] = async function (...args) {
    //const prices = await this._getSymbolPrices()
    let newArgs = args.map((arg, index) =>
      toWeiArgPositions.indexOf(index.toString()) !== -1 ? toWei(arg) : arg
    );
    //newArgs.push(prices)
    return await originMethod.apply(this, newArgs);
  };
  return klass;
};

export const classAdapter = (klass, fnName, fn) => {
  klass.prototype[fnName] = fn;
  return klass;
};