import { useMemo } from 'react'

export default function useContractCall(contract){
  return useMemo(() => {
    return async (
      method,
      params,
      options
    ) => {
      return contract[method](...params, options)
    }
  }, [contract])
}
