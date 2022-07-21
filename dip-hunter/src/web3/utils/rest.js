export const getHttpBase = (env) => env === "prod"
  ? "https://api.deri.io"
  : "https://devapi.deri.io";

const defaultUserAgent =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.54 Safari/537.36"

export const fetchJson = async (url) => {
  let retry = 2
  while (retry > 0) {
    try {
      const resp = await fetch(url);
      return await resp.json();
    } catch (err) {
      console.log(`${err}`)
    }
    retry -= 1
  }
  throw new Error('REST_CALL_TIMEOUT', url);
};
