import { DeriEnv, getPoolConfig } from "../../shared"

describe('config', () => {
  it('getPoolConfig', async() => {
    DeriEnv.set('testnet')
    const res = getPoolConfig('0x1018d827B8392afFcD72A7c8A5eED390cB0599B1')
    DeriEnv.set('dev')
    expect(res).toEqual('')
  })
})