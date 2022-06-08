import { checkApiInput, checkApiInputWithoutAccount, checkSymbolId, checkTokenId } from '../../shared/utils/derijsnext';
import { catchApiError } from '../../shared/utils/api';
import { poolApiFactory } from '../contract/PoolApi';
import { ERC20Factory } from '../../shared/contract/factory';
import { calculateDpmmCost } from '../../v2_lite_dpmm/calc';
import { bg } from '../../shared';

export const getLiquidityInfo = async (
  chainId,
  poolAddress,
  accountAddress,
  bTokenId,
) => {
  return catchApiError(
    async () => {
      [chainId, poolAddress, accountAddress] = checkApiInput(
        chainId,
        poolAddress,
        accountAddress
      );
      bTokenId = checkTokenId(bTokenId)
      const api = poolApiFactory(chainId, poolAddress);
      await api.init();
      return await api.getLiquidityInfo(accountAddress, bTokenId);
    },
    [],
    'getLiquidityInfo',
    {
      maxRemovableShares: '',
      pnl: '',
      poolLiquidity: '',
      shares: '',
    }
  );
};

export const getSpecification = async (
  chainId,
  poolAddress,
  symbolId
) => {
  return catchApiError(
    async () => {
      [chainId, poolAddress] = checkApiInputWithoutAccount(
        chainId,
        poolAddress
      );
      symbolId = checkTokenId(symbolId)
      const api = poolApiFactory(chainId, poolAddress);
      await api.init();
      return await api.getSpecification(symbolId);
    },
    [],
    'getSpecification',
    {
      symbol: '',
      bTokenSymbol: [],
      bTokenMultiplier: [],
      multiplier: '',
      feeRatio: '',
      fundingRateCoefficient: '',
      minPoolMarginRatio: '',
      minInitialMarginRatio: '',
      minMaintenanceMarginRatio: '',
      liquidationCutRatio: '',
      protocolFeeCollectRatio: '',
      indexConstituents: { tokens: [], url: '' },
    }
  );
};

export const getPositionInfo = async (
  chainId,
  poolAddress,
  accountAddress,
  symbolId
) => {
  return catchApiError(
    async () => {
      [chainId, poolAddress, accountAddress] = checkApiInput(
        chainId,
        poolAddress,
        accountAddress
      );
      symbolId = checkTokenId(symbolId);
      const api = poolApiFactory(chainId, poolAddress);
      await api.init();
      return await api.getPositionInfo(accountAddress, symbolId);
    },
    [],
    'getPositionInfo',
    {}
  );
};

export const getPositionInfos = async (
  chainId,
  poolAddress,
  accountAddress,
) => {
  return catchApiError(
    async () => {
      [chainId, poolAddress, accountAddress] = checkApiInput(
        chainId,
        poolAddress,
        accountAddress
      );
      const api = poolApiFactory(chainId, poolAddress);
      await api.init();
      return await api.getPositionInfos(accountAddress);
    },
    [],
    'getPositionInfos',
    []
  );
};

export const getWalletBalance = async (
  chainId,
  poolAddress,
  accountAddress,
  bTokenId
) => {
  return catchApiError(
    async () => {
      [chainId, poolAddress, accountAddress] = checkApiInput(
        chainId,
        poolAddress,
        accountAddress
      );
      bTokenId = checkTokenId(bTokenId)
      const api = poolApiFactory(chainId, poolAddress);
      await api.init();
      const bTokenIndex = checkSymbolId(bTokenId, api.pool.bTokenIds);
      const bTokenAddress = api.pool.bTokens[bTokenIndex].bTokenAddress;
      const bToken = ERC20Factory(chainId, bTokenAddress);
      return await bToken.balanceOf(accountAddress);
    },
    [],
    'getWalletBalance',
    ''
  );
};

export const isUnlocked = async (
  chainId,
  poolAddress,
  accountAddress,
  bTokenId
) => {
  return catchApiError(
    async () => {
      [chainId, poolAddress, accountAddress] = checkApiInput(
        chainId,
        poolAddress,
        accountAddress
      );
      const api = poolApiFactory(chainId, poolAddress);
      await api.init();
      bTokenId = checkTokenId(bTokenId);
      const bTokenAddress = api.pool.bTokens[parseInt(bTokenId)].bTokenAddress;
      const bToken = ERC20Factory(chainId, bTokenAddress);
      return await bToken.isUnlocked(accountAddress, poolAddress);
    },
    [],
    'isUnlocked',
    ''
  );
};

export const getEstimatedMargin = async (
  chainId,
  poolAddress,
  accountAddress,
  volume,
  leverage,
  symbolId,
) => {
  return catchApiError(
    async () => {
      [chainId, poolAddress, accountAddress] = checkApiInput(
        chainId,
        poolAddress,
        accountAddress
      );
      symbolId = checkTokenId(symbolId)
      const api = poolApiFactory(chainId, poolAddress);
      await api.init(true);
      return await api.getEstimatedMargin(accountAddress, volume, leverage, symbolId);
    },
    [],
    'getEstimatedMargin',
    ''
  );
};

