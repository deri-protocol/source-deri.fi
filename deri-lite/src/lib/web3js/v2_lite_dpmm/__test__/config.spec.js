import { DeriEnv, getPoolConfig } from "../../shared";

describe('config', () => {
  it('getConfig', async () => {
    DeriEnv.set('testnet')
    const res = getPoolConfig('0x43701b4bf0430DeCFA41210327fE67Bf4651604C');
    expect(res).toEqual('')
  });
});
