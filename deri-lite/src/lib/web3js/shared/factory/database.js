import {
  getDBAddress,
  getDBWormholeAddress,
  getDBAirdropAddress,
  DeriEnv,
} from '../config';
import {
  DatabaseAirdropContract,
  DatabaseContract,
  DatabaseWormholeContract,
} from '../contract';

export const databaseFactory = (() => {
  const databaseInstanceMap = {};
  return (useProductionDB = false) => {
    const address = getDBAddress(DeriEnv.get(), useProductionDB);
    const key = address;
    if (Object.keys(databaseInstanceMap).includes(key)) {
      return databaseInstanceMap[key];
    }
    const database = new DatabaseContract(address);
    databaseInstanceMap[key] = database;
    return database;
  };
})();

export const databaseActivityFactory = (() => {
  const databaseInstanceMap = {};
  return () => {
    const address = DeriEnv.get() === 'prod' ? '0x75E04C816F206939a92AE7B23015ce3ef21aE571' : '0x7C1267188379f57d92e640E519151229E1eA5565'
    const key = address;
    if (Object.keys(databaseInstanceMap).includes(key)) {
      return databaseInstanceMap[key];
    }
    const database = new DatabaseContract(address);
    databaseInstanceMap[key] = database;
    return database;
  };
})();

export const databaseActivityClaimFactory = (() => {
  const databaseInstanceMap = {};
  return () => {
    const address = DeriEnv.get() === 'prod' ? '0xe40a75957034A003Da4b341FBb02a457Af2aa302' : '0x7C1267188379f57d92e640E519151229E1eA5565'
    const key = address;
    if (Object.keys(databaseInstanceMap).includes(key)) {
      return databaseInstanceMap[key];
    }
    const database = new DatabaseContract(address);
    databaseInstanceMap[key] = database;
    return database;
  };
})();

export const databaseDeriVoteFactory = (() => {
  const databaseInstanceMap = {};
  return () => {
    const address =
      DeriEnv.get() === 'prod'
        ? '0x9Ced1529C238bD36B3A05cECF979a30c0C40b286'
        : '0x7C1267188379f57d92e640E519151229E1eA5565';
    const key = address;
    if (Object.keys(databaseInstanceMap).includes(key)) {
      return databaseInstanceMap[key];
    }
    const database = new DatabaseContract(address);
    databaseInstanceMap[key] = database;
    return database;
  };
})();

export const databaseWormholeFactory = (() => {
  const databaseInstanceMap = {};
  return (useProductionDB = false) => {
    const address = getDBWormholeAddress(DeriEnv.get(), useProductionDB);
    const key = address;
    if (Object.keys(databaseInstanceMap).includes(key)) {
      return databaseInstanceMap[key];
    }
    const database = new DatabaseWormholeContract(address);
    databaseInstanceMap[key] = database;
    return database;
  };
})();

export const databaseAirdropFactory = (() => {
  const databaseInstanceMap = {};
  return (useProductionDB = false) => {
    const address = getDBAirdropAddress(DeriEnv.get(), useProductionDB);
    const key = address;
    //console.log('---airdrop key', key)
    if (Object.keys(databaseInstanceMap).includes(key)) {
      return databaseInstanceMap[key];
    }
    const database = new DatabaseAirdropContract(address);
    databaseInstanceMap[key] = database;
    return database;
  };
})();
