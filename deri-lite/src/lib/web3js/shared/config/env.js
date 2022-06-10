export const Env = {
  PROD: 'prod',
  TESTNET: 'testnet',
  DEV: 'dev',
};
Object.freeze(Env);

export const DeriEnv = (function(Env) {
  let _env = Env.DEV
  return {
    get() {
      return _env
    },
    set(env) {
      if (Object.values(Env).includes(env)) {
        _env = env
      } else {
        throw new Error('INVALID_DERI_ENV', env)
      }
    }
  }
})(Env)
