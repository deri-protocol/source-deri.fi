// export const DERI_ENV="dev"
export const DeriEnv = (() => {
  let _deriEnv = 'dev';
  return {
    get: () => _deriEnv,
    set: (value) => {
      if (value === 'dev' || value === 'prod' || value === 'testnet') {
        _deriEnv = value;
      } else {
        throw new Error("please use 'dev', 'testnet' or 'prod' for DeriEnv");
      }
    },
  };
})();
