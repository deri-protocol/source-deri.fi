import { contractFactory } from "../utils";
import { PTokenAirdropNULSAdapter, deriVoteAdapter, currencyVaultAdapter } from "./adapter";

import { PTokenAirdropNULS } from "./gen/PTokenAirdropNULS";
import { DeriVote } from "./gen/DeriVote.js";
import { CurrencyVault } from "./gen/CurrencyVault.js";

// pToken airdrop
export const PTokenAirdropNULSFactory = contractFactory(
  PTokenAirdropNULSAdapter(PTokenAirdropNULS)
);

// deri vote
export const deriVoteFactory = contractFactory(deriVoteAdapter(DeriVote));

// bnb claim
export const currencyVaultFactory = contractFactory(currencyVaultAdapter(CurrencyVault));