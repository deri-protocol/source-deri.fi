import { closePositionOption, depositMarginOption, tradeWithMarginOption, unlockOption, withdrawMarginOption } from '../option/api';
import { getPoolVersionId, LITE_VERSIONS, unlockDeri } from '../shared';
import {
  unlock2,
  tradeWithMargin2,
  closePosition2,
  depositMargin2,
  withdrawMargin2,
} from '../v1/api';
import {
  unlockV2,
  tradeWithMarginV2,
  closePositionV2,
  depositMarginV2,
  withdrawMarginV2,
} from '../v2/api';
import {
  unlockV2l,
  tradeWithMarginV2l,
  closePositionV2l,
  depositMarginV2l,
  withdrawMarginV2l,
} from '../v2_lite/api';

import { api as apiV2lDpmm } from '../v2_lite_dpmm/api'
import { api as apiV2Dpmm } from '../v2_dpmm/api'

export const unlock = async (
  chainId,
  poolAddress,
  accountAddress,
  bTokenId
) => {
  const version = getPoolVersionId(poolAddress)
  if (LITE_VERSIONS.includes(version)) {
    return unlockV2l(chainId, poolAddress, accountAddress);
  } else if (version === 'option') {
    return unlockOption(chainId, poolAddress, accountAddress);
  } else if (version === 'v2_lite_dpmm') {
    return apiV2lDpmm.unlock(chainId, poolAddress, accountAddress);
  } else if (version === 'v2_dpmm') {
    return apiV2Dpmm.unlock(chainId, poolAddress, accountAddress, bTokenId);
  }
  if (accountAddress === undefined) {
    return unlockDeri(chainId, poolAddress);
  } else if (bTokenId === undefined) {
    return unlock2(chainId, poolAddress, accountAddress);
  } else {
    return unlockV2(chainId, poolAddress, accountAddress, bTokenId);
  }
};

export const depositMargin = async (
  chainId,
  poolAddress,
  accountAddress,
  amount,
  bTokenId
) => {
  const version = getPoolVersionId(poolAddress)
  if (LITE_VERSIONS.includes(version)) {
    return depositMarginV2l(chainId, poolAddress, accountAddress, amount);
  } else if (version === 'option') {
    return depositMarginOption(chainId, poolAddress, accountAddress, amount);
  } else if (version === 'v2_lite_dpmm') {
    return apiV2lDpmm.depositMargin(chainId, poolAddress, accountAddress, amount);
  } else if (version === 'v2_dpmm') {
    return apiV2Dpmm.depositMargin(
      chainId,
      poolAddress,
      accountAddress,
      amount,
      bTokenId
    );
  }
  if (bTokenId === undefined) {
    return depositMargin2(chainId, poolAddress, accountAddress, amount);
  } else {
    return depositMarginV2(
      chainId,
      poolAddress,
      accountAddress,
      amount,
      bTokenId
    );
  }
};

export const withdrawMargin = async (
  chainId,
  poolAddress,
  accountAddress,
  amount,
  bTokenId,
  isMaximum
) => {
  const version = getPoolVersionId(poolAddress)
  if (LITE_VERSIONS.includes(version)) {
    return withdrawMarginV2l(
      chainId,
      poolAddress,
      accountAddress,
      amount,
      isMaximum
    );
  } else if (version === 'option') {
    return withdrawMarginOption(
      chainId,
      poolAddress,
      accountAddress,
      amount,
      isMaximum
    );
  } else if (version === 'v2_lite_dpmm') {
    return apiV2lDpmm.withdrawMargin(
      chainId,
      poolAddress,
      accountAddress,
      amount
    );
  } else if (version === 'v2_dpmm') {
    return apiV2Dpmm.withdrawMargin(
      chainId,
      poolAddress,
      accountAddress,
      amount,
      bTokenId,
    );
  }
  if (bTokenId === undefined) {
    return withdrawMargin2(chainId, poolAddress, accountAddress, amount);
  } else {
    return withdrawMarginV2(
      chainId,
      poolAddress,
      accountAddress,
      amount,
      bTokenId,
      isMaximum
    );
  }
};

export const tradeWithMargin = async (
  chainId,
  poolAddress,
  accountAddress,
  newVolume,
  symbolId
) => {
  const version = getPoolVersionId(poolAddress)
  if (LITE_VERSIONS.includes(version)) {
    return tradeWithMarginV2l(
      chainId,
      poolAddress,
      accountAddress,
      newVolume,
      symbolId
    );
  } else if (version === 'option') {
    return tradeWithMarginOption(
      chainId,
      poolAddress,
      accountAddress,
      newVolume,
      symbolId
    );
  } else if (version === 'v2_lite_dpmm') {
    return apiV2lDpmm.tradeWithMargin(
      chainId,
      poolAddress,
      accountAddress,
      newVolume,
      symbolId
    )
  } else if (version === 'v2_dpmm') {
    return apiV2Dpmm.tradeWithMargin(
      chainId,
      poolAddress,
      accountAddress,
      newVolume,
      symbolId
    );
  }
  if (symbolId === undefined) {
    return tradeWithMargin2(chainId, poolAddress, accountAddress, newVolume);
  } else {
    return tradeWithMarginV2(
      chainId,
      poolAddress,
      accountAddress,
      newVolume,
      symbolId
    );
  }
};

export const closePosition = async (
  chainId,
  poolAddress,
  accountAddress,
  symbolId
) => {
  const version = getPoolVersionId(poolAddress)
  if (LITE_VERSIONS.includes(version)) {
    return closePositionV2l(chainId, poolAddress, accountAddress, symbolId);
  } else if (version === 'option') {
    return closePositionOption(chainId, poolAddress, accountAddress, symbolId);
  } else if (version === 'v2_lite_dpmm') {
    return apiV2lDpmm.closePosition(chainId, poolAddress, accountAddress, symbolId);
  } else if (version === 'v2_dpmm') {
    return apiV2Dpmm.closePosition(
      chainId,
      poolAddress,
      accountAddress,
      symbolId,
    );
  }
  if (symbolId === undefined) {
    return closePosition2(chainId, poolAddress, accountAddress);
  } else {
    return closePositionV2(chainId, poolAddress, accountAddress, symbolId);
  }
};
