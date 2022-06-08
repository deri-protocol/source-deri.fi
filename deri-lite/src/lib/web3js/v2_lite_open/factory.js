import { factory } from '../shared/utils/factory'
import { OracleFactoryChainlinkAdapter, OracleFactoryOffChainAdapter } from './adapter'
import { ChainlinkFeed } from './contract/chainlink_feed'
import { OracleFactoryChainlink } from './contract/gen/OracleFactoryChainlink'
import { OracleFactoryOffChain } from './contract/gen/OracleFactoryOffChain'
import { PerpetualPoolLite } from './contract/perpetual_pool'
import { PerpetualPoolLiteManager } from './contract/perpetual_pool_lite_manager'
import { PerpetualPoolLiteViewer } from './contract/perpetual_pool_lite_viewer'

export const perpetualPoolLiteFactory = factory(PerpetualPoolLite)
export const perpetualPoolLiteViewerFactory = factory(PerpetualPoolLiteViewer)
export const perpetualPoolLiteManagerFactory = factory(PerpetualPoolLiteManager)
export const chainlinkFeedFactory = factory(ChainlinkFeed)


export const oracleFactoryChainlinkFactory = factory(OracleFactoryChainlinkAdapter(OracleFactoryChainlink))
export const oracleFactoryOffChainFactory = factory(OracleFactoryOffChainAdapter(OracleFactoryOffChain))