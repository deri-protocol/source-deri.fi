import { useWallet } from "use-wallet";
import { getContractAddress, toFixed } from "../utils/utils";
import contract_ABI from '../abi/fundImplementation.json'
import useTransaction from "./useTransaction";
import { useMemo } from "react";
import { parseUnits } from "ethers/lib/utils";

export default function useTrade() {
  const { chainId } = useWallet()
  const contractAddress = getContractAddress(chainId)
  const [, getTransaction] = useTransaction(
    contractAddress,
    contract_ABI
  );

  return useMemo(() => {
    return async (
      token,
      amount,
      type,
      message,
      onReceipt) => {
      
      let priceLimit = type === "invest" ? 0 : 400
      let params = [
        parseUnits(toFixed(priceLimit), 18)
      ]
      if (type === "invest") {
        params.unshift(parseUnits(
          toFixed(amount, token.tokenDecimals),
          token.tokenDecimals
        ),)
      }
      if(type === "requestRedeem"){
        params=[]
      }
      const [transaction, goon] = await getTransaction(
        type,
        params,
        message
      );
      if (transaction && goon) {
        onReceipt && onReceipt(transaction.status)
      }
    }
  }, [getTransaction])
}