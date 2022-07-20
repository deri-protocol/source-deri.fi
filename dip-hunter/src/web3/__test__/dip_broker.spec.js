import { dipBrokerFactory } from "../contract/factory.js"
import { TIMEOUT } from "./shared.js"

const poolAddress = "0xAADA94FcDcD7FCd7488C8DFc8eddaac81d7F71EE"
const accountAddress = "0xFFe85D82409c5b9D734066C134b0c2CCDd68C4dF"
const accountAddress2 = '0xfbc7Ec602A24A338A2E6F182E2B9793D22682D59'
const symbol = 'BTCUSD-20000-P'
const symbolId = '0x468e9b8afd36ecd29f819119c2dbd1b49beb3947f79ba35268299a128b96dcd1'
const symbol2 = 'ETHUSD-1000-P'
const symbolId2 = '0x98fc75eeaf2daf20762fde47b011dc0b9bbc272d057f010223476676501d04f7'

describe("dipbroker", () => {
  let dipBroker
  beforeAll(() => {
    dipBroker = dipBrokerFactory('97', '0xEb2De195A94f213E52350F968552931f81Fa9517')
  })
  // it("admin", async() => {
  //   expect(await dipBroker.admin()).toEqual('')
  // }, TIMEOUT)
  // it("client without a position", async() => {
  //   expect(await dipBroker.clients(accountAddress2, poolAddress, symbolId2)).toEqual('')
  // }, TIMEOUT)
  // it("client with a position", async() => {
  //   expect(await dipBroker.clients(accountAddress, poolAddress, symbolId2)).toEqual('')
  // }, TIMEOUT)

  // it("getUserStatus", async() => {
  //   expect(await dipBroker.getUserStatus(poolAddress, accountAddress, symbolId)).toEqual('')
  // }, TIMEOUT)
  // it("getUserStatuses", async() => {
  //   expect(await dipBroker.getUserStatuses(poolAddress, accountAddress, [symbol, symbol2])).toEqual([])
  // }, TIMEOUT)

  it("getVolume", async() => {
    expect(await dipBroker.getVolume('0xFefC938c543751babc46cc1D662B982bd1636721',poolAddress, symbolId2)).toEqual('')
  }, TIMEOUT)
  // it("getVolumes", async() => {
  //   expect(await dipBroker.getVolumes(accountAddress, poolAddress, [symbol, symbol2])).toEqual([])
  // }, TIMEOUT)

})