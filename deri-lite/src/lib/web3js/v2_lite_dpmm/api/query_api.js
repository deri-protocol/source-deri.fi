import { checkApiInput, checkApiInputWithoutAccount, checkSymbolId, checkTokenId } from '../../shared/utils/derijsnext';
import { catchApiError } from '../../shared/utils/api';
import { bg } from '../../shared/utils';
import { perpetualPoolLiteDpmmFactory } from '../contract/factory';
import { poolApiFactory } from '../contract/PoolApi';
import { calculateDpmmCost } from '../calc';

export const getLiquidityInfo = async (chainId, poolAddress, accountAddress) => {
  const args = [chainId, poolAddress, accountAddress]
  return catchApiError(
    async (chainId, poolAddress, accountAddress) => {
      [chainId, poolAddress, accountAddress] = checkApiInput(
        chainId,
        poolAddress,
        accountAddress
      );
      const viewer = poolApiFactory(chainId, poolAddress);
      return await viewer.getLiquidityInfo(accountAddress);
    },
    args,
    'getLiquidityInfo',
    {
      totalSupply: '',
      poolLiquidity: '',
      shares: '',
      shareValue: '',
      maxRemovableShares: '',
    }
  );
};

export const getSpecification = async (chainId, poolAddress, symbolId) => {
  const args = [chainId, poolAddress, symbolId]
  return catchApiError(
    async (chainId, poolAddress, symbolId) => {
      [chainId, poolAddress] = checkApiInputWithoutAccount(chainId, poolAddress);
      symbolId = checkTokenId(symbolId)
      const viewer = poolApiFactory(chainId, poolAddress);
      return await viewer.getSpecification(symbolId);
    },
    args,
    'getSpecification',
    {
      symbol: '',
      bTokenSymbol: '',
      multiplier: '',
      feeRatio: '',
      fundingRateCoefficient: '',
      minPoolMarginRatio: '',
      minInitialMarginRatio: '',
      minMaintenanceMarginRatio: '',
      minLiquidationReward: '',
      maxLiquidationReward: '',
      liquidationCutRatio: '',
      protocolFeeCollectRatio: '',
      indexConstituents: { tokens: [], url: '' },
    }
  );
};

export const getPositionInfo = async(chainId, poolAddress, accountAddress, symbolId) => {
  const args = [chainId, poolAddress, accountAddress, symbolId]
  return catchApiError(
    async (chainId, poolAddress, accountAddress, symbolId) => {
      [chainId, poolAddress, accountAddress] = checkApiInput(
        chainId,
        poolAddress,
        accountAddress
      );
      symbolId = checkTokenId(symbolId)
      const viewer = poolApiFactory(chainId, poolAddress);
      return await viewer.getPositionInfo(accountAddress, symbolId);
    },
    args,
    'getPositionInfo',
    {}
  );
}

export const getPositionInfos = async(chainId, poolAddress, accountAddress) => {
  const args = [chainId, poolAddress, accountAddress]
  return catchApiError(
    async (chainId, poolAddress, accountAddress) => {
      [chainId, poolAddress, accountAddress] = checkApiInput(
        chainId,
        poolAddress,
        accountAddress
      );
      const viewer = poolApiFactory(chainId, poolAddress);
      return await viewer.getPositionInfos(accountAddress);
    },
    args,
    'getPositionInfos',
    []
  );
}

export const getWalletBalance = async(chainId, poolAddress, accountAddress) => {
  const args =  [chainId, poolAddress, accountAddress]
  return catchApiError(async(chainId, poolAddress, accountAddress) => {
      [chainId, poolAddress, accountAddress] = checkApiInput(
        chainId,
        poolAddress,
        accountAddress
      );
      const pool = perpetualPoolLiteDpmmFactory(chainId, poolAddress)
      await pool.init()
      return await pool.bToken.balanceOf(accountAddress)
  }, args, 'getWalletBalance', '')
}

