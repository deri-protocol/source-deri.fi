// import { ERC20Factory } from "../contract/factory"
// import { MAX_UINT256 } from "../utils/constant"
// import { sendTxWithPkey, TIMEOUT } from "./shared"

// const chainId = '97'
// const brokerAddress = '0xcD3B34f2942c26a5c070767441f9Fc45e6E3f4ca'
// const accountAddress = '0x0000000000000000000000000000000000000000'
// const poolAddress = '0xAADA94FcDcD7FCd7488C8DFc8eddaac81d7F71EE'
// const bToken0 = '0x8301F2213c0eeD49a7E28Ae4c3e91722919B8B47' // busd
// const bToken1 = '0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd' // bnb
// const bToken2 = '0xe8bd7cCC165FAEb9b81569B05424771B9A20cbEF' // cake

// describe('ERC20', () => {
//   let erc20
//   beforeAll(() => {
//     erc20 = ERC20Factory(chainId, bToken0)
//   })
//   it('symbol', async () => {
//     const res = await erc20.symbol()
//     expect(res).toEqual('BUSD')
//   }, TIMEOUT)
//   it('balanceOf', async () => {
//     const res = await erc20.balanceOf(accountAddress)
//     expect(res).toEqual('33379.213904883032432237')
//   }, TIMEOUT)
//   it('isUnlocked', async () => {
//     const res = await erc20.isUnlocked(accountAddress, poolAddress)
//     expect(res).toEqual(true)
//   }, TIMEOUT)
//   it('unlock', async () => {
//     const newAccountAddress = '0xed0F7c6662c5308865862EE97f289107B795C206'
//     let res = await erc20.isUnlocked(newAccountAddress, poolAddress)
//     expect(res).toEqual(true)
//     // if (!res) {
//     //   console.log(await sendTxWithPkey(erc20.web3, erc20.contract, 'approve', [poolAddress, MAX_UINT256]))
//     // }
//     // res = await erc20.isUnlocked(newAccountAddress, poolAddress)
//     // expect(res).toEqual(false)
//   }, 120*1000)
// })