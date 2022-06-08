import {
  catchApiError,
  bg,
  deriToNatural,
  deriToString,
  databaseActivityFactory,
  toChecksumAddress,
  DeriEnv,
  max,
  catchTxApiError,
  miningVaultRouterFactory,
} from '../../shared';
import { databaseActivityClaimFactory } from '../../shared/factory/database';
import { getStakingCurrencyVaultConfig, getStakingMiningVaultRouterConfig } from '../config';
import { currencyVaultFactory } from '../contract/factory';

const range = (n) => new Array(n).fill(0).map((i, index) => index);

const keyPrefix = (epoch) => {
  if (!epoch || epoch.toString() === '1') {
    return DeriEnv.get() === 'prod' ? 'TE' : 'TE10';
  } else if (epoch.toString() === '2') {
    return DeriEnv.get() === 'prod' ? 'TE2' : 'TE14';
  } else if (epoch.toString() === '3') {
    return DeriEnv.get() === 'prod' ? 'TE3_1' : 'TE15';
  } else if (epoch.toString() === '4') {
    return DeriEnv.get() === 'prod' ? 'TE4' : 'TE14';
  }
};
const claimKeyPrefix = (epoch) => {
  if (!epoch || epoch.toString() === '1') {
    return DeriEnv.get() === 'prod' ? 'TE1' : 'TE11';
  } else if (epoch.toString() === '2') {
    return DeriEnv.get() === 'prod' ? 'TE2' : 'TE14';
  } else if (epoch.toString() === '3') {
    return DeriEnv.get() === 'prod' ? 'TE3' : 'TE17';
  } else if (epoch.toString() === '4') {
    return DeriEnv.get() === 'prod' ? 'TE4' : 'TE16';
  }
};

export const getStakingTop10Users = async (epoch) => {
  return catchApiError(
    async () => {
      //console.log('key', keyPrefix(epoch))
      const db = databaseActivityFactory();
      const key = range(10).reduce(
        (acc, i) =>
          acc.concat([
            `${keyPrefix(epoch)}.top.${i + 1}.account`,
            `${keyPrefix(epoch)}.top.${i + 1}.fee`,
            `${keyPrefix(epoch)}.top.${i + 1}.score`,
            `${keyPrefix(epoch)}.top.${i + 1}.cont`,
            `${keyPrefix(epoch)}.toppnl.${i + 1}.account`,
            `${keyPrefix(epoch)}.toppnl.${i + 1}.pnl`,
          ]),
        []
      );
      //console.log(key)
      const res = await db.getValues(key);
      //console.log(res)
      if (Array.isArray(res) && res.length === 6 * 10) {
        let result = [],
          resultPnl = [];
        for (let i = 0; i < res.length; i++) {
          if ((i + 1) % 6 === 0) {
            const info = res.slice(i - 5, i + 1);
            const index = (i + 1) / 6;
            result.push({
              no: index,
              userAddr: info[0].slice(0, 42),
              feePaid: deriToNatural(info[1]).toString(),
              score: deriToNatural(info[2]).toString(),
              evgCoeff: deriToNatural(info[1]).eq(0)
                ? '0'
                : bg(info[3]).div(info[1]).toString(),
              specialRewardsA:
                index <= 5
                  ? index <= 4
                    ? index <= 3
                      ? index <= 2
                        ? index <= 1
                          ? '80000'
                          : '60000'
                        : '40000'
                      : '20000'
                    : '10000'
                  : '8000',
            });
            resultPnl.push({
              no: index,
              userAddr: info[4].slice(0, 42),
              pnl: deriToNatural(info[5]).toString(),
              specialRewardsB:
                index <= 5
                  ? index <= 4
                    ? index <= 3
                      ? index <= 2
                        ? index <= 1
                          ? '80000'
                          : '60000'
                        : '40000'
                      : '20000'
                    : '10000'
                  : '8000',
            });
          }
        }
        return {
          top10: result.filter(
            (r) => r.userAddr !== '0x0000000000000000000000000000000000000000'
          ),
          top10Pnl: resultPnl.filter(
            (r) => r.userAddr !== '0x0000000000000000000000000000000000000000'
          ),
        };
      } else {
        return { top10: [], top10Pnl: [] };
      }
    },
    [],
    'getStakingTop10Users',
    { top10: [], top10Pnl: [] }
  );
};