export const isUnlocked = async(chainId, poolAddress, accountAddress) => {
  const args = [chainId, poolAddress, accountAddress]
  return catchApiError(
    async (chainId, poolAddress, accountAddress) => {
      [chainId, poolAddress, accountAddress] = checkApiInput(
        chainId,
        poolAddress,
        accountAddress
      );
      const pool = perpetualPoolLiteDpmmFactory(chainId, poolAddress);
      await pool.init();
      return await pool.bToken.isUnlocked(accountAddress, poolAddress);
    },
    args,
    'isUnlocked',
    false,
  );
}

export const getEstimatedMargin = async(chainId, poolAddress, accountAddress, volume, leverage, symbolId) => {
  const args = [chainId, poolAddress,accountAddress, volume, leverage, symbolId]
  return catchApiError(async(chainId, poolAddress, accountAddress, volume, leverage, symbolId) => {
      [chainId, poolAddress, accountAddress] = checkApiInput(
        chainId,
        poolAddress,
        accountAddress,
      );
      symbolId = checkTokenId(symbolId);
      const viewer = poolApiFactory(chainId, poolAddress);
      return await viewer.getEstimatedMargin(accountAddress, volume, leverage, symbolId);
  }, args, 'getEstimatedMargin', '')
}

export const getEstimatedFee = async(chainId, poolAddress, volume, symbolId) => {
  const args = [chainId, poolAddress, volume, symbolId]
  return catchApiError(async(chainId, poolAddress, volume, symbolId) => {
      [chainId, poolAddress] = checkApiInputWithoutAccount(
        chainId,
        poolAddress
      );
      symbolId = checkTokenId(symbolId);
      const viewer = poolApiFactory(chainId, poolAddress);
      return await viewer.getEstimatedFee(volume, symbolId);
  }, args, 'getEstimatedFee', '')
}

export const getFundingRate = async(chainId, poolAddress, symbolId) => {
  const args = [chainId, poolAddress, symbolId]
  return catchApiError(
    async (chainId, poolAddress, symbolId) => {
      [chainId, poolAddress] = checkApiInputWithoutAccount(
        chainId,
        poolAddress
      );
      symbolId = checkTokenId(symbolId);
      const viewer = poolApiFactory(chainId, poolAddress);
      return await viewer.getFundingRate(symbolId);
    },
    args,
    'getFundingRate',
    ''
  );
}
export const getEstimatedFundingRate = async(chainId, poolAddress, newVolume, symbolId) => {
  const args = [chainId, poolAddress, newVolume, symbolId]
  return catchApiError(
    async (chainId, poolAddress, newVolume, symbolId) => {
      [chainId, poolAddress] = checkApiInputWithoutAccount(
        chainId,
        poolAddress
      );
      symbolId = checkTokenId(symbolId);
      const viewer = poolApiFactory(chainId, poolAddress);
      return await viewer.getEstimatedFundingRate(newVolume, symbolId);
    },
    args,
    'getEstimatedFundingRate',
    ''
  );
}

export const getLiquidityUsed = async(chainId, poolAddress, symbolId) => {
  const args = [chainId, poolAddress, symbolId]
  return catchApiError(
    async (chainId, poolAddress, symbolId) => {
      [chainId, poolAddress] = checkApiInputWithoutAccount(
        chainId,
        poolAddress
      );
      symbolId = checkTokenId(symbolId);
      const viewer = poolApiFactory(chainId, poolAddress);
      return await viewer.getLiquidityUsed(symbolId);
    },
    args,
    'getLiquidityUsed',
    ''
  );
}

export const getEstimatedLiquidityUsed = async(chainId, poolAddress, newVolume, symbolId) => {
  const args = [chainId, poolAddress, newVolume, symbolId]
  return catchApiError(
    async (chainId, poolAddress, newVolume, symbolId) => {
      [chainId, poolAddress] = checkApiInputWithoutAccount(
        chainId,
        poolAddress
      );
      symbolId = checkTokenId(symbolId);
      const viewer = poolApiFactory(chainId, poolAddress);
      return await viewer.getEstimatedLiquidityUsed(newVolume, symbolId);
    },
    args,
    'getEstimatedLiquidityUsed',
    ''
  );
}

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
      //console.log('dpmmPrice', symbol.dpmmPrice.toString(), symbol.indexPrice)
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
