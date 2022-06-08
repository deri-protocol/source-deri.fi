import { databaseFactory, databaseAirdropFactory } from '../factory';
import {
  toChecksumAddress,
  getNetworkName,
  deriToString,
  deriToBool,
  deriToNatural,
  //getPoolContractAddress,
} from '../utils';
import { getPoolV1Config } from '../config/pool_v1'
// import { getLiquidityUsed } from "./contractApi";

export const getUserInfo = async (userAddress) => {
  const db = databaseFactory(true);
  userAddress = toChecksumAddress(userAddress);
  let res,
    retry = 2;
  while (retry > 0) {
    res = await db.getValues([
      `${userAddress}.claim.chainId`,
      `${userAddress}.claim.amount`,
      `${userAddress}.claim.deadline`,
      `${userAddress}.claim.nonce`,
      `${userAddress}.claim.v`,
      `${userAddress}.claim.r`,
      `${userAddress}.claim.s`,
      `${userAddress}.claim.valid`,
    ]);
    if (
      Math.floor(new Date().getTime() / 1000) < parseInt(deriToString(res[2]))
    ) {
      break;
    } else {
      retry -= 1;
      db.web3 = null;
      if (retry === 0) {
        // deadline is outdated
        res[7] = false;
      }
    }
  }
  if (res) {
    const [chainId, amount, deadline, nonce, v, r, s, valid] = res;
    return {
      chainId: deriToString(chainId),
      amount: deriToNatural(amount).toString(),
      deadline: deriToString(deadline),
      nonce: deriToString(nonce),
      v: deriToString(v),
      r,
      s,
      valid: deriToBool(valid),
    };
  }
};

export const getUserInfoHarvest = async (userAddress) => {
  const db = databaseFactory(true);
  userAddress = toChecksumAddress(userAddress);
  const res = await db
    .getValues([
      `${userAddress}.claim.harvest.lp`,
      `${userAddress}.claim.harvest.trade`,
    ])
    .catch((err) => console.log('getUserInfoHarvest', err));
  if (res) {
    const [harvestLp, harvestTrade] = res;
    return {
      lp: deriToNatural(harvestLp).toString(),
      trade: deriToNatural(harvestTrade).toString(),
    };
  }
};

export const getUserInfoTotal = async (userAddress) => {
  const db = databaseFactory(true);
  userAddress = toChecksumAddress(userAddress);
  const res = await db
    .getValues([`${userAddress}.claim.total`])
    .catch((err) => console.log('getUserInfoTotal', err));
  if (res) {
    const [total] = res;
    return {
      total: deriToNatural(total).toString(),
    };
  }
};

/**
 * Get user claim info from database
 * @async
 * @method
 * @param {string} userAddress - account address
 * @returns {Object} response
 * @returns {string} resposne.chainId
 * @returns {BigNumber} response.amount
 * @returns {string} response.deadline
 * @returns {string} response.nonce
 * @returns {string} response.v
 * @returns {string} response.r
 * @returns {string} response.s
 * @returns {bool} response.valid
 * @returns {BigNumber} response.lp
 * @returns {BigNumber} response.trade
 * @returns {string} response.total
 */
export const getUserInfoAll = async (userAddress) => {
  const [userInfo, userInfoHarvest, userInfoTotal] = await Promise.all([
    getUserInfo(userAddress),
    getUserInfoHarvest(userAddress),
    getUserInfoTotal(userAddress),
  ]);
  return Object.assign(userInfo, userInfoHarvest, userInfoTotal);
};

/**
 * Get pool liquidity
 * @async
 * @method
 * @param {string} chainId
 * @param {string} poolAddress
 * @returns {Object} response
 * @returns {string} response.liquidity
 * @returns {symbol} response.symbol
 */
