export const getRestServerConfig = (env = 'dev') => {
  if (env === 'prod') {
    // for production
    return (
      (process && process.env && process.env.REACT_APP_REST_SERVER_URL) ||
      'https://api.deri.io'
    );
    // return 'https://alphaapi.deri.io';
  } else {
    // for test
    return (
      (process && process.env && process.env.REACT_APP_REST_SERVER_URL) ||
      'https://testnetapi.deri.io'
    );
  }
};
