import { bg, fromWei, fetchJson } from '../../shared/utils';
import {
  checkApiInput,
  checkApiInputWithoutAccount,
  checkAmount,
  ADDRESS_ZERO,
} from '../../shared/config';
import { catchApiError, catchSyncApiError } from '../../shared/utils/api';
import { poolApiFactory } from '../contract/PoolApi';
import { ERC20Factory } from '../../shared/contract/factory';
import { checkToken, getBTokenAddress, getBTokenApyAndDiscounts, nativeCoinSymbols } from '../config';

export const getUserStakeInfo = async (
  chainId,
  poolAddress,
  accountAddress
) => {
  return catchApiError(
    async () => {
      [chainId, poolAddress, accountAddress] = checkApiInput(
        chainId,
        poolAddress,
        accountAddress
      );
      const api = poolApiFactory(chainId, poolAddress);
      await api.init(accountAddress);
      return await api.getUserStakeInfo(accountAddress);
    },
    [],
    {
      chainId: chainId,
      poolAddress: poolAddress,
      isStaked: false,
      bTokens: []
    }
  );
};


export const getPoolB0Info = async (
  chainId,
  poolAddress,
) => {
  return catchApiError(
    async () => {
      [chainId, poolAddress] = checkApiInputWithoutAccount(
        chainId,
        poolAddress,
      );
      const api = poolApiFactory(chainId, poolAddress);
      await api.init();
      return await api.getPoolB0Info();
    },
    [],
    {
      poolAddress: poolAddress,
      balanceOfB0: '',
      insufficientB0: '',
    }
  );
};

export const getLiquidityInfo = async (
  chainId,
  poolAddress,
  accountAddress,
  bTokenSymbol,
) => {
  return catchApiError(
    async () => {
      [chainId, poolAddress, accountAddress] = checkApiInput(
        chainId,
        poolAddress,
        accountAddress
      );
      const api = poolApiFactory(chainId, poolAddress);
      await api.init(accountAddress);
      bTokenSymbol = checkToken(bTokenSymbol);
      return await api.getLiquidityInfo(accountAddress, bTokenSymbol);
    },
    [],
    {
      poolLiquidity: '',
      shares: '',
      maxRemovableShares: '',
      pnl: '',
      bToken0Symbol: '',
      swappedPnl: '',
    }
  );
};

export const getEstimatedLiquidityInfo = async (
  chainId,
  poolAddress,
  accountAddress,
  newAmount,
  bTokenSymbol,
) => {
  return catchApiError(
    async () => {
      [chainId, poolAddress, accountAddress] = checkApiInput(
        chainId,
        poolAddress,
        accountAddress
      );
      bTokenSymbol = checkToken(bTokenSymbol);
      newAmount = checkAmount(newAmount);
      const api = poolApiFactory(chainId, poolAddress);
      //await api.init();
      return await api.getEstimatedLiquidityInfo(
        accountAddress,
        newAmount,
        bTokenSymbol
      );
    },
    [],
    {
      percentage1: '',
      shares1: '',
    }
  );
}

export const getSpecification = async (chainId, poolAddress, symbol) => {
  return catchApiError(
    async () => {
      [chainId, poolAddress] = checkApiInputWithoutAccount(
        chainId,
        poolAddress
      );
      symbol = checkToken(symbol);
      const api = poolApiFactory(chainId, poolAddress);
      await api.init();
      return await api.getSpecification(symbol);
    },
    [],
    {
      symbol: '',
      feeRatio: '',
      bTokenSymbol: '',
      bTokenMultiplier: [],
      fundingRateCoefficient:'',
      minPoolMarginRatio: '',
      initialMarginRatio: '',
      maintenanceMarginRatio: '',
      minLiquidationReward: '',
      maxLiquidationReward: '',
      liquidationCutRatio: '',
      protocolFeeCollectRatio: '',
      indexConstituents: [],
      minRatioB0: '',
      reserveRatioB0: '',
      minTradeVolume: '',
    }
  );
};

export const getPositionInfo = async (
  chainId,
  poolAddress,
  accountAddress,
  symbol
) => {
  return catchApiError(
    async () => {
      [chainId, poolAddress ] = checkApiInputWithoutAccount(
        chainId,
        poolAddress,
      );
      if (!accountAddress) {
        accountAddress = ADDRESS_ZERO
      }
      symbol = checkToken(symbol);
      const api = poolApiFactory(chainId, poolAddress);
      await api.init(accountAddress);
      return await api.getPositionInfo(accountAddress, symbol);
    },
    [],
    {
      symbol: '',
      symbolUnit: '',
      b0Unit: '',
      price: '',
      indexPrice: '',
      markPrice: '',
      volume: '',
      averageEntryPrice: '',
      margin: '',
      marginHeld: '',
      marginHeldBySymbol: '',
      unrealizedPnl: '',
      unrealizedPnlList: [],
      fundingFee: '',
      liquidationPrice: '',
    }
  );
};

