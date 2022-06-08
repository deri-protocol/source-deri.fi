import { catchApiError } from "../../shared/utils/api"
import { DeriEnv } from "../../shared/config/env"
import { getJsonConfig } from "../../shared/config/config"
import { normalizeChainId, toChecksumAddress, validateObjectKeyExist } from "../../shared/utils"
import { poolProcessor, poolValidator } from "../../shared/config/config_processor"
import { fetchJson, getBlockInfo, getHttpBase, getPastEvents, getPoolViewerConfig } from "../../shared"
import { expandPoolConfigV2LiteOpen, getOracleFactoryChainlinkConfig, getPoolV2LiteManagerConfig, openPoolChainIds } from "../config"
import { oracleFactoryChainlinkFactory, perpetualPoolLiteFactory, perpetualPoolLiteManagerFactory, perpetualPoolLiteViewerFactory } from "../factory"

export const getPoolOpenConfigList = async (...args) => {
  return catchApiError(
    async () => {
      let configs = [];
      const chainIds = openPoolChainIds()
      configs = await chainIds.reduce(async (acc, chainId) => {
        //console.log('chainId', chainId)
        const { address: poolManagerAddress } = getPoolV2LiteManagerConfig(
          chainId
        );
        const poolManager = perpetualPoolLiteManagerFactory(
          chainId,
          poolManagerAddress
        );
        // get pool numbers
        const poolNums = parseInt(await poolManager.getNumPools());
        const numsArray = [...Array(poolNums).keys()];
        // get pool addresses
        const addresses = await Promise.all(
          numsArray.reduce(
            (acc, id) => acc.concat([poolManager.pools(id.toString())]),
            []
          )
        );
        // get pools config
        const res = await Promise.all(
          addresses.reduce(
            (acc, address) =>
              acc.concat([
                perpetualPoolLiteFactory(chainId, address).getConfig(),
              ]),
            []
          )
        );
        return acc.concat(res);
      }, []);
      return configs.sort((a,b) => parseInt(b.initialBlock) - parseInt(a.initialBlock));
    },
    args,
    'getPoolOpenConfigList',
    []
  );
};

export const getPoolOpenOracleList = async(...args) => {
  return catchApiError(
    async (chainId, accountAddress) => {
    chainId = normalizeChainId(chainId)
    const oracleFactoryConfig = getOracleFactoryChainlinkConfig(chainId);
    const oracleFactory = oracleFactoryChainlinkFactory(
      chainId,
      oracleFactoryConfig.address
    );
    await oracleFactory._init()
    let eventBlock, oracles= [];
    const res = await fetchJson(
      `${getHttpBase()}/oracle/${chainId}/${accountAddress}`
    );
    if (res && res.success) {
      eventBlock = parseInt(res.data.eventBlock);
      if (res.data.oracles && Array.isArray(res.data.oracles)) {
        oracles = res.data.oracles;
      }
      if (eventBlock === 0) {
        eventBlock = parseInt(oracleFactoryConfig.initialBlock);
      }
      const toBlock = await getBlockInfo(chainId, 'latest');
      // fetch online
      let events = await getPastEvents(
        chainId,
        oracleFactory.contract,
        'CreateOracle',
        {},
        eventBlock,
        toBlock.number
      );
      if (events.length > 0) {
        for (let i = 0; i < events.length; i++) {
          const event = events[i];
          const info = event.returnValues;
          oracles.push({
            chainId,
            symbol: info.symbol,
            address: info.oracle,
            blockNumber: event.blockNumber,
          });
        }
        return oracles
          .sort((a, b) => parseInt(b.blockNumber) - parseInt(a.blockNumber))
          .reduce((acc, i) => {
            return acc.find((a) => a.symbol === i.symbol) ? acc : [...acc, i];
          }, []);
      } else {
        return oracles
      }
    } else {
      return [];
    }
      //return getOracleConfigList('v2_lite_open', DeriEnv.get()).filter((o) => o.chainId === chainId);
    },
    args,
    'getPoolOpenOracleInfos',
    []
  );
};

export const getPoolController = async(chainId, poolAddress) => {
  chainId = normalizeChainId(chainId);
  return catchApiError(
    async (chainId, poolAddress) => {
      const perpetualPoolLite = perpetualPoolLiteFactory(chainId, poolAddress);
      return await perpetualPoolLite.controller();
    },
    [chainId, poolAddress],
    'getPoolController',
    ''
  );
}
export const isPoolController = async (chainId, poolAddress, controller) => {
  chainId = normalizeChainId(chainId);
  return catchApiError(
    async (chainId, poolAddress, controller) => {
      const perpetualPoolLite = perpetualPoolLiteFactory(chainId, poolAddress);
      const poolController = await perpetualPoolLite.controller();
      return (
        toChecksumAddress(controller) === toChecksumAddress(poolController)
      );
    },
    [chainId, poolAddress, controller],
    'isPoolController',
    false
  );
};

export const getExpandedPoolOpenConfigList = async () => {
  const env = DeriEnv.get()
  const version = 'v2_lite_open'
  let config = getJsonConfig(version, env);

  config.pools =  await getPoolOpenConfigList()
  const pools = config.pools
  if (pools && Array.isArray(pools)) {
    for (let i = 0; i < pools.length; i++) {
      poolProcessor[version](pools[i])
      poolValidator[version](pools[i])
    }
  }
  validateObjectKeyExist(['oracle'], config, 'oracle');
  return expandPoolConfigV2LiteOpen(config);
}

export const getPoolAllSymbolNames = async (chainId, poolAddress) => {
  return catchApiError(
    async (chainId, poolAddress) => {
      const viewerAddress = getPoolViewerConfig(chainId, 'v2_lite');
      const poolViewer = perpetualPoolLiteViewerFactory(chainId, viewerAddress);
      return await poolViewer.getOffChainOracleSymbols(poolAddress);
    },
    [chainId.toString(), poolAddress],
    'getPoolAllSymbolNames ',
    []
  );
};

export const getPoolAcitveSymbolIds = async (...args) => {
  return catchApiError(
    async (chainId, poolAddress) => {
      chainId = chainId.toString()
      const perpetualPoolLite = perpetualPoolLiteFactory(chainId, poolAddress);
      await perpetualPoolLite.init()
      return await perpetualPoolLite.pToken.getActiveSymbolIds()
    },
    args,
    'getPoolActiveSymbolIds',
    []
  );
};


// v2lite open config list cache
export const openConfigListCache = (() => {
  let cache = {
    data: [],
    timestamp: 0,
  };
  return {
    async update() {
      const oldData = cache.data
      try {
        if (Date.now()/1000 - cache.timestamp >= 10) {
        //if (Date.now()/1000 - cache.timestamp > 60) {
          cache.data = await getPoolOpenConfigList()
          cache.timestamp = Date.now()/1000
          //res = 'v2 lite open config list is updated'
        }
      } catch(err) {
        console.log(err)
        cache.data = oldData
        //res = `v2 lite open config list updating with error: ${err}`
      }
      // res && console.log(res)
      return cache.data
    },
    updatedAt() {
      return cache.timestamp
    },
    get() {
      return cache.data
    }
  }
})()