export const getEstimatedFee = async (
  chainId,
  poolAddress,
  volume,
  symbolId,
) => {
  return catchApiError(
    async () => {
      [chainId, poolAddress ] = checkApiInputWithoutAccount(
        chainId,
        poolAddress,
      );
      symbolId = checkTokenId(symbolId)
      const api = poolApiFactory(chainId, poolAddress);
      await api.init(true);
      return await api.getEstimatedFee(volume, symbolId);
    },
    [],
    'getEstimatedFee',
    ''
  );
};

export const getFundingRate = async (chainId, poolAddress, symbolId) => {
  return catchApiError(
    async () => {
      [chainId, poolAddress] = checkApiInputWithoutAccount(
        chainId,
        poolAddress
      );
      symbolId = checkTokenId(symbolId)
      const api = poolApiFactory(chainId, poolAddress);
      await api.init();
      return await api.getFundingRate(symbolId);
    },
    [],
    'getFundingRate',
    ''
  );
};

export const getEstimatedFundingRate = async (
  chainId,
  poolAddress,
  newVolume,
  symbolId
) => {
  return catchApiError(
    async () => {
      [chainId, poolAddress] = checkApiInputWithoutAccount(
        chainId,
        poolAddress
      );
      symbolId = checkTokenId(symbolId)
      const api = poolApiFactory(chainId, poolAddress);
      await api.init(true);
      return await api.getEstimatedFundingRate(newVolume, symbolId);
    },
    [],
    'getFundingRate',
    ''
  );
};

export const getLiquidityUsed = async (
  chainId,
  poolAddress,
) => {
  return catchApiError(
    async () => {
      [chainId, poolAddress] = checkApiInputWithoutAccount(
        chainId,
        poolAddress
      );
      const api = poolApiFactory(chainId, poolAddress);
      await api.init();
      return await api.getLiquidityUsed();
    },
    [],
    'getLiquidityUsed',
    ''
  );
};

export const getEstimatedLiquidityUsed = async (
  chainId,
  poolAddress,
  newVolume,
  symbolId
) => {
  return catchApiError(
    async () => {
      [chainId, poolAddress] = checkApiInputWithoutAccount(
        chainId,
        poolAddress
      );
      symbolId = checkTokenId(symbolId)
      const api = poolApiFactory(chainId, poolAddress);
      await api.init(true);
      return await api.getEstimatedLiquidityUsed(newVolume, symbolId);
    },
    [],
    'getEstimatedLiquidityUsed',
    ''
  );
};

export const getPoolBTokensBySymbolId = async (
  chainId,
  poolAddress,
  accountAddress,
  symbolId
) => {
  return catchApiError(
    async () => {
      [chainId, poolAddress, accountAddress] = checkApiInput(
        chainId,
        poolAddress,
        accountAddress
      );
      //symbolId = checkTokenId(symbolId)
      const api = poolApiFactory(chainId, poolAddress);
      await api.init();
      return await api.getPoolBTokensBySymbolId(accountAddress, symbolId);
    },
    [],
    'getPoolBTokensBySymbolId',
    []
  );
};


export const getFundingFee = async (
  chainId,
  poolAddress,
  accountAddress,
  symbolId
) => {
  return catchApiError(
    async () => {
      [chainId, poolAddress, accountAddress] = checkApiInput(
        chainId,
        poolAddress,
        accountAddress
      );
      symbolId = checkTokenId(symbolId)
      const api = poolApiFactory(chainId, poolAddress);
      await api.init();
      return await api.getFundingFee(accountAddress, symbolId);
    },
    [],
    'getFundingFee',
    []
  );
};

export const getEstimatedTimePrice = async (
  chainId,
  poolAddress,
  newNetVolume,
  symbolId
) => {
  return catchApiError(
    async () => {
      [chainId, poolAddress ] = checkApiInputWithoutAccount(
        chainId,
        poolAddress,
      );
      symbolId = checkTokenId(symbolId);
      const api = poolApiFactory(chainId, poolAddress);
      await api.init();
      const pool = api.pool;
      const symbolIndex = checkSymbolId(symbolId, pool.activeSymbolIds);
      if (!pool.isSymbolsUpdated()) {
        await pool.getSymbols();
      }
      const symbol = pool.symbols[symbolIndex];
      const cost = calculateDpmmCost(
        symbol.indexPrice,
        symbol.K,
        symbol.tradersNetVolume,
        symbol.multiplier,
        newNetVolume
      );
      return bg(cost).div(symbol.multiplier).div(newNetVolume).toString();
    },
    [],
    'getEstimatedTimePrice',
    ''
  );
};
