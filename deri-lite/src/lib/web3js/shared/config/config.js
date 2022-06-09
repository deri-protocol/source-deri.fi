// import { DeriEnv } from './env';
// import jsonConfig from '../resources/config.json';
import jsonProdConfig from '../resources/config.prod.json';
import jsonTestnetConfig from '../resources/config.testnet.json';
import jsonDevConfig from '../resources/config.dev.json';
// import { VERSIONS } from './version';
import { checkEnv } from './check';

// export const getJsonConfig = (version, env) => {
//   env = env || DeriEnv.get();
//   // for browser and nodejs
//   let configs =
//     typeof jsonConfig === 'object' ? jsonConfig : JSON.parse(jsonConfig);
//   if (configs[version] && VERSIONS.includes(version)) {
//     configs = configs[version];
//     if (['prod', 'dev', 'testnet'].includes(env)) {
//       if (configs && configs[env]) {
//         return configs[env];
//       }
//     }
//   } else {
//     throw new Error(
//       `getJsonConfig(): invalid config of version '${version}' and env '${env}'`
//     );
//   }
// };

export const getJsonConfig = (env) => {
  env = checkEnv(env);
  let rawConfig =
    env !== 'prod'
      ? env === 'testnet'
        ? jsonTestnetConfig
        : jsonDevConfig
      : jsonProdConfig;
  // to support both nodejs and browser
  let config =
    typeof rawConfig === 'object' ? rawConfig : JSON.parse(rawConfig);
  if (config.pools) {
    return config.pools;
  }
  throw new Error('CONFIG_LIST_NOT_FOUND', { name: 'getJsonConfig', env });
};
