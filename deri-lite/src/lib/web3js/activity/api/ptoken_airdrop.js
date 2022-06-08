import { catchApiError, catchTxApiError, bg } from "../../shared/utils";
import { perpetualPoolLiteFactory } from "../../v2_lite/factory";
import { getPTokenAirdropConfig } from "../config"
import { PTokenAirdropNULSFactory } from "../contract/factory"

export const isPTokenAirdropped = async (...args) => {
  return catchApiError(async(chainId, accountAddress) => {
    const config = getPTokenAirdropConfig(chainId);
    return await PTokenAirdropNULSFactory(
      chainId,
      config.address
    ).isAirdropPToken(accountAddress);
  }, args, 'isPTokenAirdropped', '')
};

export const totalAirdropCount = async (...args) => {
  return catchApiError(async(chainId) => {
    const config = getPTokenAirdropConfig(chainId);
    return await PTokenAirdropNULSFactory(
      chainId,
      config.address
    ).totalAirdropCount();
  }, args, 'totalAirdropCount', '')
};

export const isUserPTokenExist = async (...args) => {
  return catchApiError(async (chainId, poolAddress, accountAddress) => {
    let res = '';
    const pool = perpetualPoolLiteFactory(chainId, poolAddress);
    await pool.init()
    const result = await pool.pToken.balanceOf(accountAddress);
    if (result === '1') {
      res = true;
    } else if (result === '0') {
      res = false;
    }
    return res;
  }, args, 'isUserPTokenExist', '');
};

export const isBTokenUnlocked = async(...args) => {
  return catchApiError(async(chainId, poolAddress, accountAddress) => {
    const pool = perpetualPoolLiteFactory(chainId, poolAddress);
    await pool.init()
    return await pool.bToken.isUnlocked(accountAddress, poolAddress)
  }, args, 'isUnlocked', '')
}

export const hasRequiredBalance = async(...args) => {
  return catchApiError(async(chainId, poolAddress, accountAddress) => {
    const pool = perpetualPoolLiteFactory(chainId, poolAddress);
    await pool.init()
    const res = await pool.bToken.balanceOf(accountAddress)
    console.log('res', res)
    return bg(res).gte(100)
  }, args, 'hasRequiredBalance', '')
}


// tx
export const unlockBToken = async (chainId, poolAddress, accountAddress) => {
  const args = [chainId, poolAddress, accountAddress];
  return catchTxApiError(async (chainId, poolAddress, accountAddress) => {
    const pool = perpetualPoolLiteFactory(chainId, poolAddress);
    await pool.init()
    return await pool.bToken.unlock(accountAddress, poolAddress);
  }, args);
};

export const airdropPToken = async (...args) => {
  return catchTxApiError(async (chainId, accountAddress) => {
    const config = getPTokenAirdropConfig(chainId);
    return await PTokenAirdropNULSFactory(
      chainId,
      config.address
    ).airdropPToken(accountAddress);
  }, args);
};
