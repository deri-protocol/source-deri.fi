import { contractFactory } from "../utils/factory";
import { DipBrokerAdapter, ERC20Adapter, symbolManagerImplementationAdapter } from "./adapter/adapter";
import { ERC20 } from "./gen/ERC20";
import { DeriLens } from "./gen/DeriLens.js";
import { DeriLensArbi } from "./gen/DeriLensArbi.js";
import { deriLensAdapter } from "./adapter/deri_lens";
import { deriLensArbiAdapter } from "./adapter/deri_lens_arbi";
import { SymbolManagerImplementation } from "./gen/SymbolManagerImplementation";
import { DipBroker } from "./gen/DipBroker";

export const dipBrokerFactory = contractFactory(DipBrokerAdapter(DipBroker))

export const ERC20Factory = contractFactory(ERC20Adapter(ERC20));
export const symbolManagerImplementationFactory = contractFactory(
  symbolManagerImplementationAdapter(SymbolManagerImplementation)
);

export const deriLensFactory = contractFactory(deriLensAdapter(DeriLens));
export const deriLensArbiFactory = contractFactory(deriLensArbiAdapter(DeriLensArbi));

export const deriLensFactoryProxy = (chainId, lensAddress) => {
  if (['42161', '421611'].includes(chainId)) {
    return deriLensArbiFactory(chainId, lensAddress)
  } else {
    return deriLensFactory(chainId, lensAddress)
  }
}