export const getPositionInfos = async (
  chainId,
  poolAddress,
  accountAddress
) => {
  return catchApiError(
    async () => {
      [chainId, poolAddress, accountAddress] = checkApiInput(
        chainId,
        poolAddress,
        accountAddress
      );
      const api = poolApiFactory(chainId, poolAddress);
      await api.init(accountAddress);
      return await api.getPositionInfos(accountAddress);
    },
    [],
    []
  );
};

export const getPoolMarkPrices = async (chainId, poolAddress) => {
  const api = poolApiFactory(chainId, poolAddress);
  await api.init();
  return await api.getPoolMarkPrices();
};

export const getWalletBalance = async (
  chainId,
  poolAddress,
  accountAddress,
  bTokenSymbol
) => {
  return catchApiError(
    async () => {
      [chainId, poolAddress, accountAddress] = checkApiInput(
        chainId,
        poolAddress,
        accountAddress
      );
      bTokenSymbol = checkToken(bTokenSymbol);
      if (nativeCoinSymbols(chainId).includes(bTokenSymbol)) {
        const api = poolApiFactory(chainId, poolAddress);
        await api.pool._init();
        return fromWei(await api.pool.web3.eth.getBalance(accountAddress))
      } else {
      const api = poolApiFactory(chainId, poolAddress);
      await api.init();
      const bToken = ERC20Factory(
        chainId,
        getBTokenAddress(bTokenSymbol, api.pool.bTokens)
      );
      return await bToken.balanceOf(accountAddress);
      }
    },
    [],
    ''
  );
};

export const isUnlocked = async (
  chainId,
  poolAddress,
  accountAddress,
  bTokenSymbol
) => {
  return catchApiError(
    async () => {
      [chainId, poolAddress, accountAddress] = checkApiInput(
        chainId,
        poolAddress,
        accountAddress
      );
      const api = poolApiFactory(chainId, poolAddress);
      await api.init(ADDRESS_ZERO, true);
      bTokenSymbol = checkToken(bTokenSymbol);
      if (nativeCoinSymbols(chainId).includes(bTokenSymbol)) {
        return true
      } else {
        const baseToken = api.pool.bTokens.find(
          (b) => b.bTokenSymbol === bTokenSymbol
        )
        if (baseToken) {
          const bToken = ERC20Factory(chainId, baseToken.bTokenAddress);
          return await bToken.isUnlocked(accountAddress, poolAddress);
        } else {
          return false
        }
      }
    },
    [],
    false,
  );
};

export const getEstimatedMargin = async (
  chainId,
  poolAddress,
  accountAddress,
  volume,
  leverage,
  symbol
) => {
  return catchApiError(
    async () => {
      [chainId, poolAddress, accountAddress] = checkApiInput(
        chainId,
        poolAddress,
        accountAddress
      );
      symbol = checkToken(symbol);
      const api = poolApiFactory(chainId, poolAddress);
      //await api.init();
      return await api.getEstimatedMargin(
        accountAddress,
        volume,
        leverage,
        symbol
      );
    },
    [],
    ''
  );
};

export const getEstimatedFee = async (
  chainId,
  poolAddress,
  volume,
  symbol
) => {
  return catchApiError(
    async () => {
      [chainId, poolAddress] = checkApiInputWithoutAccount(
        chainId,
        poolAddress
      );
      symbol = checkToken(symbol);
      const api = poolApiFactory(chainId, poolAddress);
      //await api.init();
      return await api.getEstimatedFee(volume, symbol);
    },
    [],
    ''
  );
};

export const getFundingRate = async (chainId, poolAddress, symbol) => {
  return catchApiError(
    async () => {
      [chainId, poolAddress] = checkApiInputWithoutAccount(
        chainId,
        poolAddress
      );
      symbol = checkToken(symbol);
      const api = poolApiFactory(chainId, poolAddress);
      await api.init();
      return await api.getFundingRate(symbol);
    },
    [],
    {
      funding0: '',
      fundingPerSecond: '',
      liquidity: '',
      tradersNetVolume: '',
    }
  );
};

export const getEstimatedFundingRate = async (
  chainId,
  poolAddress,
  newVolume,
  symbol
) => {
  return catchApiError(
    async () => {
      [chainId, poolAddress] = checkApiInputWithoutAccount(
        chainId,
        poolAddress
      );
      symbol = checkToken(symbol);
      const api = poolApiFactory(chainId, poolAddress);
      //await api.init();
      return await api.getEstimatedFundingRate(newVolume, symbol);
    },
    [],
    {
      funding1: '',
    }
  );
};

export const getLiquidityUsed = async (chainId, poolAddress) => {
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
    ''
  );
};