export const getUserStakingInfo = async (accountAddress, epoch) => {
  const args = [accountAddress];
  return catchApiError(
    async (accountAddress) => {
      accountAddress = toChecksumAddress(accountAddress);
      const db = databaseActivityFactory();
      const key = [
        `${keyPrefix(epoch)}.Q1.cont`,
        `${keyPrefix(epoch)}.Q2.cont`,
        `${keyPrefix(epoch)}.Q3.cont`,
        `${keyPrefix(epoch)}.Q4.cont`,
        `${keyPrefix(epoch)}.${accountAddress}.Q1.cont`,
        `${keyPrefix(epoch)}.${accountAddress}.Q2.cont`,
        `${keyPrefix(epoch)}.${accountAddress}.Q3.cont`,
        `${keyPrefix(epoch)}.${accountAddress}.Q4.cont`,
        `${keyPrefix(epoch)}.${accountAddress}.fee`,
        `${keyPrefix(epoch)}.${accountAddress}.coef`,
      ];
      const res = await db.getValues(key);
      const scoreQ1 = bg(res[0]).eq(0)
        ? '0'
        : bg(10000).times(bg(res[4]).div(res[0]));
      const scoreQ2 = bg(res[1]).eq(0)
        ? '0'
        : bg(20000).times(bg(res[5]).div(res[1]));
      const scoreQ3 = bg(res[2]).eq(0)
        ? '0'
        : bg(30000).times(bg(res[6]).div(res[2]));
      const scoreQ4 = bg(res[3]).eq(0)
        ? '0'
        : bg(50000).times(bg(res[7]).div(res[3]));

      const coef = deriToNatural(res[9]);
      return {
        userAddr: accountAddress,
        feePaid: deriToNatural(res[8]).toString(),
        coef: max(coef, bg(1)).toString(),
        score: bg(scoreQ1).plus(scoreQ2).plus(scoreQ3).plus(scoreQ4).toString(),
      };
    },
    args,
    'getUserStakingInfo',
    {
      userAddr: '',
      feePaid: '',
      coef: '',
      score: '',
    }
  );
};

