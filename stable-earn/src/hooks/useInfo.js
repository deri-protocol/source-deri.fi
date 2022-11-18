import { useWallet } from "use-wallet";
import { getContractAddress } from "../utils/utils";
import { useContract } from "./useContract";
import contract_ABI from '../abi/fundImplementation.json'
import useContractCall from "./useContractCall";
import { BigNumber } from 'ethers';
import { formatUnits } from 'ethers/lib/utils';
import { useCallback, useState } from "react";
import { useEffect } from "react";

export default function useInfo() {
  const { chainId, account } = useWallet()
  const [info, setInfo] = useState({})
  const contractAddress = getContractAddress(chainId)
  const contract = useContract(contractAddress, contract_ABI)
  const getInfo = useCallback(async () => {
    if (contract) {
      let res = await contract.calculateTotalValue([true])
      let data = info
      data["netValue"] = formatUnits(BigNumber.from(res.shareValue._hex),18)
      data["aum"] = formatUnits(BigNumber.from(res.totalValue._hex),18)
      setInfo(data)
    }
  }, [contract, info])
  useEffect(() => {
    getInfo()
  }, [getInfo])
  return [info]
}