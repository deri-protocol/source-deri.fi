import { getSymbolInfo, isUnlocked } from "../api/query_api"
import { DeriEnv, Env } from "../utils/env"
import { TIMEOUT } from "./shared"

const chainId = '97'
const poolAddress = "0x5b1a7AEB15EB5380EB35ceC8B40438EcB6D51018"
const accountAddress = "0xFFe85D82409c5b9D734066C134b0c2CCDd68C4dF"
const accountAddress2 = '0xfbc7Ec602A24A338A2E6F182E2B9793D22682D59'
const symbol = 'BTCUSD-20000-P'
const symbolId = '0x468e9b8afd36ecd29f819119c2dbd1b49beb3947f79ba35268299a128b96dcd1'
const symbol2 = 'ETHUSD-1000-P'
const symbolId2 = '0x3322aa6a423d1af64c79897814d2424fac3d724ade1d14e0a572072ae54903d9'

// const symbol1 = 'SOLUSDT'
// const symbol2 = 'DOTUSDT'

describe('query api', () => {
  // it('isUnlocked true', async() => {
  //   const res = await isUnlocked({ chainId: 97, accountAddress, bTokenSymbol: 'BUSD' })
  //   expect(res.success).toEqual(true)
  //   expect(res.response.data).toEqual(true)
  // }, TIMEOUT)

  // it('isUnlocked false', async() => {
  //   const res = await isUnlocked({ chainId, accountAddress: accountAddress2, bTokenSymbol: 'BUSD' })
  //   expect(res.success).toEqual(true)
  //   expect(res.response.data).toEqual(false)
  // }, TIMEOUT)

  it('getSymbolInfo', async () => {
    const res = await getSymbolInfo({ chainId, accountAddress, symbol: symbol2 })
    expect(res.success).toEqual(true)
    expect(res.response.data).toEqual([])
  }, TIMEOUT)

//   // it('getBetInfo with arbi', async () => {
//   //   const res = await getBetInfo({ chainId: '421611', accountAddress, symbol: "BTCUSD"})
//   //   expect(res.success).toEqual(true)
//   //   expect(res.response.data).toEqual([])
//   // }, TIMEOUT)

//   // it('getBetInfo with arbi without wallet connected', async () => {
//   //   const res = await getBetInfo({ chainId: '421611', symbol: "BTCUSD"})
//   //   expect(res.success).toEqual(true)
//   //   expect(res.response.data).toEqual([])
//   // }, TIMEOUT)

//   // it('getBetsInfo', async () => {
//   //   const res = await getBetsInfo({ chainId, accountAddress, symbols: [symbol1, symbol2] })
//   //   expect(res.success).toEqual(true)
//   //   expect(res.response.data).toEqual([])
//   // }, TIMEOUT)

//   // it('getWalletBalance BNB', async () => {
//   //   const res = await getWalletBalance({ chainId, accountAddress, bTokenSymbol: 'BNB'})
//   //   expect(res.success).toEqual(true)
//   //   expect(res.response.data).toEqual([])
//   // }, TIMEOUT)

//   // it('getWalletBalance CAKE bsc', async () => {
//   //   const res = await getWalletBalance({ chainId, accountAddress, bTokenSymbol: 'CAKE'})
//   //   expect(res.success).toEqual(true)
//   //   expect(res.response.data).toEqual([])
//   // }, TIMEOUT)

//   // it('getWalletBalance arbi', async () => {
//   //   const res = await getWalletBalance({ chainId: '421611', accountAddress, bTokenSymbol: 'USDC' })
//   //   expect(res.success).toEqual(true)
//   //   expect(res.response.data).toEqual([])
//   // }, TIMEOUT)

//   // it('getTotalPnl', async () => {
//   //   const res = await getBetsPnl({ chainId, accountAddress })
//   //   expect(res.success).toEqual(true)
//   //   expect(res.response.data).toEqual('0')
//   // }, TIMEOUT)

//   it('getLiquidationInfo', async () => {
//     DeriEnv.set(Env.PROD)
//     const res = await getLiquidationInfo({ chainId: '56', accountAddress: '0x0000000000000000000000000000000000000000', symbol: 'ETHUSD' })
//     expect(res.success).toEqual(true)
//     expect(res.response.data).toEqual('')
//     DeriEnv.set(Env.DEV)
//   }, TIMEOUT)

})