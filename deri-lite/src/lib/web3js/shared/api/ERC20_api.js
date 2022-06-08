import { TERC20Factory } from ".."
import { catchTxApiError, normalizeChainId } from "../utils"

export const mintTERC20 = async (chainId, bTokenAddress, accountAddress) => {
  const args = [chainId, bTokenAddress, accountAddress];
  return catchTxApiError(async (chainId, bTokenAddress, accountAddress) => {
    chainId = normalizeChainId(chainId);
    const testERC20 = TERC20Factory(chainId, bTokenAddress);
    // send tx
    return await testERC20.mint(accountAddress);
  }, args);
};