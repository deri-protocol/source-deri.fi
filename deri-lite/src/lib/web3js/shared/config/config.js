import { DeriEnv } from './env';
import jsonConfig from '../resources/config.json';
import { VERSIONS } from './version';

export const getJsonConfig = (version, env) => {
  env = env || DeriEnv.get();
  // for browser and nodejs
  let configs =
    typeof jsonConfig === 'object' ? jsonConfig : JSON.parse(jsonConfig);
  if (configs[version] && VERSIONS.includes(version)) {
    configs = configs[version];
    if (['prod', 'dev', 'testnet'].includes(env)) {
      if (configs && configs[env]) {
        return configs[env];
      }
    }
  } else {
    throw new Error(
      `getJsonConfig(): invalid config of version '${version}' and env '${env}'`
    );
  }
};
