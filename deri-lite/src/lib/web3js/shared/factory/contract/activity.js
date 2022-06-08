import { factory } from '../../utils/factory';
import { BrokerManager } from '../../contract/activity/broker_manager';
import { PTokenAirdrop } from '../../contract/activity/ptoken_airdrop';

export const brokerManagerFactory = factory(BrokerManager);
export const pTokenAirdropFactory = factory(PTokenAirdrop);
