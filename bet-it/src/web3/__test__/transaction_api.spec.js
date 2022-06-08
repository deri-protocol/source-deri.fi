import { isUnlocked } from "../api/query_api"
import { closeBet, openBet, unlock } from "../api/transaction_api"
import { TIMEOUT } from "./shared"

const chainId = '97'
const accountAddress = '0xFFe85D82409c5b9D734066C134b0c2CCDd68C4dF'
const accountAddress2 = '0xfbc7Ec602A24A338A2E6F182E2B9793D22682D59'
const bToken0 = 'BUSD' // busd
const bToken1 = 'CAKE' // bnb
const symbol1 = 'SOLUSDT'
const symbol2 = 'DOTUSDT'

const callback = { onAccept: () => { }, onReject: () => { } }

describe('tx api', () => {
  // it('unlock', async() => {
  //   let res = await isUnlocked({ chainId, accountAddress: accountAddress, bTokenSymbol: 'BUSD' })
  //   expect(res.success).toEqual(true)
  //   expect(res.response.data).toEqual(false)
  //   res = await unlock({chainId, bTokenSymbol: 'BUSD', accountAddress: accountAddress, isNodeEnv: true, ...callback})
  //   expect(res.success).toEqual(true)
  //   res = await isUnlocked({ chainId, accountAddress: accountAddress, bTokenSymbol: 'BUSD' })
  //   expect(res.success).toEqual(true)
  //   expect(res.response.data).toEqual(true)
  // }, TIMEOUT)
  // it('closeBet without position', async() => {
  //   let res = await closeBet({ chainId, symbol: 'AXSUSDT', accountAddress: accountAddress2, isNodeEnv: true, ...callback })
  //   expect(res.success).toEqual(false)
  //   expect(res.response.error.message).toContain('has no position')
  // }, TIMEOUT)

  // it('closeBet with position', async() => {
  //   let res = await closeBet({ chainId, symbol: symbol1, accountAddress: accountAddress, isNodeEnv: true, ...callback })
  //   console.log(res)
  //   expect(res.success).toEqual(true)
  // }, TIMEOUT)

  it('openBet', async() => {
    let res = await openBet({ chainId, bTokenSymbol: 'BUSD', amount: '100', symbol: symbol2, accountAddress: accountAddress, direction: 'long', isNodeEnv: true, ...callback })
    console.log(res)
    expect(res.success).toEqual(false)
  }, TIMEOUT)
})