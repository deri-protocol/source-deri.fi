//import { getLiquidityInfo2 } from '../v1/api/rest_api';
import {
  getPoolVersionId,
  LITE_VERSIONS,
} from '../shared/config';
import {
  getPoolLiquidity as getPoolLiquidity1,
  getPoolInfoApy as getPoolInfoApy1,
} from '../shared/api/database_api';
import { getLiquidityInfo2 } from '../v1/api';
import {
  getLiquidityInfoV2,
  getPoolInfoApyV2,
  getPoolLiquidityV2,
} from '../v2/api';
import {
  getLiquidityInfoV2l,
} from '../v2_lite/api';
import {
  getLiquidityInfoOption,
} from '../option/api';

import { api as apiV2lDpmm } from '../v2_lite_dpmm/api'
import { api as apiV2Dpmm } from '../v2_dpmm/api'

export const getLiquidityInfo = async (
  chainId,
  poolAddress,
  accountAddress,
  bTokenId,
) => {
  const versionId = getPoolVersionId(poolAddress)
  if (LITE_VERSIONS.includes(versionId)) {
    return getLiquidityInfoV2l(chainId, poolAddress, accountAddress)
  } else if (versionId === 'option') {
    return getLiquidityInfoOption(chainId, poolAddress, accountAddress)
  } else if (versionId === 'v2_lite_dpmm') {
    return apiV2lDpmm.getLiquidityInfo(chainId, poolAddress, accountAddress)
  } else if (versionId === 'v2_dpmm') {
    return apiV2Dpmm.getLiquidityInfo(chainId, poolAddress, accountAddress, bTokenId)
  }
  if (bTokenId === undefined) {
    return getLiquidityInfo2(chainId, poolAddress, accountAddress)
  } else {
    return getLiquidityInfoV2(chainId, poolAddress, accountAddress, bTokenId)
  }
};

export const getPoolLiquidity = async (
  chainId,
  poolAddress,
  bTokenId,
) => {
  if (bTokenId != null) {
    return getPoolLiquidityV2(chainId, poolAddress, bTokenId)
  } else {
    return getPoolLiquidity1(chainId, poolAddress)
  }
};

export const getPoolInfoApy = async (chainId, poolAddress, bTokenId) => {
  if (bTokenId != null) {
    return getPoolInfoApyV2(chainId, poolAddress, bTokenId)
  } else {
    return getPoolInfoApy1(chainId, poolAddress)
  }
};
