import { useWallet } from "use-wallet";
import { bg, getContractAddress } from "../utils/utils";
import Erc20 from '../abi/erc20.json';
import { useContract } from "./useContract";
import contract_ABI from '../abi/fundImplementation.json'
import { BigNumber } from 'ethers';
import { formatUnits } from 'ethers/lib/utils';
import { useCallback, useState } from "react";
import { useEffect } from "react";
import { FLP_TOKEN_ADDRESS } from "../utils/Constants";

export default function useInfo() {
  const { chainId, account } = useWallet()
  const [info, setInfo] = useState({})
  const [accountInfo, setAccountInfo] = useState({})
  const contractAddress = getContractAddress(chainId)
  const FLPContract = useContract(FLP_TOKEN_ADDRESS, Erc20)
  const contract = useContract(contractAddress, contract_ABI)
  const timeDay = 86400;
  const getInfo = useCallback(async () => {
    let data = {};
    if (contract) {
      let res = await contract.calculateTotalValue([true])
      data["netValue"] = formatUnits(BigNumber.from(res.shareValue._hex), 18)
      data["aum"] = formatUnits(BigNumber.from(res.totalValue._hex), 18)
      setInfo(data)
    }
  }, [contract])
  const getAccountInfo = useCallback(async () => {
    let data = {};
    if (contract && FLPContract && account) {
      let res = await contract.calculateTotalValue([false])
      let waitDayInfo = await contract.userRedeemRequests(account)
      const flpBalance = await FLPContract.balanceOf(account)
      const decimals = await FLPContract.decimals()
      let shareValue = formatUnits(BigNumber.from(res.shareValue._hex), 18)
      let timestamp = BigNumber.from(waitDayInfo.startTime._hex).toNumber()
      let amount = formatUnits(BigNumber.from(flpBalance._hex), decimals);
      let estValue = timestamp ? formatUnits(BigNumber.from(waitDayInfo.share._hex), 18) : bg(shareValue).times(amount).toNumber()
      if (timestamp) {
        timestamp = bg(timeDay).times(15).plus(timestamp).toNumber()
      }
      data["timestamp"] = timestamp
      data["estValue"] = estValue
      setAccountInfo(data)
    }
  }, [FLPContract, account, contract])

  const load = useCallback(() => {
    getInfo()
    getAccountInfo()
  }, [getAccountInfo, getInfo])

  useEffect(() => {
    getInfo()
    getAccountInfo()
  }, [getAccountInfo, getInfo])
  return [info, accountInfo, load]
}