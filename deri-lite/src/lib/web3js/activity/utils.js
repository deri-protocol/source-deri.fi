import Web3 from "web3";
import { bg } from "../shared/utils";

// lang
export const isObject = (value) => typeof value === 'object' && value !== null
export const isArray = (value) => typeof value === 'object' && Array.isArray(value)
export const isFunction = (value) => typeof value === 'function'

// convert
export const toWei = (number, unit = "ether") => {
  return Web3.utils.toWei(number, unit);
};

export const fromWei = (number, unit = "ether") => {
  return Web3.utils.fromWei(number, unit);
};

// factory
export const contractFactory = (klass) => {
  let instances = {}
  return (chainId, address) => {
    const key = address
    if (Object.keys(instances).includes(key)) {
      return instances[key];
    } else {
      instances[key] = new klass(chainId, address);
      return instances[key];
    }
  }
}

// adapter
const processObjectResult = (val, propList = []) => {
  return Object.keys(val).reduce((acc, prop) => {
    if (typeof val[prop] === "string" && propList.includes(prop)) {
      acc[prop] = bg(fromWei(val[prop])).toString();
    } else {
      acc[prop] = val[prop];
    }
    return acc;
  }, {});
};

const processResult = (val, propList = []) => {
  if (isArray(val)) {
    return val.map((v) => processResult(v, propList));
  } else if (isObject(val)) {
    return processObjectResult(val, propList);
  } else if (typeof val === "string") {
    return bg(fromWei(val)).toString();
  } else {
    return val;
  }
};

export const processMethod = (klass, methodName, propList = []) => {
  const originMethod = klass.prototype[methodName];
  klass.prototype[methodName] = async function (...args) {
    const res = await originMethod.apply(this, args);
    return processResult(res, propList);
  };
  return klass;
};

export const processTxMethod = (klass, methodName, toWeiArgPositions = []) => {
  const originMethod = klass.prototype[methodName];
  klass.prototype[methodName] = async function (...args) {
    const newArgs = args.map((arg, index) =>
      toWeiArgPositions.indexOf(index.toString()) !== -1 ? toWei(arg) : arg
    );
    return await originMethod.apply(this, newArgs);
  };
  return klass;
};