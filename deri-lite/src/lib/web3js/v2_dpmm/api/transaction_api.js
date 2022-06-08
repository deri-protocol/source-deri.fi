import {
  bg,
  checkApiInput,
  deriToNatural,
  MAX_INT256,
} from '../../shared';
import { ERC20Factory } from '../../shared/contract/factory';
import { catchTxApiError } from '../../shared/utils/api';
import { checkAmount, checkSymbolId, checkTokenId } from '../../shared/utils/derijsnext';
import { perpetualPoolDpmmFactory } from '../contract/factory.js';

// mining
export const addLiquidity = async (
  chainId,
  poolAddress,
  accountAddress,
  amount,
  bTokenId,
) => {
  return catchTxApiError(async () => {
    [chainId, poolAddress, accountAddress] = checkApiInput(
      chainId,
      poolAddress,
      accountAddress
    );
    amount = checkAmount(amount);
    bTokenId = checkTokenId(bTokenId);
    const pool = perpetualPoolDpmmFactory(chainId, poolAddress);
    await pool.init();
    return await pool.router.addLiquidity(accountAddress, bTokenId, amount);
  }, []);
};

export const removeLiquidity = async (
  chainId,
  poolAddress,
  accountAddress,
  amount,
  bTokenId,
  isMaximum = false
) => {
  return catchTxApiError(async () => {
    [chainId, poolAddress, accountAddress] = checkApiInput(
      chainId,
      poolAddress,
      accountAddress
    );
    amount = checkAmount(amount);
    bTokenId = checkTokenId(bTokenId);
    const pool = perpetualPoolDpmmFactory(chainId, poolAddress);
    await pool.init();
    if (isMaximum) {
      amount = deriToNatural(MAX_INT256).toString()
    }
    return await pool.router.removeLiquidity(accountAddress, bTokenId, amount);
  }, []);
};

//trading
export const unlock = async (chainId, poolAddress, accountAddress, bTokenId) => {
  return catchTxApiError(async () => {
    [chainId, poolAddress, accountAddress] = checkApiInput(
      chainId,
      poolAddress,
      accountAddress
    );
    bTokenId = checkTokenId(bTokenId)
    const pool = perpetualPoolDpmmFactory(chainId, poolAddress);
    await pool.init();
    const bTokenIndex = checkSymbolId(bTokenId, pool.bTokenIds)
    const bTokenAddress = pool.bTokens[bTokenIndex].bTokenAddress;
    const bToken = ERC20Factory(chainId, bTokenAddress);
    return await bToken.unlock(accountAddress, poolAddress);
  }, []);
};

export const depositMargin = async (chainId, poolAddress, accountAddress, amount, bTokenId) => {
  return catchTxApiError(
    async () => {
      [chainId, poolAddress, accountAddress] = checkApiInput(
        chainId,
        poolAddress,
        accountAddress
      );
      amount = checkAmount(amount)
      bTokenId = checkTokenId(bTokenId)
      const pool = perpetualPoolDpmmFactory(chainId, poolAddress);
      await pool.init();
      return await pool.router.addMargin(accountAddress, bTokenId, amount);
    },
    []
  );
};

export const withdrawMargin = async (chainId, poolAddress, accountAddress, amount, bTokenId) => {
  return catchTxApiError(
    async () => {
      [chainId, poolAddress, accountAddress] = checkApiInput(
        chainId,
        poolAddress,
        accountAddress
      );
      amount = checkAmount(amount)
      bTokenId = checkTokenId(bTokenId)
      const pool = perpetualPoolDpmmFactory(chainId, poolAddress);
      await pool.init();
      return await pool.router.removeMargin(accountAddress, bTokenId, amount);
    },
    []
  );
};

export const tradeWithMargin = async (chainId, poolAddress, accountAddress, newVolume, symbolId) => {
  return catchTxApiError(
    async () => {
      [chainId, poolAddress, accountAddress] = checkApiInput(
        chainId,
        poolAddress,
        accountAddress
      );
      newVolume = checkAmount(newVolume)
      symbolId = checkTokenId(symbolId)
      const pool = perpetualPoolDpmmFactory(chainId, poolAddress);
      await pool.init();
      return await pool.router.trade(accountAddress, symbolId, newVolume);
    },
    []
  );
};

export const closePosition = async (chainId, poolAddress, accountAddress, symbolId) => {
  return catchTxApiError(
    async () => {
      [chainId, poolAddress, accountAddress] = checkApiInput(
        chainId,
        poolAddress,
        accountAddress
      );
      symbolId = checkTokenId(symbolId)
      const pool = perpetualPoolDpmmFactory(chainId, poolAddress);
      await pool.init();
      const { volume } = await pool.pToken.getPosition(
        accountAddress,
        symbolId
      );
      if (!bg(volume).eq(0)) {
        const newVolume = bg(volume).negated().toString();
        return await pool.router.trade(accountAddress, symbolId, newVolume);
      } else {
        throw new Error('no position to close');
      }
    },
    []
  );
};
