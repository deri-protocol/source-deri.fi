// import { checkChainId } from "../utils/chain"
// import { getBToken, getBTokenList, getPoolConfigList, getSymbol, getSymbolList } from "../utils/config"
// import { getWeb3 } from "../utils/web3"

// const TIMEOUT = 30 * 1000

// describe('utils', () => {
//   it('checkChainId', () => {
//     const res = checkChainId(56)
//     expect(res).toEqual('56')
//   })
//   it('getWeb3', async () => {
//     const [web3] = await Promise.all([
//       getWeb3(56),
//       getWeb3(56),
//     ])
//     const blockNumber = await web3.eth.getBlockNumber()
//     expect(blockNumber).toBeGreaterThan(17713297)
//     expect(blockNumber).toBeLessThan(177132970)
//   }, TIMEOUT)
//   it('getWeb3 arbi', async () => {
//     const [web3] = await Promise.all([
//       getWeb3(421611),
//     ])
//     const blockNumber = await web3.eth.getBlockNumber()
//     expect(blockNumber).toBeLessThan(177132970)
//   }, TIMEOUT)
//   it('getPoolConfigList', () => {
//     const res = getPoolConfigList({chainId: '97'})
//     expect(res.length).toEqual(1)
//   })
//   it('getBTokenList', () => {
//     const res = getBTokenList('97')
//     // expect(res).toEqual([])
//     expect(res.length).toEqual(18)
//   })
//   it('getBToken', () => {
//     const res = getBToken('97', 'CAKE')
//     expect(res).toEqual({
//       "chainId": "97",
//       "pool": "0xAADA94FcDcD7FCd7488C8DFc8eddaac81d7F71EE",
//       "bTokenAddress": "0xe8bd7cCC165FAEb9b81569B05424771B9A20cbEF",
//       "bTokenSymbol": "CAKE",
//     })
//   })
//   it('getSymbolList', () => {
//     const res = getSymbolList('97')
//     expect(res.length).toEqual(11)
//   })
//   it('getSymbol', () => {
//     const res = getSymbol('97', 'SOLUSDT')
//     expect(res).toEqual({
//       "chainId": "97",
//       "pool": "0xAADA94FcDcD7FCd7488C8DFc8eddaac81d7F71EE",
//       "category": "futures",
//       "symbol": "SOLUSDT",
//       "symbolId": "0x3db5e9fb22b6f66ce6550ab2b9d3872f875f575780c6abb9c95f9ce03845a83e",
//       "unit": "SOL",
//       "powerSymbol": null,
//     })
//   })
// })