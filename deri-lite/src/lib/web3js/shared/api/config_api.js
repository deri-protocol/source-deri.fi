import { checkEnv } from "../config";
import { catchApiError } from "../utils";

// config.json
import jsonProdConfig from '../resources/config.prod.json';
import jsonDevConfig from '../resources/config.dev.json';

export const getJsonConfig = (env) => {
  env = checkEnv(env);
  let rawConfig = env === "prod" ? jsonProdConfig : jsonDevConfig;
  // to support both nodejs and browser
  let config =
    typeof rawConfig === 'object' ? rawConfig : JSON.parse(rawConfig);
  if (config.pools) {
    return config.pools;
  }
  throw new Error('CONFIG_LIST_NOT_FOUND', { name: 'getJsonConfig', env });
};

export const getPoolConfigList = async (env, type=null) => {
  return catchApiError(async () => {
    env = checkEnv(env);
    let res = getJsonConfig(env);
    // add v1 config
    // res = res.concat(getPoolV1ConfigList(env));
    // const result = openConfigListCache.get();
    // if (result && Array.isArray(result) && result.length > 0) {
    //   res = [...res, ...result];
    // }
    if (!!type) {
      res = res.filter((c) => c.version === type)
    }
    return res;
  }, [env, type], []);
};
