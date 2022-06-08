import { DeriEnv } from "../../shared"
import {
  getStakingTop10Users,
  getUserStakingClaimInfo,
  getUserStakingContribution,
  getUserStakingInfo,
  getUserStakingReward,
  claimMyStaking,
} from '../api/deri_staking';
import { getStakingMiningVaultRouterConfig } from "../config"

const TIMEOUT = 20000

const account = '0xa23b5c3da552ad5bf84648fec5c86540a0bf0db8'

describe('deri staking', () => {
  it('getStakingTop10Users', async() => {
    expect(await getStakingTop10Users('2')).toEqual([])
  }, TIMEOUT)
  it('getUserStakingInfo', async() => {
    expect(await getUserStakingInfo(account, 2)).toEqual({})
  }, TIMEOUT)
  it('getUserStakingReward', async() => {
    expect(await getUserStakingReward(account, 2)).toEqual({})
  }, TIMEOUT)
  it('getUserStakingContribution', async() => {
    DeriEnv.set('prod')
    //expect(await getUserStakingContribution(account)).toEqual({})
    expect(await getUserStakingContribution('0xFefC938c543751babc46cc1D662B982bd1636721', '2')).toEqual({})
    DeriEnv.set('dev')
  }, TIMEOUT)
  it('getStakingMiningVaultRouterConfig', () => {
    const res = getStakingMiningVaultRouterConfig()
    expect(res).toEqual({})
  })
  it('getUserStakingClaimInfo', async() => {
    //DeriEnv.set('prod')
    //expect(await getUserStakingClaimInfo('0x844A3DaEabE7Ba8d095911f25D55Fc210adb0Cb2', '1')).toEqual({})
    DeriEnv.set('dev')
    expect(await getUserStakingClaimInfo('0x8AC9696876C46fD2C2F3c7ed8843F5833ecDE888', '1')).toEqual({})

  })
  it('claimMyStaking', async() => {
    const res = await claimMyStaking('0x8AC9696876C46fD2C2F3c7ed8843F5833ecDE888', '1')
    expect(res).toEqual({})
  })
})