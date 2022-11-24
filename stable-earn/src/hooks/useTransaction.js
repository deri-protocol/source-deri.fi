import { useMemo } from "react";
import { useContract } from "./useContract";
import useContractCall from "./useContractCall";
import { getGasLimit } from "../client/helper";
import { bigNumberify } from "../utils/utils";
import { EVENT_TRANS_BEGIN, EVENT_TRANS_END, MAX_GAS_LIMIT } from "../utils/Constants";
import Emitter from "../utils/Emitter";
export default function useTransaction(contractAddress, ABI) {
  const contract = useContract(contractAddress, ABI);
  const contractCall = useContractCall(contract);
  const getTransaction = useMemo(() => {
    return async (
      method,
      params,
      message,
      options) => {
      const opts = { gasLimit: bigNumberify(21000) };
      let errorMsg;
      try {
        const gasLimit =
          options && options.gasLimit
            ? options.gasLimit
            : await getGasLimit(contract, method, params, bigNumberify(0));
        opts.gasLimit = gasLimit;
      } catch (error) {
        opts.gasLimit = bigNumberify(MAX_GAS_LIMIT);
        errorMsg = error
      }
      let transactionResponse
      try {
        transactionResponse = await contractCall(method, params, opts);
      } catch (e) {
        if (e.code === 4001 || e.code === "ACTION_REJECTED") {
          return [transactionResponse, false]
        } else {
          let reason = e ? e.message : errorMsg && errorMsg.reason.replace('execution reverted: ', '')
          let goon = true;
          if (e.code === -32603) {
            reason = 'Unknown Error ,please check your rpc'
            goon = false
          }
          Emitter.emit(EVENT_TRANS_END, { ...message, context: { success: false, hash: null, error: reason} })
          return [transactionResponse, goon]
        }
      }
      if (transactionResponse && transactionResponse.hash) {
        Emitter.emit(EVENT_TRANS_BEGIN, {
          ...message, hash: transactionResponse.hash
        })
      }
      const receipt = await transactionResponse.wait()
      if (receipt) {
        if (receipt && receipt.transactionHash) {
          const hash = receipt.transactionHash
          if (receipt.status) {
            Emitter.emit(EVENT_TRANS_END, { ...message, context: { success: true, hash: hash, error: "error" } })
          } else {
            let reason = errorMsg && errorMsg.reason.replace('execution reverted: ', '')
            Emitter.emit(EVENT_TRANS_END, { ...message, context: { success: false.success, hash: hash, error: reason } })
          }
        }
      }

      return [receipt, true]
    }
  }, [contract, contractCall])
  return [contract, getTransaction]
}