export const getUserStakingReward = async (accountAddress, epoch) => {
  const args = [accountAddress];
  return catchApiError(
    async (accountAddress) => {
      accountAddress = toChecksumAddress(accountAddress);
      const db = databaseActivityFactory();
      const key = [
        `${keyPrefix(epoch)}.Q1.cont`,
        `${keyPrefix(epoch)}.Q2.cont`,
        `${keyPrefix(epoch)}.Q3.cont`,
        `${keyPrefix(epoch)}.Q4.cont`,
        `${keyPrefix(epoch)}.${accountAddress}.Q1.cont`,
        `${keyPrefix(epoch)}.${accountAddress}.Q2.cont`,
        `${keyPrefix(epoch)}.${accountAddress}.Q3.cont`,
        `${keyPrefix(epoch)}.${accountAddress}.Q4.cont`,
        `${keyPrefix(epoch)}.top.1.account`,
        `${keyPrefix(epoch)}.top.2.account`,
        `${keyPrefix(epoch)}.top.3.account`,
        `${keyPrefix(epoch)}.top.4.account`,
        `${keyPrefix(epoch)}.top.5.account`,
        `${keyPrefix(epoch)}.top.6.account`,
        `${keyPrefix(epoch)}.top.7.account`,
        `${keyPrefix(epoch)}.top.8.account`,
        `${keyPrefix(epoch)}.top.9.account`,
        `${keyPrefix(epoch)}.top.10.account`,
        `${keyPrefix(epoch)}.toppnl.1.account`,
        `${keyPrefix(epoch)}.toppnl.2.account`,
        `${keyPrefix(epoch)}.toppnl.3.account`,
        `${keyPrefix(epoch)}.toppnl.4.account`,
        `${keyPrefix(epoch)}.toppnl.5.account`,
        `${keyPrefix(epoch)}.toppnl.6.account`,
        `${keyPrefix(epoch)}.toppnl.7.account`,
        `${keyPrefix(epoch)}.toppnl.8.account`,
        `${keyPrefix(epoch)}.toppnl.9.account`,
        `${keyPrefix(epoch)}.toppnl.10.account`,
      ];
      const res = await db.getValues(key);
      const scoreQ1 = bg(res[0]).eq(0)
        ? '0'
        : bg(10000).times(bg(res[4]).div(res[0]));
      const scoreQ2 = bg(res[1]).eq(0)
        ? '0'
        : bg(20000).times(bg(res[5]).div(res[1]));
      const scoreQ3 = bg(res[2]).eq(0)
        ? '0'
        : bg(30000).times(bg(res[6]).div(res[2]));
      const scoreQ4 = bg(res[3]).eq(0)
        ? '0'
        : bg(50000).times(bg(res[7]).div(res[3]));
      const score = bg(scoreQ1).plus(scoreQ2).plus(scoreQ3).plus(scoreQ4);
      const rewardDERI = bg(1000000).times(bg(score).div(110000)).toString();

      const topUsers = res
        .slice(8, 18)
        .map((u) => toChecksumAddress(u.slice(0, 42)));
      const topPnlUsers = res
        .slice(18)
        .map((u) => toChecksumAddress(u.slice(0, 42)));
      let specialRewardsA = '0';
      if (topUsers.includes(accountAddress)) {
        if (accountAddress === topUsers[0]) {
          specialRewardsA = '80000';
        } else if (accountAddress === topUsers[1]) {
          specialRewardsA = '60000';
        } else if (accountAddress === topUsers[2]) {
          specialRewardsA = '40000';
        } else if (accountAddress === topUsers[3]) {
          specialRewardsA = '20000';
        } else if (accountAddress === topUsers[4]) {
          specialRewardsA = '10000';
        } else {
          specialRewardsA = '8000';
        }
      }
      let specialRewardsB = '0';
      if (topPnlUsers.includes(accountAddress)) {
        if (accountAddress === topPnlUsers[0]) {
          specialRewardsB = '80000';
        } else if (accountAddress === topPnlUsers[1]) {
          specialRewardsB = '60000';
        } else if (accountAddress === topPnlUsers[2]) {
          specialRewardsB = '40000';
        } else if (accountAddress === topPnlUsers[3]) {
          specialRewardsB = '20000';
        } else if (accountAddress === topPnlUsers[4]) {
          specialRewardsB = '10000';
        } else {
          specialRewardsB = '8000';
        }
      }
      return {
        userAddr: accountAddress,
        rewardDERI,
        specialRewardsA,
        specialRewardsB,
      };
    },
    args,
    'getUserStakingReward',
    { userAddr: '', rewardDERI: '', specialRewardsA: '', specialRewardsB: '' }
  );
};

