import { validateObjectKeyExist, validateIsArray } from '../utils';
import {
  isUsedRestOracle,
  mapToBToken,
  mapToSymbol,
  getVolatilitySymbols,
} from './token';

const validatePoolV2 = (pool) => {
  validateObjectKeyExist(
    [
      'pool',
      'pToken',
      'lToken',
      'router',
      'initialBlock',
      'bTokens',
      'symbols',
      'chainId',
      'symbolCount',
      'bTokenCount',
    ],
    pool,
    ''
  );
  validateIsArray(pool['bTokens'], 'bTokens');
  pool['bTokens'].forEach((prop) => {
    validateObjectKeyExist(
      ['bTokenId', 'bTokenSymbol', 'bToken'],
      prop,
      'bToken'
    );
  });
  validateIsArray(pool['symbols'], 'symbols');
  pool['symbols'].forEach((prop) => {
    validateObjectKeyExist(['symbolId', 'symbol'], prop, 'symbol');
  });
};

const processPoolV2 = (pool) => {
  // process pool 
  pool['bTokenCount'] = pool['bTokens'].length;
  pool['symbolCount'] = pool['symbols'].length;
  pool['bTokens'].forEach((b) => b['bTokenSymbol'] = mapToBToken(b['bTokenSymbol']))
  pool['symbols'].forEach((s) => s['symbol'] = mapToSymbol(s['symbol']))
};

const validatePoolV2Lite = (pool) => {
  validateObjectKeyExist(
    [
      'pool',
      'pToken',
      'lToken',
      'initialBlock',
      'bToken',
      'bTokenSymbol',
      'symbols',
      'chainId',
      'offchainSymbolIds',
      'offchainSymbols',
      'symbolCount',
    ],
    pool,
    ''
  );
  validateIsArray(pool['symbols'], 'symbols');
  pool['symbols'].forEach((prop) => {
    validateObjectKeyExist(['symbolId', 'symbol'], prop, 'symbol');
  });
  validateIsArray(pool['offchainSymbolIds'], 'offchainSymbolIds');
  validateIsArray(pool['offchainSymbols'], 'offchainSymbols');
};

const processPoolV2Lite = (pool) => {
  // process pool
  if (!pool['symbolCount']) {
    pool['symbolCount'] = pool['symbols'].length;
  }
  if (!pool['offchainSymbolIds'] && !pool['offchainSymbols']) {
    pool['offchainSymbolIds'] = pool['symbols'].filter((s)=> isUsedRestOracle(s.symbol)).map((s) => s.symbolId)
    pool['offchainSymbols'] = pool['symbols'].filter((s)=> isUsedRestOracle(s.symbol)).map((s) => s.symbol)
    pool['symbols'].forEach((s) => s['symbol'] = mapToSymbol(s['symbol']))
  }
};

const validateConfigV2LiteOpen = (config) => {
  validateObjectKeyExist(
    [
      'pool',
      'pToken',
      'lToken',
      'initialBlock',
      'bToken',
      'bTokenSymbol',
      'symbols',
      'chainId',
      'offchainSymbolIds',
      'offchainSymbols',
      'symbolCount',
    ],
    config,
    ''
  );
  validateIsArray(config['symbols'], 'symbols');
  config['symbols'].forEach((prop) => {
    validateObjectKeyExist(['symbolId', 'symbol'], prop, 'symbol');
  });
  validateIsArray(config['offchainSymbolIds'], 'offchainSymbolIds');
};

const processConfigV2LiteOpen = (config) => {
  // process config
  if (!config['symbolCount']) {
    config['symbolCount'] = config['symbols'].length;
  }
  if (!config['offchainSymbolIds'] && !config['offchainSymbols']) {
    config['offchainSymbolIds'] = config['symbols'].filter((s)=> isUsedRestOracle(s.symbol)).map((s) => s.symbolId)
    config['offchainSymbols'] = config['symbols'].filter((s)=> isUsedRestOracle(s.symbol)).map((s) => s.symbol)
    config['symbols'].forEach((s) => s['symbol'] = mapToSymbol(s['symbol']))
  }
};

const validatePoolOption = (pool) => {
  validateObjectKeyExist(
    [
      'pool',
      'pToken',
      'lToken',
      'initialBlock',
      'bToken',
      // 'pricer',
      'bTokenSymbol',
      'symbols',
      'chainId',
      // 'offchainSymbolIds',
      // 'offchainSymbols',
      'symbolCount',
      'volatilitySymbols',
    ],
    pool,
    ''
  );
  validateIsArray(pool['symbols'], 'symbols');
  pool['symbols'].forEach((prop) => {
    validateObjectKeyExist(['symbolId', 'symbol'], prop, 'symbol');
  });
  // validateIsArray(pool['offchainSymbolIds'], 'offchainSymbolIds');
  // validateIsArray(pool['offchainSymbols'], 'offchainSymbols');
  validateIsArray(pool['volatilitySymbols'], 'volatilitySymbols');
};

const processPoolOption = (pool) => {
  // process pool 
  pool['symbolCount'] = pool['symbols'].length;
  if (!pool['volatilitySymbols']) {
    // pool['offchainSymbolIds'] = pool['symbols'].filter((s)=> isUsedRestOracle(s.symbol)).map((s) => s.symbolId)
    // pool['offchainSymbols'] = pool['symbols'].filter((s)=> isUsedRestOracle(s.symbol)).map((s) => s.symbol)
    pool['volatilitySymbols'] = getVolatilitySymbols(
      pool['symbols'].map((s) => s.symbol)
    ); 
    pool['symbols'].forEach((s) => s['symbol'] = mapToSymbol(s['symbol']))
  }
};

export const poolProcessor = {
  v2: processPoolV2,
  v2_lite: processPoolV2Lite,
  v2_lite_open: processConfigV2LiteOpen,
  option: processPoolOption,
};

export const poolValidator = {
  v2: validatePoolV2,
  v2_lite: validatePoolV2Lite,
  v2_lite_open: validateConfigV2LiteOpen,
  option: validatePoolOption,
};