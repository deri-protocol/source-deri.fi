import { catchTxApiError } from '../../shared/utils';
import { perpetualPoolLiteFactory } from '../factory.js';

export const addLiquidity = async(chainId, poolAddress, accountAddress, amount) => {
  const args = [chainId, poolAddress, accountAddress, amount]
  return catchTxApiError(async (chainId, poolAddress, accountAddress, amount) => {
    const perpetualPool = perpetualPoolLiteFactory(chainId, poolAddress)
    return await perpetualPool.addLiquidity(accountAddress, amount)
  }, args)
}

export const removeLiquidity = async(chainId, poolAddress, accountAddress, amount, isMaximum=false) => {
  const args = [chainId, poolAddress, accountAddress, amount, isMaximum]
  return catchTxApiError(async (chainId, poolAddress, accountAddress, amount, isMaximum) => {
    const perpetualPool = perpetualPoolLiteFactory(chainId, poolAddress)
    return await perpetualPool.removeLiquidity(accountAddress, amount, isMaximum)
  }, args)
}
