import { TIMEOUT } from '../../shared/__test__/setup';
import { getDeriVoteConfig } from '../config';
import { deriVoteFactory } from '../contract/factory';

describe('deri vote', () => {
  let deriVote
  beforeAll(() => {
    const chainId = '56'
    const config = getDeriVoteConfig(chainId, 'prod')
    deriVote = deriVoteFactory(config.chainId, config.address)
  })
  it('name', async () => {
    expect(await deriVote.name()).toEqual('DeriVote')
  }, TIMEOUT);
  it('numVotingOptions', async () => {
    expect(await deriVote.numVotingOptions()).toEqual('3')
  }, TIMEOUT);
  it('votingDeadline', async () => {
    expect(await deriVote.votingDeadline()).toEqual('1616126400')
  }, TIMEOUT);
  it('votingId', async () => {
    expect(await deriVote.votingId()).toEqual('1')
  }, TIMEOUT);
  it(
    'votingTopics',
    async () => {
      expect(await deriVote.votingTopics('1')).toEqual(
        'DIP1: 1. share transaction fee with DERI holders; 2. buy back DERI with transation fee income; 3. status quo'
      );
    },
    TIMEOUT
  );
  it('votingOptions', async () => {
    expect(await deriVote.votingOptions('1', '0xFefC938c543751babc46cc1D662B982bd1636721')).toEqual('0')
  }, TIMEOUT);
});
