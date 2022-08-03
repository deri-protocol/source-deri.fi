// for debug use
export const debug = () => {
  if (typeof process === 'object' && process.env.DEBUG && process.env.DEBUG.toUpperCase() === "TRUE") {
    return true
  }
  return false
}

// Env
export const Env = {
  PROD: 'prod',
  TESTNET: 'testnet',
  DEV: 'dev',
};
Object.freeze(Env);

// DeriEnv
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
        throw new Error(`INVALID_DERI_ENV: ${env}`, )
      }
    }
  }
})(Env)

// checkEnv
export const checkEnv = (env) => {
  if (env == null) {
    return DeriEnv.get()
  } else if (Object.values(Env).includes(env)) {
    return env
  }
  throw new Error(`INVALID_DERI_ENV: ${env}`,)
}