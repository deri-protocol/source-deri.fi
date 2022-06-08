import { catchApiError, catchTxApiError, DeriEnv, fromWei, hexToNumberString, toChecksumAddress } from "../../shared";
import { databaseDeriVoteFactory } from "../../shared/factory/database";
import { getDeriVoteConfig } from "../config";
import { deriVoteFactory } from "../contract/factory";

const votingId = '2'
const keyPrefix = () => (DeriEnv.get() === 'prod' ? `VID${votingId}` : 'VID1');


export const getVotingResult = async() => {
  return catchApiError(
    async () => {
      const db = databaseDeriVoteFactory();
      const keys = [
        `${keyPrefix()}.OP1.count`,
        `${keyPrefix()}.OP2.count`,
        `${keyPrefix()}.OP3.count`,
      ];
      const res = await db.getValues(keys);
      return res.map((v) => fromWei(hexToNumberString(v)));
    },
    [],
    'getOptionsVotingPowers',
    ['', '', '']
  );
}

export const getUserVotingPower = async(accountAddress) => {
  return catchApiError(async() => {
    accountAddress = toChecksumAddress(accountAddress)
    const db = databaseDeriVoteFactory()
    const keys = [
      `${keyPrefix()}.${accountAddress}.count`,
    ]
    const res = await db.getValues(keys)
    return res.map((v) => fromWei(hexToNumberString(v)))[0]
  }, [accountAddress], 'getUserVotingPowers', '')
}


export const getUserVotingResult = async (accountAddress) => {
  const args = [accountAddress];
  return catchApiError(
    async () => {
      accountAddress = toChecksumAddress(accountAddress);
      const db = databaseDeriVoteFactory();
      const keys = [
        `${keyPrefix()}.${accountAddress}.count`,
        `${keyPrefix()}.${accountAddress}.option`,
        `${keyPrefix()}.${accountAddress}.timestamp`,
      ];
      const res = await db.getValues(keys);
      return {
        votingPower: fromWei(hexToNumberString(res[0])),
        option: hexToNumberString(res[1]),
        timestamp: hexToNumberString(res[2]),
      };
    },
    args,
    'getVoteResult',
    ''
  );
};

export const vote = async(chainId, accountAddress, votingOption) => {
  const args = [chainId, accountAddress, votingOption]
  return catchTxApiError(async() => {
    chainId = chainId.toString()
    accountAddress = toChecksumAddress(accountAddress)
    const config = getDeriVoteConfig(chainId)
    const deriVote = deriVoteFactory(chainId, config.address)
    const voteId = await deriVote.votingId()
    if (voteId !== votingId) {
      throw new Error(
        `Deri Vote: votingId is not match (${votingId} !== ${voteId}) `
      );
    }
    return await deriVote.vote(accountAddress, votingOption)
  }, args)
}