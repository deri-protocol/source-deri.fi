import { catchTxApiError } from '../../shared/utils';
import { everlastingOptionFactory } from '../factory/pool.js';

export const addLiquidity = async(chainId, poolAddress, accountAddress, amount) => {
  const args = [chainId, poolAddress, accountAddress, amount]
  return catchTxApiError(async (chainId, poolAddress, accountAddress, amount) => {
    const optionPool = everlastingOptionFactory(chainId, poolAddress)
    return await optionPool.addLiquidity(accountAddress, amount)
  }, args)
}

export const removeLiquidity = async(chainId, poolAddress, accountAddress, amount, isMaximum=false) => {
  const args = [chainId, poolAddress, accountAddress, amount, isMaximum]
  return catchTxApiError(async (chainId, poolAddress, accountAddress, amount, isMaximum) => {
    const optionPool = everlastingOptionFactory(chainId, poolAddress)
    return await optionPool.removeLiquidity(accountAddress, amount, isMaximum)
  }, args)
}
