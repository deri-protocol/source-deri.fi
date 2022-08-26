
import { checkChainId } from "../utils/chain"
import { debug } from "./env";
import { checkCallback } from "./lang";
import { getWeb3 } from "./web3";

export const toResponse = (data) => {
  return { success: true, response: { data } }
}

export const toErrorResponse = (error, defaultValue) => {
  return {
    success: false,
    response: {
      data: defaultValue,
      error: { code: error.code || '', message: error.message || error.toString() }
    }
  }
}

const handleError = (err) => {
  let result = 'Fail'
  if (err.message) {
    result = err.message
    try {
      const res = JSON.parse(err.message.slice(err.message.indexOf('{')))
      if (res.message) {
        result = res.message.replace(/execution\sreverted[:\s]?/, '')
        result = result || 'Fail'
        // reason = res.message.replace(/Transaction\sfailed!\s*:/, '')
      }
    } catch(ex) {

    }
  }
  return result
}

export const toTxErrorResponse = async(err, opts) => {
  const { chainId, onReject } = opts
  let code = '', reason = '',
    transactionHash = err.receipt ? err.receipt.transactionHash : err.transactionHash ? err.transactionHash : '';
  let message = err.message
  if (!message) {
    const errorArray = err.toString().split(':')
    if (errorArray.length > 2) {
      message = `${errorArray[0]}:${errorArray[1]}`
    } else if (err.toString().length <= 42) {
      message = err.toString()
    } else {
      message = errorArray[0] || ''
    }
    message = `Transaction failed: ${message}`
  }
  if (err.code && typeof err.code === 'number') {
    onReject()
    code = err.code
    if (err.message) {
      // metamask gasPrice error
      const result = err.message.match(/(\{.*\})/)
      if (result) {
        try {
          const data = JSON.parse(result[0])
          if (data.value && data.value.data && data.value.data.message) {
            reason = data.value.data.message
          }
        } catch(ex) {
          reason = err.message
        }
      } else {
        // handle custom error
        reason = err.message
      }
    }
  } else if (err.receipt) {
    // tx receipt error
    transactionHash = err.receipt.transactionHash
    const blockNumber = err.receipt.blockNumber
    try {
      const web3 = await getWeb3(chainId)
      const tx = await web3.eth.getTransaction(transactionHash)
      const res = await web3.eth.call(tx, blockNumber)
      reason = handleError(err)
    } catch (error) {
      reason = handleError(error)
    }
  }

  return {
    success: false,
    response: {
      error: {
        code,
        message: reason || message,
      },
      transactionHash,
    }
  }
}

const checkCommonArgs = (args) => {
  let { chainId, ...rest } = args
  chainId = checkChainId(chainId)
  return { chainId, ...rest }
}

const checkCommonTxArgs = (args) => {
  let { chainId, accountAddress, onAccept, onReject, ...rest } = args
  chainId = checkChainId(chainId)
  onAccept = checkCallback(onAccept, 'onAccept')
  onReject = checkCallback(onReject, 'Reject')
  return { chainId, accountAddress, onAccept, onReject, ...rest }
}

// for query api
export const queryApi = (fn, defaultValue) => {
  return async (args) => {
    let res
    try {
      // checkInput here
      const newArgs = checkCommonArgs(args)
      // method call
      const data = await fn(newArgs)
      debug() && console.log('queryApi data:', data)
      // checkOutput here
      res = toResponse(data)
    } catch (err) {
      debug() && console.log('queryApi error:', err)
      res = toErrorResponse(err, defaultValue)
    }
    return res
  }
}

// for transaction api
export const txApi = (fn) => {
  return async (args) => {
    let res
    try {
      // checkInput here
      const newArgs = checkCommonTxArgs(args)
      // send tx
      const data = await fn(newArgs)
      debug() && console.log('txApi data:', data)
      // checkOutput here
      res = toResponse(data)
    } catch (err) {
      debug() && console.log('txApi error:', err)

      // process err
      const { chainId, onAccept, onReject } = args
      res = await toTxErrorResponse(err, { chainId, onAccept, onReject })
    }
    return res
  }
}
