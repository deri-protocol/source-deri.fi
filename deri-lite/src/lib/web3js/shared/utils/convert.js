import Web3 from 'web3';
import BigNumber from 'bignumber.js';

// lang
export const isObject = (value) => typeof value === 'object' && value !== null
export const isArray = (value) => typeof value === 'object' && Array.isArray(value)
export const isFunction = (value) => typeof value === 'function'

// == bg
BigNumber.config({
  DECIMAL_PLACES: 18,
  ROUNDING_MODE: BigNumber.ROUND_DOWN,
  EXPONENTIAL_AT: 256,
});

export const bg = (value, base = 0) => {
  if (base === 0) {
    return BigNumber(value);
  }
  if (base > 0) {
    return BigNumber(value).times(BigNumber(`1${'0'.repeat(base)}`));
  }
  return BigNumber(value).div(BigNumber(`1${'0'.repeat(-base)}`));
};

export const max = (value1, value2) => {
  if (value1.gte(value2)) {
    return value1;
  }
  return value2;
};

export const min = (value1, value2) => {
  if (value1.lte(value2)) {
    return value1;
  }
  return value2;
};

export const fromWei = (value) => bg(value, -18).toString()

export const toWei = (value) => bg(value, 18).toFixed(0).toString()

export const toNatural = (value, num = 0) => BigNumber(value).toFixed(num).toString();

export const toHex = (value) => Web3.utils.toHex(value);

export const toChecksumAddress = (value) => Web3.utils.toChecksumAddress(value);

export const hexToString = (value) => Web3.utils.hexToUtf8(value);

export const hexToNumber = (value) => Web3.utils.hexToNumber(value);

export const hexToNumberString = (value) => Web3.utils.hexToNumberString(value);

export const hexToDeri = (value) => bg(hexToNumberString(value));

export const hexToNatural = (value) => bg(hexToNumberString(value), -18);


export const deriToNatural = (value) => bg(value, -18);

export const naturalToDeri = (value) => bg(value, 18).toFixed(0);

export const deriToString = (value) => bg(value).toString();

export const deriToBool = (value) => {
  if (bg(value).toNumber() === 1) {
    return true;
  }
  return false;
};

export const naturalWithPercentage = (value) =>
  `${bg(value).sd(4).times(100).toFixed(4).toString()}%`;

export const formatBN = (bigNumber) =>
  bigNumber.toFormat().replaceAll(',', '').toString();

// == convert
export const numberToHex = (value) => Web3.utils.numberToHex(value);


// == utils
export const isBrowser = () => typeof window !== 'undefined' && typeof window.document !== 'undefined'
export const isNodejs = () => typeof process !== 'undefined' && process.versions != null && process.versions.node != null
export const isJsDom = () => typeof window !== 'undefined' && navigator.userAgent.includes('jsdom')

// == array set
export const isEqualSet = (set1, set2) => {
  if (set1.size !== set2.size) return false;
  for (let item of set1) {
    if (!set2.has(item)) {
      return false;
    }
  }
  return true;
}



// == contract gen
// export const deleteIndexedKey = (obj) => {
//   if (isObject(obj) && Object.keys(obj).length > 0) {
//     const keys = Object.keys(obj);
//     const intKeyCount = keys.reduce(
//       (acc, k) => (intRegex.test(k) ? acc + 1 : acc),
//       0
//     );
//     if (intKeyCount * 2 === keys.length) {
//       let newObj = {};
//       Object.keys(obj).forEach((k) => {
//         if (!intRegex.test(k)) {
//           newObj[k] = obj[k];
//         }
//       });
//       return newObj;
//     }
//     return obj;
//   } else {
//     return obj;
//   }
// };

export const fromWeiForObject = (obj, keyList = []) => {
  return Object.keys(obj).reduce((acc, i) => {
    if (keyList.includes(i)) {
      acc[i] = fromWei(obj[i]);
    } else {
      acc[i] = obj[i];
    }
    return acc;
  }, {});
};

export const toNumberForObject = (obj, keyList = []) => {
  return Object.keys(obj).reduce((acc, i) => {
    if (keyList.includes(i)) {
      acc[i] = bg(obj[i]).toNumber();
    } else {
      acc[i] = obj[i];
    }
    return acc;
  }, {});
};


// for frontend to display symbols
export const sortOptionSymbols = (symbolList) => {
  const symbolArr = symbolList
    .map((s) => s.symbol)
    .map((s) => {
      return s.split('-');
    });
  const unique = (value, index, self) => self.indexOf(value) === index
  const to2 = (i) => i < 10 ? `0${i}` : i
  const symbol = symbolArr.map((s) => s[0]).filter(unique)
  const direction = symbolArr.map((s) => s[2]).filter(unique)
  const price = symbolArr
    .map((s) => s[1])
    .filter(unique)
    .sort((a, b) => parseInt(b) - parseInt(a));
  return symbolList.map((i, index) => {
    const index1 =  symbol.indexOf(symbolArr[index][0]) + 1
    const index2 =  to2(direction.indexOf(symbolArr[index][2]) + 1)
    const index3 =  to2(price.indexOf(symbolArr[index][1]) + 1)
    i.index = parseInt(`${index1}${index2}${index3}`)
    return i
  }).sort((a, b) => a.index - b.index).map((i) => {
    delete i.index
    return i
  })
}

