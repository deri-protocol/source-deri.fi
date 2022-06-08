import { bTokenFactory, clp2PoolFactory } from '../factory/contract';
import { getLpConfig } from '../config/pool_v1';

export const getClp2LiquidityInfo = async (
  chainId,
  poolAddress,
  accountAddress
) => {
  const { bTokenAddress } = getLpConfig(chainId, poolAddress);
  if (bTokenAddress) {
    const clp2Pool = clp2PoolFactory(chainId, poolAddress);
    const bToken = bTokenFactory(chainId, bTokenAddress);
    const [liquidity, bTokenBalance, shares] = await Promise.all([
      bToken.balanceOf(poolAddress),
      bToken.balanceOf(accountAddress),
      clp2Pool.getLiquidity(accountAddress),
    ]);

    return {
      poolLiquidity: liquidity.toString(),
      bTokenBalance: bTokenBalance.toString(),
      shares: shares.toString(),
      shareValue: '1',
    };
  }
  console.log('no Clp2Pool address, please check');
  return {};
};

export const addClp2Liquidity = async (
  chainId,
  poolAddress,
  accountAddress,
  amount
) => {
  let res;
  const { bTokenAddress } = getLpConfig(chainId, poolAddress);
  if (bTokenAddress) {
    const clp2Pool = clp2PoolFactory(chainId, poolAddress);
    //const bToken = bTokenFactory(chainId, bTokenAddress, poolAddress);
    try {
      const tx = await clp2Pool.addLiquidity(accountAddress, amount);
      res = { success: true, transaction: tx };
    } catch (err) {
      res = { success: false, error: err };
    }
  } else {
    res = { success: false, error: 'unable to get bToken address of clp2 pool' };
  }
  return res;
};

export const removeClp2Liquidity = async (
  chainId,
  poolAddress,
  accountAddress,
  amount
) => {
  let res;
  const { bTokenAddress } = getLpConfig(chainId, poolAddress);
  if (bTokenAddress) {
    const clp2Pool = clp2PoolFactory(chainId, poolAddress);
    //const bToken = bTokenFactory(chainId, bTokenAddress, poolAddress);
    try {
      const tx = await clp2Pool.removeLiquidity(accountAddress, amount);
      res = { success: true, transaction: tx };
    } catch (err) {
      res = { success: false, error: err };
    }
  } else {
    res = { success: false, error: 'unable to get bToken address of clp2 pool' };
  }
  return res;
};

export const isClp2Unlocked = async (chainId, poolAddress, accountAddress) => {
  const { bTokenAddress } = getLpConfig(chainId, poolAddress);
  const bToken = bTokenFactory(chainId, bTokenAddress);
  return await bToken.isUnlocked(accountAddress, poolAddress);
};

export const unlockClp2 = async (chainId, poolAddress, accountAddress) => {
  const { bTokenAddress } = getLpConfig(chainId, poolAddress);
  const bToken = bTokenFactory(chainId, bTokenAddress);

  let res;
  try {
    const tx = await bToken.unlock(accountAddress, poolAddress);
    res = { success: true, transaction: tx };
  } catch (err) {
    res = { success: false, error: err };
  }
  return res;
};

export const getClp2WalletBalance = async (
  chainId,
  poolAddress,
  accountAddress
) => {
  const { bTokenAddress } = getLpConfig(chainId, poolAddress);
  const bToken = bTokenFactory(chainId, bTokenAddress);
  const balance = await bToken.balanceOf(accountAddress);
  return balance.toString();
};
