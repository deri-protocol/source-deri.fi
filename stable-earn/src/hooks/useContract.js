import { useMemo } from 'react'
import {Web3Provider} from '@ethersproject/providers'
import { getContract } from '../client/helper'
import { useWallet } from 'use-wallet'

// returns null on errors
export function useContract(
  addressOrAddressMap,
  ABI,
  withSignerIfPossible = true,
){
  const { ethereum, account, chainId } = useWallet()
  return useMemo(() => {
    if (!addressOrAddressMap || !ABI || !ethereum || !chainId) return null
    let address
    const provider = new Web3Provider(ethereum,'any')  
    if (typeof addressOrAddressMap === 'string') address = addressOrAddressMap
    else address = addressOrAddressMap[chainId]
    if (!address) return null
    try {
      return getContract(
        address,
        ABI,
        provider,
        withSignerIfPossible && account ? account : undefined,
      )
    } catch (error) {
      console.error('Failed to get contract', error)
      return null
    }
  }, [
    addressOrAddressMap,
    ABI,
    ethereum,
    chainId,
    withSignerIfPossible,
    account,
  ])
}



