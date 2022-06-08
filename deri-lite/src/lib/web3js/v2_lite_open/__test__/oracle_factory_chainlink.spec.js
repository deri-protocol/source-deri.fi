import { TIMEOUT } from "../../shared/__test__/setup";
import { oracleFactoryChainlinkFactory } from "../factory"
import { getOracleFactoryChainlinkConfig } from  '../config'

describe('Oracle Factory ChainLink', () => {
  it('getFeed', async () => {
    expect(
      await oracleFactoryChainlinkFactory(
        '97',
        '0xb2A57Be443C75AB9e6662FfA83E3ba6455D0AA7F'
      ).getFeed('BTCUSD')
    ).toEqual('0xBD76fDBB9D4fe95F7dEdf96E85E37FD55b8bF500');
  }, TIMEOUT);
  it('getOracle', async () => {
    const chainId = '97'
    const config = getOracleFactoryChainlinkConfig(chainId)
    expect(
      await oracleFactoryChainlinkFactory(chainId, config.address).getOracle('BTCUSD')
    ).toEqual('0x947De810AD61BF89eb2cfBf8f8800E0D01A0EDE0');
  }, TIMEOUT);
});