export const getPoolLiquidity = async (chainId, poolAddress) => {
  // use the dev database
  const db = databaseFactory();
  try {
    const res = await db
      .getValues([`${chainId}.${poolAddress}.liquidity`])
      .catch((err) => console.log('getPoolLiquidity', err));
    //const { symbol } = getPoolV1Config(chainId, poolAddress)
    if (res) {
      const [liquidity] = res;
      return {
        liquidity: deriToNatural(liquidity).toString(),
        //symbol,
      };
    }
  } catch (err) {
    console.log(err);
  }
  return {
    liquidity: ''
  }
};

export const getPoolLiquidityAll = async (pools) => {
  // use the dev database
  const db = databaseFactory();
  if (Array.isArray(pools)) {
    const keys = pools.reduce((acc, pool) => {
      if (pool.version === 'v2' && pool.bTokenId) {
        return acc.concat([
          `${pool.chainId}.${pool.pool}.liquidity${pool.bTokenId}`,
        ]);
      } else {
        return acc.concat([`${pool.chainId}.${pool.pool}.liquidity`]);
      }
    }, []);
    try {
      const res = await db.getValues(keys);
      if (res) {
        return res.map((i) => deriToNatural(i));
      }
    } catch (err) {
      console.log(err.toString());
    }
    return [];
  }
};

export const getPoolInfoApyAll = async (pools) => {
  // use the dev database
  const db = databaseFactory(true);
  if (Array.isArray(pools)) {
    const keys = pools.reduce((acc, pool) => {
      const poolNetwork = getNetworkName(pool.chainId.toString());
      if (pool.version === 'v2' && pool.bTokenId) {
        return acc.concat([`${poolNetwork}.${pool.pool}.apy${pool.bTokenId}`]);
      } else {
        return acc.concat([`${poolNetwork}.${pool.pool}.apy`]);
      }
    }, []);
    try {
      console.log('keys', keys)
      const res = await db.getValues(keys);
      if (res) {
        return res.map((i) => deriToNatural(i));
      }
    } catch (err) {
      console.log(err.toString());
    }
    return [];
  }
};

/**
 * Get pool apy
 * @async
 * @method
 * @param {string} chainId
 * @param {string} poolAddress
 * @returns {Object} response
 * @returns {string} response.apy
 * @returns {string} response.volume1h
 * @returns {string} response.volume24h
 */
export const getPoolInfoApy = async (chainId, poolAddress) => {
  const db = databaseFactory(true);
  try {
    const poolNetwork = getNetworkName(chainId);
    const res = await db
      .getValues([
        `${poolNetwork}.${poolAddress}.apy`,
        `${poolNetwork}.${poolAddress}.volume.1h`,
        `${poolNetwork}.${poolAddress}.volume.24h`,
      ])
      .catch((err) => console.log('getPoolInfoApy', err));
    if (res) {
      const [apy, volume1h, volume24h] = res;
      return {
        apy: deriToNatural(apy).toString(),
        volume1h: deriToNatural(volume1h).toString(),
        volume24h: deriToNatural(volume24h).toString(),
      };
    }
  } catch (err) {
    console.log(err);
  }
};

/**
 * Get apy of the Slp pool
 * @async
 * @method
 * @param {string} chainId
 * @param {string} poolAddress
 * @returns {Object} response
 * @returns {string} response.apy
 * @returns {string} response.volume1h
 * @returns {string} response.volume24h
 */
export const getLpPoolInfoApy = async (chainId, poolAddress) => {
  const db = databaseFactory(true);
  try {
    const poolNetwork = getNetworkName(chainId);
    const res = await db
      .getValues([
        `${poolNetwork}.${poolAddress}.apy`,
        `${poolNetwork}.${poolAddress}.apy2`,
        `${poolNetwork}.${poolAddress}.volume.1h`,
        `${poolNetwork}.${poolAddress}.volume.24h`,
      ])
      .catch((err) => console.log('getPoolInfoApy', err));
    if (res) {
      const [apy, apy2, volume1h, volume24h] = res;
      return {
        apy: deriToNatural(apy).toString(),
        apy2: deriToNatural(apy2).toString(),
        volume1h: deriToNatural(volume1h).toString(),
        volume24h: deriToNatural(volume24h).toString(),
      };
    }
  } catch (err) {
    console.log(err);
  }
};

