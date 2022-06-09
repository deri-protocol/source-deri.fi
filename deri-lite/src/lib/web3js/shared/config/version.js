// version definination
export const FUTURE ='v2'
export const FUTURE_INNO ='v2_lite'
export const FUTURE_OPEN ='v2_lite_open'
export const OPTION = 'option'

// pool type
export const PoolType = {
  FUTURE: 'future',
  OPTION: 'option',
  LP: 'lp', // for external pool, such as clp of pancake
};
Object.freeze(PoolType);

// todo: lite version, will remove later
export const LITE_VERSIONS = ['v2_lite', 'v2_lite_open'];
export const LITE_VERSION_IDS = ['v2_lite_dpmm', 'v2_lite_open'];
export const LITE_AND_OPTION_VERSIONS = [...LITE_VERSIONS, 'option'];

// version
export const VERSIONS_RETIRED = ['v1'];
export const VERSIONS = [FUTURE, FUTURE_INNO, FUTURE_OPEN, OPTION];
export const VERSIONS_ALL = [...VERSIONS_RETIRED, ...VERSIONS];
export const VERSION_IDS = ['v2_dpmm', 'v2_lite', 'v2_lite_dpmm', 'option', 'v3'];
export const VERSION_IDS_ALL = [...VERSIONS_RETIRED, ...VERSION_IDS];

// for oracle use
export const PRESERVED_SYMBOLS = ['BTCUSD', 'ETHUSD', 'BNBUSD'];

const VERSIONS_TYPE_HASH = {
  v1: 'future',
  v2: 'future',
  v2_lite: 'future',
  v2_lite_open: 'future',
  option: 'option',
  v3: ''
};

export const getConfigType = (version) => {
  if (Object.keys(VERSIONS_TYPE_HASH).includes(version)) {
    return VERSIONS_TYPE_HASH[version];
  }
  throw new Error(`invalid pool version'${version}'`);
};

export const getConfigZone = (version) => {
  if (['v2'].includes(version)) {
    return 'main';
  } else if (['v2_lite'].includes(version)) {
    return 'inno';
  } else if (['v2_lite_open'].includes(version)) {
    return 'open';
  } else {
    return '';
  }
};
