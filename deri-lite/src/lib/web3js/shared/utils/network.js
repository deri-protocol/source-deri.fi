import Web3 from 'web3';
// == func
// const np = () => {}
// const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// refer to https://www.30secondsofcode.org/js/s/deep-clone
// alternative: let clone = JSON.parse(JSON.stringify(obj))
export const deepClone = obj => {
  if (obj === null) return null;
  let clone = Object.assign({}, obj)
  Object.keys(clone).forEach((key) => {
    clone[key] = typeof obj[key] === 'object' ? deepClone(obj[key]) : obj[key];
  });
  // need recheck
  if (Array.isArray(obj)) {
    clone.length = obj.length
    return Array.from(clone)
  }
  return clone
}

// export const shuffleArray = (urls) => {
//   const newUrls = deepClone(urls)
//   const length = urls.length
//   let res = []
//   for (let i = 0; i < length; i++) {
//     const index = Math.floor(Math.random() * urls.length)
//     res = res.concat(newUrls.splice(index,1))
//   }
//   return res
// }
export const shuffleArray = (array) => {
  let currentIndex = array.length, randomIndex;
  // While there remain elements to shuffle...
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }
  return array;
}

const getBlockNumber = async (url) => {
  let res = { url: url, blockNumber: -1, duration: Number.MAX_SAFE_INTEGER,};
  try {
    const web3 = new Web3(new Web3.providers.HttpProvider(url))
    const startTime = Date.now()
    res.blockNumber = await web3.eth.getBlockNumber()
    res.duration = Date.now() - startTime
  } catch (err) {
    //console.log(`getBlockNumber(${url}) error: ${err}`)
  }
  return res
};

export const getLatestRPCServer = async (urls = []) => {
  //urls = shuffleArray(urls)
  //pick 2 random urls
  //urls = urls.length >= 2 ? urls.slice(0,2) : urls
  let promises = []
  for (let i = 0; i < urls.length; i++) {
    promises.push(getBlockNumber(urls[i]));
  }
  let blockNumbers = await Promise.all(promises)
  blockNumbers = blockNumbers.sort((a, b) => a.duration - b.duration)
  // console.log('blockNumbers',  blockNumbers)
  const latestBlockNumber = blockNumbers.reduce((a, b) => b.blockNumber !== -1 ? a > b.blockNumber ? a : b.blockNumber : a, 0)
  const index = blockNumbers.findIndex((b) => b.blockNumber === latestBlockNumber);
  const res = blockNumbers[index] && blockNumbers[index].url
  // console.log(res)
  if (res && res.startsWith('http')) {
    return res
  } else {
    throw new Error(`getLatestRPCServer(): no alive RPC server in ${urls}`)
  }
};