export const getEstimatedLiquidityUsed = async (
  chainId,
  poolAddress,
  newVolume,
  symbol
) => {
  return catchApiError(
    async () => {
      [chainId, poolAddress] = checkApiInputWithoutAccount(
        chainId,
        poolAddress
      );
      symbol = checkToken(symbol);
      const api = poolApiFactory(chainId, poolAddress);
      //await api.init();
      return await api.getEstimatedLiquidityUsed(newVolume, symbol);
    },
    [],
    ''
  );
};

export const getUserBTokensInfo = async (
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
      await api.init(accountAddress);
      return await api.getUserBTokensInfo(accountAddress);
    },
    [],
    []
  );
};

export const getFundingFee = async (
  chainId,
  poolAddress,
  accountAddress,
  symbol
) => {
  return catchApiError(
    async () => {
      [chainId, poolAddress, accountAddress] = checkApiInput(
        chainId,
        poolAddress,
        accountAddress
      );
      symbol = checkToken(symbol);
      const api = poolApiFactory(chainId, poolAddress);
      await api.init(accountAddress);
      return await api.getFundingFee(accountAddress, symbol);
    },
    [],
    ''
  );
};

export const getEstimatedTimePrice = async (
  chainId,
  poolAddress,
  newNetVolume,
  symbolName,
) => {
  return catchApiError(
    async () => {
      [chainId, poolAddress] = checkApiInputWithoutAccount(
        chainId,
        poolAddress
      );
      symbolName = checkToken(symbolName);
      const api = poolApiFactory(chainId, poolAddress);
      //await api.init();
      return await api.getEstimatedTimePrice(newNetVolume, symbolName)
    },
    [],
    ''
  );
};

export const getEstimatedLiquidatePrice = async (
  chainId,
  poolAddress,
  accountAddress,
  newVolume
) => {
  return catchApiError(
    async () => {
      [chainId, poolAddress, accountAddress] = checkApiInput(
        chainId,
        poolAddress,
        accountAddress
      );
      const api = poolApiFactory(chainId, poolAddress);
      return await api.getEstimatedLiquidatePrice(accountAddress, newVolume);
    },
    [],
    ''
  );
};

export const getVolatility = async (
  chainId,
  poolAddress,
  symbolName
) => {
  return catchApiError(
    async () => {
      [chainId, poolAddress ] = checkApiInputWithoutAccount(
        chainId,
        poolAddress,
      );
      symbolName = checkToken(symbolName);
      const api = poolApiFactory(chainId, poolAddress);
      await api.init();
      return await api.getVolatility(symbolName)
    },
    [],
    ''
  );
};


export const getEstimatedLpInfo = async (
  chainId,
  poolAddress,
  accountAddress,
  bTokenSymbol,
  newVolume = '0',
) => {
  return catchApiError(
    async () => {
      [chainId, poolAddress, accountAddress] = checkApiInput(
        chainId,
        poolAddress,
        accountAddress
      );
      const api = poolApiFactory(chainId, poolAddress);
      await api.init(accountAddress);
      return await api.getEstimatedLpInfo(
        accountAddress,
        bTokenSymbol,
        newVolume,
      );
    },
  );
};

export const getEstimatedTdInfo = async (
  chainId,
  poolAddress,
  accountAddress,
  bTokenSymbol,
  newVolume = '0',
) => {
  return catchApiError(
    async () => {
      [chainId, poolAddress, accountAddress] = checkApiInput(
        chainId,
        poolAddress,
        accountAddress
      );
      const api = poolApiFactory(chainId, poolAddress);
      await api.init(accountAddress);
      return await api.getEstimatedTdInfo(
        accountAddress,
        bTokenSymbol,
        newVolume,
      );
    },
  );
};

export const getBTokenDiscount = async (chainId, poolAddress) => {
  return catchApiError(
    async () => {
      [chainId, poolAddress] = checkApiInputWithoutAccount(
        chainId,
        poolAddress
      );
      const api = poolApiFactory(chainId, poolAddress);
      await api.init();
      const bTokenMultiplier = (
        await getBTokenApyAndDiscounts(
          chainId,
          poolAddress,
          api.pool.bTokens,
        )
      ).map((b) => bg(b.factor).times(1.25).toString());

        return api.pool.bTokens.map((b, index) => ({
        bTokenSymbol: b.bTokenSymbol,
        discount: bTokenMultiplier[index],
      }));
    },
    [],
    []
  );
};


export const getEstimatedDpmmCost = (chainId, poolAddress, newVolume) => {
  return catchSyncApiError(
    () => {
      [chainId, poolAddress] = checkApiInputWithoutAccount(
        chainId,
        poolAddress
      );
      const api = poolApiFactory(chainId, poolAddress);
      //await api.init();
      return api.getEstimatedDpmmCost(newVolume);
    },
    [],
    ''
  );
};