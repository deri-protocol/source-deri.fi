import { DeriEnv } from '../config/env';
import { debug, REST_API_CALL_RETRY } from '../config/constant';
import { getRestServerConfig } from '../config/rest_server';
import { checkChainId } from '../config';
import { web3Factory } from '../factory';

// get REST HTTP Base url
export const getHttpBase = (env) => {
  return getRestServerConfig(env || DeriEnv.get());
};

export const fetchJson = async (url) => {
  let retry = REST_API_CALL_RETRY
  while (retry > 0) {
    try {
      const resp = await fetch(url);
      return await resp.json();
    } catch (err) {
      debug() && console.log(err)
      retry -= 1
    }
  }
  if (retry === 0) {
    throw new Error('JSON_RPC_CALL_TIMEOUT', {
      name: 'fetchJson',
      args: [url],
    });
  }
};

export const fetchRestApi = async (path, opts = { method: 'GET' }) => {
  return await fetchJson(`${getHttpBase()}${path}`, opts);
};

// query api wrapper
export const catchSyncApiError = (func, args = [], defaultValue = {}) => {
  let res;
  try {
    const result = func(...args);
    // res = { success: true, response: { data: result } };
    res = result
  } catch (err) {
    // debug() && console.log(err);
    // res = {
    //   success: false,
    //   response: {
    //     data: defaultValue,
    //     error: { code: err.code, message: err.message },
    //   },
    // };
  }
  return res;
};

export const catchApiError = async (func, args = [], defaultValue = {}) => {
  let res;
  try {
    const result = await func(...args);
    // res = { success: true, response: { data: result } };
    res = result
  } catch (err) {
    // debug() && console.log(err);
    // let error
    // // error wrapper
    // if (err.message.startsWith('Invalid JSON RPC response:')) {
    //   error = new Error('INVALID_JSON_RPC_RESPONSE')
    // } else {
    //   error = err
    // }
    // res = {
    //   success: false,
    //   response: {
    //     data: defaultValue,
    //     error: { code: error.code, message: error.message },
    //   },
    // };
  }
  return res;
};

// tx api wrapper
export const catchTxApiError = async (func, args = []) => {
  let res;
  try {
    const result = await func(...args);
    // res = { success: true, response: { data: result } };
    res = { success: true };
  } catch (err) {
    // const message = err.errorMessage || err.message || 'Transaction failed';
    // const transactionHash = err.receipt ? err.receipt.transactionHash : '';
    // let reason = ''

    // // fix matamask error at lower gas price
    // const opts = args[args.length - 1]
    // if (typeof opts === 'object' && typeof opts.onReject === 'function') {
    //   const { onReject } = opts
    //   if (err.code && typeof err.code === 'number') {
    //     onReject()
    //   }
    // }

    // if (transactionHash && args.length > 0) {
    //   try {
    //     const chainId = checkChainId(args[0])
    //     const web3 = await web3Factory.get(chainId)
    //     const tx = await web3.eth.getTransaction(transactionHash)
    //     await web3.eth.call(tx, tx.blockNumber)
    //   } catch(err) {
    //     if (err.message) {
    //       const res = JSON.parse(err.message.slice(err.message.indexOf('{')))
    //       if (res.message) {
    //         reason = res.message.replace('execution reverted: ', '')
    //         reason = res.message.replace(/Transaction\sfailed!\s*:/, '')
    //       }
    //     }
    //   }
    // };
    // res = {
    //   success: false,
    //   response: {
    //     error: reason || message.split(':')[0],
    //     transactionHash,
    //   }
    // }
    res = { success: false}
  };
  return res;
}