export const getUserStakingContribution = async (accountAddress, epoch) => {
  const args = [accountAddress];
  return catchApiError(
    async (accountAddress) => {
      accountAddress = toChecksumAddress(accountAddress);
      const db = databaseActivityFactory();
      const key = [
        `${keyPrefix(epoch)}.Q1.cont`,
        `${keyPrefix(epoch)}.Q2.cont`,
        `${keyPrefix(epoch)}.Q3.cont`,
        `${keyPrefix(epoch)}.Q4.cont`,
        `${keyPrefix(epoch)}.${accountAddress}.Q1.cont`,
        `${keyPrefix(epoch)}.${accountAddress}.Q2.cont`,
        `${keyPrefix(epoch)}.${accountAddress}.Q3.cont`,
        `${keyPrefix(epoch)}.${accountAddress}.Q4.cont`,
      ];
      const res = await db.getValues(key);
      const scoreQ1 = bg(res[0]).eq(0)
        ? '0'
        : bg(10000).times(bg(res[4]).div(res[0]));
      const scoreQ2 = bg(res[1]).eq(0)
        ? '0'
        : bg(20000).times(bg(res[5]).div(res[1]));
      const scoreQ3 = bg(res[2]).eq(0)
        ? '0'
        : bg(30000).times(bg(res[6]).div(res[2]));
      const scoreQ4 = bg(res[3]).eq(0)
        ? '0'
        : bg(50000).times(bg(res[7]).div(res[3]));

      return {
        userAddr: accountAddress,
        totalContrib: deriToNatural(
          bg(res[0]).plus(res[1]).plus(res[2]).plus(res[3])
        ).toString(),
        userContrib: deriToNatural(
          bg(res[4]).plus(res[5]).plus(res[6]).plus(res[7])
        ).toString(),
        Q1Contrib: deriToNatural(res[0]).toString(),
        Q2Contrib: deriToNatural(res[1]).toString(),
        Q3Contrib: deriToNatural(res[2]).toString(),
        Q4Contrib: deriToNatural(res[3]).toString(),
        userQ1Contrib: deriToNatural(res[4]).toString(),
        userQ2Contrib: deriToNatural(res[5]).toString(),
        userQ3Contrib: deriToNatural(res[6]).toString(),
        userQ4Contrib: deriToNatural(res[7]).toString(),
        userQ1Point: scoreQ1.toString(),
        userQ2Point: scoreQ2.toString(),
        userQ3Point: scoreQ3.toString(),
        userQ4Point: scoreQ4.toString(),
      };
    },
    args,
    'getUserStakingContribution',
    { userAddr: '', totalContrib: '', userContrib: '' }
  );
};

export const getUserStakingClaimInfo = async (accountAddress, epoch) => {
  return catchApiError(
    async () => {
      accountAddress = toChecksumAddress(accountAddress);
      const db = databaseActivityClaimFactory();
      const key = [
        `${claimKeyPrefix(epoch)}.${accountAddress}.claimed.amount`,
        `${claimKeyPrefix(epoch)}.${accountAddress}.unclaimed.amount`,
        `${claimKeyPrefix(epoch)}.${accountAddress}.claimable.amount`,
        `${claimKeyPrefix(epoch)}.${accountAddress}.regular.amount`,
        `${claimKeyPrefix(epoch)}.${accountAddress}.toppoint.amount`,
        `${claimKeyPrefix(epoch)}.${accountAddress}.toppnl.amount`,
      ];
      // console.log('key',key)
      const res = await db.getValues(key);
      const claimable = deriToNatural(res[2]).toString()
      return {
        claimed: deriToNatural(res[0]).toString(),
        // unclaimed: deriToNatural(res[1]).toString(),
        locked: deriToNatural(res[1]).minus(claimable).toString(),
        claimable,
        // deriPrice: '0.56',
        // bnbPrice: '640.7',
        regular: deriToNatural(res[3]).toString(),
        toppoint: deriToNatural(res[4]).toString(),
        toppnl: deriToNatural(res[5]).toString(),
      };
    },
    [],
    'getUserStakingClaimInfo',
    {
      claimed: '',
      locked: '',
      claimable: '',
      regular: '',
      toppoint: '',
      toppnl: '',
    }
  );
};

export const getStakingAddressCount = async (epoch) => {
  return catchApiError(
    async () => {
      const db = databaseActivityFactory();
      const key = [
        `${keyPrefix(epoch)}.address.count`,
      ];
      // console.log('key',key)
      const res = await db.getValues(key);
      const addressCount = deriToString(res[0])
      return {
        epoch,
        addressCount,
      };
    },
    [],
    'getStakingAddressCount',
    {
      epoch,
      addressCount: '',
    }
  );
};
export const getUserStakingBnbClaimInfo = async (accountAddress, epoch) => {
  return catchApiError(
    async () => {
      accountAddress = toChecksumAddress(accountAddress);
      const db = databaseActivityClaimFactory();
      const key = [
        `${claimKeyPrefix(epoch)}.bnb.${accountAddress}.claimed.amount`,
        `${claimKeyPrefix(epoch)}.bnb.${accountAddress}.unclaimed.amount`,
        `${claimKeyPrefix(epoch)}.bnb.${accountAddress}.claimable.amount`,
        `${claimKeyPrefix(epoch)}.bnb.${accountAddress}.toppoint.amount`,
        `${claimKeyPrefix(epoch)}.bnb.${accountAddress}.toppnl.amount`,
      ];
      // console.log('key',key)
      const res = await db.getValues(key);
      const claimable = deriToNatural(res[2]).toString();
      return {
        claimed: deriToNatural(res[0]).toString(),
        // unclaimed: deriToNatural(res[1]).toString(),
        locked: deriToNatural(res[1]).minus(claimable).toString(),
        claimable,
        toppoint: deriToNatural(res[3]).toString(),
        toppnl: deriToNatural(res[4]).toString(),
      };
    },
    [],
    {
      claimed: '',
      locked: '',
      claimable: '',
      toppoint: '',
      toppnl: '',
    }
  );
};


