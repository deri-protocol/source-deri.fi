// import { getDeriLensAddress } from "../config"
// import { deriLensFactoryProxy } from "../contract/factory"
// import { TIMEOUT } from "./shared"

// const chainId = '97'
// const poolAddress = '0xAADA94FcDcD7FCd7488C8DFc8eddaac81d7F71EE'

// describe('deri lens', () => {
//   let deriLens
//   beforeAll(() => {
//     deriLens = deriLensFactoryProxy(chainId, getDeriLensAddress(chainId))
//   })
//   it('getMarkets', async() => {
//     const res = await deriLens.getMarketsInfo(poolAddress)
//     expect(res).toEqual([])
//   }, TIMEOUT)
//   it('getSymbolsInfo', async() => {
//     const res = await deriLens.getSymbolsInfo(poolAddress)
//     expect(res).toEqual([])
//   }, TIMEOUT)
//   // it('getInfo', async() => {
//   //   const res = await deriLens.getInfo(poolAddress)
//   //   expect(res.marketsInfo[0]).toEqual([])
//   // }, TIMEOUT)
// })