// versions
//export const VERSIONS = ['v2', 'v2_lite', 'v2_lite_open']
export const LITE_VERSIONS = ['v2_lite', 'v2_lite_open'];
export const LITE_AND_OPTION_VERSIONS = [...LITE_VERSIONS, 'option'];
export const VERSIONS = ['v2', ...LITE_AND_OPTION_VERSIONS];
export const ALL_EXCEPT_OPEN_VERSIONS = [
  'v2',
  'v2_lite',
  'option',
];
export const PRESERVED_SYMBOLS = ['BTCUSD', 'ETHUSD', 'BNBUSD'];
