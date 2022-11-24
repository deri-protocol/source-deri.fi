import { getToken } from "../utils/utils";
import Erc20 from '../abi/erc20.json';
import { useWallet } from "use-wallet";
import { useContract } from "./useContract";
import { useState } from "react";
import { useCallback } from "react";
import { formatUnits } from 'ethers/lib/utils';
import { BigNumber } from 'ethers';
import { useEffect } from "react";
export default function useToken(){
  const { account, chainId } = useWallet()
  const [tokenAddress,tokenName] = getToken(chainId)
  const contract = useContract(tokenAddress,Erc20)
  const [walletBalance,setWalletBalance] = useState(0)
  const [tokenDecimals,setTokenDecimals] = useState(0)
  const loadBalance = useCallback(async ()=>{
    if(account && contract){
       const balance = await contract.balanceOf(account)
       const decimals = await contract.decimals()
       let amount = formatUnits(BigNumber.from(balance._hex), decimals);
       setWalletBalance(amount)
       setTokenDecimals(decimals)
    }
  },[account, contract])

  useEffect(()=>{
    loadBalance()
  },[loadBalance])

  return [{
    tokenAddress:tokenAddress,
    tokenName:tokenName,
    walletBalance:walletBalance,
    tokenDecimals:tokenDecimals
  },loadBalance]
}