export const claimMyStaking = async (accountAddress, epoch) => {
  return catchTxApiError(async () => {
    const chainId = '56';
    accountAddress = toChecksumAddress(accountAddress);
    const db = databaseActivityClaimFactory();
    const key = [
      `${claimKeyPrefix(epoch)}.${accountAddress}.claim.amount`,
      `${claimKeyPrefix(epoch)}.${accountAddress}.claim.deadline`,
      `${claimKeyPrefix(epoch)}.${accountAddress}.claim.nonce`,
      `${claimKeyPrefix(epoch)}.${accountAddress}.claim.v1`,
      `${claimKeyPrefix(epoch)}.${accountAddress}.claim.r1`,
      `${claimKeyPrefix(epoch)}.${accountAddress}.claim.s1`,
      `${claimKeyPrefix(epoch)}.${accountAddress}.claim.v2`,
      `${claimKeyPrefix(epoch)}.${accountAddress}.claim.r2`,
      `${claimKeyPrefix(epoch)}.${accountAddress}.claim.s2`,
    ];
    //console.log('key', key);
    const res = await db.getValues(key);
    const [amount, deadline, nonce, v1, r1, s1, v2, r2, s2] = res;
    //
    const claimArgs = [
      accountAddress,
      amount,
      deriToString(deadline),
      deriToString(nonce),
      deriToString(v1),
      r1,
      s1,
      deriToString(v2),
      r2,
      s2,
    ];

    const miningVaultAddress = getStakingMiningVaultRouterConfig(chainId, `TE${epoch}`)
      .address;
    //console.log('miningVaultAddress', miningVaultAddress);
    if (miningVaultAddress) {
      const miningVaultRouter = miningVaultRouterFactory(
        chainId,
        miningVaultAddress
      );
      //console.log(claimArgs)
      return await miningVaultRouter.mint(...claimArgs);
    }
  }, []);
};

export const claimMyStakingBNB = async (accountAddress, epoch) => {
  return catchTxApiError(async () => {
    const chainId = '56';
    accountAddress = toChecksumAddress(accountAddress);
    const db = databaseActivityClaimFactory();
    const key = [
      `${claimKeyPrefix(epoch)}.bnb.${accountAddress}.claim.amount`,
      `${claimKeyPrefix(epoch)}.bnb.${accountAddress}.claim.deadline`,
      `${claimKeyPrefix(epoch)}.bnb.${accountAddress}.claim.nonce`,
      `${claimKeyPrefix(epoch)}.bnb.${accountAddress}.claim.v`,
      `${claimKeyPrefix(epoch)}.bnb.${accountAddress}.claim.r`,
      `${claimKeyPrefix(epoch)}.bnb.${accountAddress}.claim.s`,
    ];
    //console.log('key', key);
    const res = await db.getValues(key);
    const [amount, deadline, nonce, v, r, s] = res;
    //
    const claimArgs = [
      accountAddress,
      accountAddress,
      amount,
      deriToString(deadline),
      deriToString(nonce),
      deriToString(v),
      r,
      s,
    ];

    const currencyVaultAddress = getStakingCurrencyVaultConfig(
      chainId,
      `TE${epoch}`
    ).address;
    //console.log('miningVaultAddress', miningVaultAddress);
    if (currencyVaultAddress) {
      const currencyVault = currencyVaultFactory(chainId, currencyVaultAddress);
      //console.log(claimArgs)
      return await currencyVault.claim(...claimArgs);
    }
  }, []);
};
