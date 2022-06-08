import { hexToNumber } from './convert';
import { web3Factory } from '../factory/web3'

const intRe = /^\d+$/
// adopt from derijs next
export const deleteIndexedKey = (obj) => {
  if (typeof obj === 'object' && obj !== null &&  Object.keys(obj).length > 0) {
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
          newObj[k] = obj[k];
        }
      });
      return newObj;
    } else if (intKeyCount === keys.length) {
      // is array container
      let res = [];
      for (let i = 0; i < keys.length; i++) {
        if (Array.isArray(obj[i])) {
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

  // get block number when last updated
  export const getLastUpdatedBlockNumber = async(chainId, contractAddress, position = 0) => {
    const web3 = await web3Factory.get(chainId)
    const res = await web3.eth.getStorageAt(contractAddress, position)
    //console.log('res', hexToNumber(res))
    return hexToNumber(res)
  }

  // get block number when last updated
  export const getLatestBlockNumber = async(chainId) => {
    const web3 = await web3Factory.get(chainId)
    const res = await web3.eth.getBlockNumber()
    //console.log('res', res)
    return res
  }

  export const getBlockInfo = async(chainId, blockNumber) => {
    const web3 = await web3Factory.get(chainId)
    return await web3.eth.getBlock(blockNumber);
  }

  export const getPastEvents = async(chainId, contract, eventName, filter = {}, fromBlock = 0, to = 0) => {
    let events = [];
    let amount
    if (['56', '97', '127', '80001'].includes(chainId)) {
      amount = 999
    } else {
      amount = 4999
    }
    if ((fromBlock + amount) > to) {
      amount = to - fromBlock
    }
    while (fromBlock <= to) {
      let es = await contract.getPastEvents(eventName, {
        filter: filter,
        fromBlock: fromBlock,
        toBlock: fromBlock + amount,
      });
      for (let e of es) {
        events.push(e);
      }
      fromBlock += amount + 1;
      if ((fromBlock + amount) > to) {
        amount = to - fromBlock
      }
    }
    return events;
  }

  export const getPastEventsUseAbi = async(chainId, contractAddress, contractAbi, eventName, filter = {}, fromBlock = 0, to = 0) => {
    const web3 = await web3Factory.get(chainId)
    const contract = new web3.eth.Contract(contractAbi, contractAddress);
    let events = [];
    let amount
    if (['56', '97', '127', '80001'].includes(chainId)) {
      amount = 999
    } else {
      amount = 4999
    }
    if ((fromBlock + amount) > to) {
      amount = to - fromBlock
    }
    while (fromBlock <= to) {
      let es = await contract.getPastEvents(eventName, {
        filter: filter,
        fromBlock: fromBlock,
        toBlock: fromBlock + amount,
      });
      for (let e of es) {
        events.push(e);
      }
      fromBlock += amount + 1;
      if ((fromBlock + amount) > to) {
        amount = to - fromBlock
      }
    }
    return events;
  }