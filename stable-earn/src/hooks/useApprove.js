import { useCallback, useEffect, useMemo, useState } from 'react';
import { useWallet } from 'use-wallet';
import { MaxUint256 } from '@ethersproject/constants';
import { STABLE_EARN_CONTRACT } from '../abi/contractAddress';
import Erc20 from '../abi/erc20.json';
import { BigNumber } from 'ethers';
import { formatEther } from 'ethers/lib/utils';
// import { retry } from '../lib/retry';
import useTransaction from './useTransaction';
export default function useApprove(tokenAddress, tokenName) {
  const [contract,getTransaction] = useTransaction(tokenAddress, Erc20);
  const [allowance, setAllowance] = useState(0)
  const { chainId, account } = useWallet()
  const spender = STABLE_EARN_CONTRACT[chainId]
  
  const loadAllowance = useCallback(
    async () => {
      if (account && contract && spender) {
        const allowance = await contract.allowance(account, spender)
        const amount = formatEther(BigNumber.from(allowance._hex))
        setAllowance(Number(amount))
      }
    },
    [account, contract, spender],
  )
  useEffect(() => {
    loadAllowance();
  }, [loadAllowance])
  const approve = useMemo(() => {
    const transactionTitle = {
      processing: "Approve Processing",
      success: "Approve Executed",
      error: "Approve Failed",
    }
    const transactionContent = {
      success: `Approve ${tokenName}`,
      error: "Transaction Failed"
    }
    return async (onReceipt) => {
      if (allowance > 0) {
        throw new Error(`current Token :${tokenAddress} is already approved`)
      }
      const [transaction, goon] = await getTransaction('approve', [spender, MaxUint256],{
            title: transactionTitle, content: transactionContent,
          })
      if (transaction && goon) {
        loadAllowance()
        onReceipt && onReceipt(transaction.status)
      }
    }
  }, [allowance, getTransaction, loadAllowance, spender, tokenAddress, tokenName])
  return [
    allowance > 0,
    approve
  ]
}