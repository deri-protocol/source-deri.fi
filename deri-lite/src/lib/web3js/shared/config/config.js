// import { DeriEnv } from './env';
// import jsonConfig from '../resources/config.json';
import jsonProdConfig from '../resources/config.prod.json';
import jsonDevConfig from '../resources/config.dev.json';
import { checkEnv } from './check';

export const getJsonConfig = (env) => {
  env = checkEnv(env);
  let rawConfig = env === "prod" ? jsonProdConfig : jsonDevConfig;
  // to support both nodejs and browser
  let config =
    typeof rawConfig === "object" ? rawConfig : JSON.parse(rawConfig);
  throw new Error("CONFIG_LIST_NOT_FOUND", { name: "getJsonConfig", env });
};;
