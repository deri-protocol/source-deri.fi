import { fromWei } from "./bignumber";

// export const isObject = (val) => {
//   return typeof val === 'object' && !Array.isArray(val) && val !== null;
// };
// export const isArray = (val) => {
//   return Array.isArray(val);
// };
export const isObject = (value) => typeof value === 'object' && value !== null
export const isArray = (value) => typeof value === 'object' && Array.isArray(value)
export const isFunction = (value) => typeof value === 'function'

export const checkCallback = (callback, name) => {
  if (callback && typeof callback === 'function') {
    return callback
  }
  throw new Error(`Invalid callback type: ${name}(${typeof callback})`)
}


// const re = /^(0x|[a-zA-Z])/
// const processObjectResult = (val, propList = []) => {
//   console.log('----- val', val, propList)
//   return Object.keys(val).reduce((acc, prop) => {
//     if (typeof val[prop] === "string" && propList.includes(prop)) {
//       acc[prop] = fromWei(val[prop]);
//     } else if (Array.isArray(val[prop])) {
//       acc[prop] = processResult(val[prop], propList);
//     } else if (isObject(val[prop])) {
//       acc[prop] = processObjectResult(val[prop], propList);
//     } else {
//       acc[prop] = val[prop];
//     }
//     return acc;
//   }, {});
// };

// export const processResult = (val, propList = []) => {
//   if (isArray(val)) {
//     return val.map((v) => processResult(v, propList));
//   } else if (isObject(val)) {
//     return processObjectResult(val, propList);
//   } else if (typeof val === "string") {
//     return re.test(val) ? val : fromWei(val);
//   } else {
//     return val;
//   }
// }
const re = /^(0x|[a-zA-Z])/
const processObjectResult = (val, propList = []) => {
  return Object.keys(val).reduce((acc, prop) => {
    if (typeof val[prop] === "string" && propList.includes(prop)) {
      acc[prop] = fromWei(val[prop]);
    } else if (Array.isArray(val[prop])) {
      acc[prop] = processResult(val[prop], propList);
    } else if (isObject(val[prop])) {
      acc[prop] = processObjectResult(val[prop], propList);
    } else {
      acc[prop] = val[prop];
    }
    return acc;
  }, {});
};

export const processResult = (val, propList = []) => {
  if (isArray(val)) {
    return val.map((v) => processResult(v, propList));
  } else if (isObject(val)) {
    return processObjectResult(val, propList);
  } else if (typeof val === "string") {
    return re.test(val) ? val : fromWei(val);
  } else {
    return val;
  }
};

const intRe = /^\d+$/
// adopt from derijs next
export const deleteIndexedKey = (obj) => {
  if (isObject(obj) && Object.keys(obj).length > 0) {
    if (obj.__length__) {
      delete obj.__length__
    }
    const keys = Object.keys(obj);
    const intKeyCount = keys.reduce(
      (acc, k) => (intRe.test(k) ? acc + 1 : acc),
      0
    );
    //console.log(keys);
    // is leaf array
    if (intKeyCount * 2 === keys.length) {
      let newObj = {};
      Object.keys(obj).forEach((k) => {
        if (!intRe.test(k)) {
          newObj[k] = deleteIndexedKey(obj[k]);
        }
      });
      return newObj;
    } else if (intKeyCount === keys.length) {
      // is array container
      let res = [];
      for (let i = 0; i < keys.length; i++) {
        if (isArray(obj[i])) {
          res.push(deleteIndexedKey(obj[i]));
        } else {
          res.push(obj[i]);
        }
      }
      return res;
    }
  }
  return obj;
};