/**
 * Get apy of the Clp pool
 * @async
 * @method
 * @param {string} chainId
 * @param {string} poolAddress
 * @returns {Object} response
 * @returns {string} response.apy
 * @returns {string} response.volume1h
 * @returns {string} response.volume24h
 */
// export const getClpPoolInfoApy = async (chainId, poolAddress) => {
//   const db = databaseFactory(true);
//   try {
//     const poolNetwork = getNetworkName(chainId);
//     const res = await db
//       .getValues([
//         `${poolNetwork}.${poolAddress}.apy`,
//         `${poolNetwork}.${poolAddress}.apy2`,
//         `${poolNetwork}.${poolAddress}.volume.1h`,
//         `${poolNetwork}.${poolAddress}.volume.24h`,
//       ])
//       .catch((err) => console.log('getPoolInfoApy', err));
//     if (res) {
//       const [apy, apy2, volume1h, volume24h] = res;
//       return {
//         apy: deriToNatural(apy).toString(),
//         apy2: deriToNatural(apy2).toString(),
//         volume1h: deriToNatural(volume1h).toString(),
//         volume24h: deriToNatural(volume24h).toString(),
//       };
//     }
//   } catch (err) {
//     console.log(err);
//   }
// };

/**
 * Get user info of the pool
 * @async
 * @method
 * @param {string} chainId
 * @param {string} poolAddress
 * @param {string} userAddress
 * @returns {Object} response
 * @returns {string} response.volume1h
 * @returns {string} response.volume24h
 */
export const getUserInfoInPool = async (chainId, poolAddress, userAddress) => {
  const db = databaseFactory(true);
  //const {poolAddress} = getPoolContractAddress(chainId, poolAddress);
  userAddress = toChecksumAddress(userAddress);
  try {
    const poolNetwork = getNetworkName(chainId);
    const res = await db
      .getValues([
        `${poolNetwork}.${poolAddress}.${userAddress}.volume.1h`,
        `${poolNetwork}.${poolAddress}.${userAddress}.volume.24h`,
      ])
      .catch((err) => console.log('getUserInfoInPool', err));
    if (res) {
      const [volume1h, volume24h] = res;
      return {
        volume1h: deriToNatural(volume1h).toString(),
        volume24h: deriToNatural(volume24h).toString(),
      };
    }
  } catch (err) {
    console.log(err);
  }
};

export const getUserInfoAllForAirDrop = async (userAddress) => {
  const db = databaseAirdropFactory(true);
  userAddress = toChecksumAddress(userAddress);
  const res = await db
    .getValues([
      `${userAddress}.claim.chainId`,
      `${userAddress}.claim.amount`,
      `${userAddress}.claim.deadline`,
      `${userAddress}.claim.nonce`,
      `${userAddress}.claim.v1`,
      `${userAddress}.claim.r1`,
      `${userAddress}.claim.s1`,
      `${userAddress}.claim.v2`,
      `${userAddress}.claim.r2`,
      `${userAddress}.claim.s2`,
      `${userAddress}.claim.valid`,
      // `${userAddress}.claim.harvest.lp`,
      // `${userAddress}.claim.harvest.trade`,
      // `${userAddress}.claim.total`,
    ])
    .catch((err) => console.log('getUserInfoAllForAirDrop', err));
  if (res) {
    const [
      chainId,
      amount,
      deadline,
      nonce,
      v1,
      r1,
      s1,
      v2,
      r2,
      s2,
      valid,
      // harvestLp,
      // harvestTrade,
      // total,
    ] = res;
    return {
      chainId: deriToString(chainId),
      amount: deriToNatural(amount).toString(),
      deadline: deriToString(deadline),
      nonce: deriToString(nonce),
      v1: deriToString(v1),
      r1,
      s1,
      v2: deriToString(v2),
      r2,
      s2,
      valid: deriToBool(valid),
      // lp: deriToNatural(harvestLp),
      // trade: deriToNatural(harvestTrade),
      // total: deriToString(total),
    };
  }
};
