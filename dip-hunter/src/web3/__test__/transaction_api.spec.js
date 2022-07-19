import { isUnlocked } from "../api/query_api"
import { deposit, unlock, withdraw } from "../api/transaction_api"
import { TIMEOUT } from "./shared"

// const chainId = '97'
const chainId = '97'
const poolAddress = "0xAADA94FcDcD7FCd7488C8DFc8eddaac81d7F71EE"
const accountAddress = "0xFFe85D82409c5b9D734066C134b0c2CCDd68C4dF"
const accountAddress2 = '0xfbc7Ec602A24A338A2E6F182E2B9793D22682D59'
const bTokenSymbol = 'BUSD'
const symbol = 'BTCUSD-20000-P'
const symbolId = '0x468e9b8afd36ecd29f819119c2dbd1b49beb3947f79ba35268299a128b96dcd1'
const symbol2 = 'ETHUSD-1000-P'
const symbolId2 = '0x3322aa6a423d1af64c79897814d2424fac3d724ade1d14e0a572072ae54903d9'

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
  // it('trade', async() => {
  //   let res = await deposit({ chainId, symbol: 'ETHUSD-1000-P', bTokenSymbol, amount: '1200',  accountAddress, isNodeEnv: true, ...callback })
  //   expect(res.success).toEqual(false)
  //   expect(res.response.error.message).toContain('has no position')
  // }, TIMEOUT)
  it('withdraw', async() => {
    let res = await withdraw({ chainId, symbol: 'ETHUSD-1000-P', bTokenSymbol, amount: '400', volume: '0.4', accountAddress, isNodeEnv: true, ...callback })
    expect(res.success).toEqual(false)
    expect(res.response.error.message).toContain('has no position')
  }, TIMEOUT)

})