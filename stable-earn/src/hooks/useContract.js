import { useMemo } from 'react'
import ERC20_ABI from '../abi/erc20.json'
import { useWeb3React } from '@web3-react/core'
import { getContract } from '../client/helper'

// returns null on errors
export function useContract(
  addressOrAddressMap,
  ABI,
  withSignerIfPossible = true,
){
  const { provider, account, chainId } = useWeb3React()
  return useMemo(() => {
    if (!addressOrAddressMap || !ABI || !provider || !chainId) return null
    let address
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
    provider,
    chainId,
    withSignerIfPossible,
    account,
  ])
}

export function useTokenContract(
  tokenAddress,
  withSignerIfPossible,
) {
  return useContract(tokenAddress, ERC20_ABI, withSignerIfPossible)
}


