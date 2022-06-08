import { DeriContract } from "../../contract/deri/deri";
import { MiningVaultPool } from "../../contract/deri/mining_vault_pool";
import { MiningVaultRouter } from "../../contract/deri/mining_vault_router";
import { WormholeContract } from "../../contract/deri/wormhole";
import { factory } from "../../utils"


export const deriFactory = factory(DeriContract)

export const wormholeFactory = factory(WormholeContract)

export const miningVaultRouterFactory = factory(MiningVaultRouter)

export const miningVaultPoolFactory = factory(MiningVaultPool)