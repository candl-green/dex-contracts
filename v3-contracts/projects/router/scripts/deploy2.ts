import { ethers, network } from 'hardhat'
import { configs } from '@candl/common/config'
import { tryVerify } from '@candl/common/verify'
import { writeFileSync } from 'fs'

async function main() {
  // Remember to update the init code hash in SC for different chains before deploying
  const networkName = network.name
  const config = configs[networkName as keyof typeof configs]
  if (!config) {
    throw new Error(`No config found for network ${networkName}`)
  }

  const v3DeployedContracts = await import(`@candl/v3-core/deployments/${networkName}.json`)
  const v3PeripheryDeployedContracts = await import(`@candl/v3-periphery/deployments/${networkName}.json`)

  const stableSwapDeployedContracts = await import(`@candl/stableswap/deployments/${networkName}.json`)

  const candlV3PoolDeployer_address = v3DeployedContracts.CandlV3PoolDeployer
  const candlV3Factory_address = v3DeployedContracts.CandlV3Factory
  const positionManager_address = v3PeripheryDeployedContracts.NonfungiblePositionManager

  // const smartRouterHelper = {
  //   address: '0xB825c66981438490F3B2C1FcA271897768fd86D7'
  // }
  // const smartRouter = {
  //   address: '0x07398a23ac6634b24339Dca4C417Ba74FB6406cc'
  // }
  // const mixedRouteQuoterV1 = {
  //   address: '0xdBC860887233C9C9A841D62aa88A5f699B16a277'
  // }
  // const quoterV2 = {
  //   address: '0x7e1ef0285372Ff524048A5ca397fFDAD021ee6CF'
  // }

  /** SmartRouterHelper */
  console.log('Deploying SmartRouterHelper...')
  const SmartRouterHelper = await ethers.getContractFactory('SmartRouterHelper')
  const smartRouterHelper = await SmartRouterHelper.deploy()
  console.log('SmartRouterHelper deployed to:', smartRouterHelper.address)
  // // await tryVerify(smartRouterHelper)

  /** SmartRouter */
  console.log('Deploying SmartRouter...')
  const SmartRouter = await ethers.getContractFactory('SmartRouter', {
    libraries: {
      SmartRouterHelper: smartRouterHelper.address,
    },
  })
  const smartRouter = await SmartRouter.deploy(
    config.v2Factory,
    candlV3PoolDeployer_address,
    candlV3Factory_address,
    positionManager_address,
    stableSwapDeployedContracts.CandlStableSwapFactory,
    stableSwapDeployedContracts.CandlStableSwapTwoPoolInfo,
    config.WNATIVE
  )
  console.log('SmartRouter deployed to:', smartRouter.address)

  // await tryVerify(smartRouter, [
  //   config.v2Factory,
  //   candlV3PoolDeployer_address,
  //   candlV3Factory_address,
  //   positionManager_address,
  //   config.stableFactory,
  //   config.stableInfo,
  //   config.WNATIVE,
  // ])

  /** MixedRouteQuoterV1 */
  const MixedRouteQuoterV1 = await ethers.getContractFactory('MixedRouteQuoterV1', {
    libraries: {
      SmartRouterHelper: smartRouterHelper.address,
    },
  })
  const mixedRouteQuoterV1 = await MixedRouteQuoterV1.deploy(
    candlV3PoolDeployer_address,
    candlV3Factory_address,
    config.v2Factory,
    stableSwapDeployedContracts.CandlStableSwapFactory,
    config.WNATIVE
  )
  console.log('MixedRouteQuoterV1 deployed to:', mixedRouteQuoterV1.address)

  // await tryVerify(mixedRouteQuoterV1, [
  //   candlV3PoolDeployer_address,
  //   candlV3Factory_address,
  //   config.v2Factory,
  //   config.stableFactory,
  //   config.WNATIVE,
  // ])

  /** QuoterV2 */
  const QuoterV2 = await ethers.getContractFactory('QuoterV2', {
    libraries: {
      SmartRouterHelper: smartRouterHelper.address,
    },
  })
  const quoterV2 = await QuoterV2.deploy(candlV3PoolDeployer_address, candlV3Factory_address, config.WNATIVE)
  console.log('QuoterV2 deployed to:', quoterV2.address)

  // await tryVerify(quoterV2, [candlV3PoolDeployer_address, candlV3Factory_address, config.WNATIVE])

  /** TokenValidator */
  const TokenValidator = await ethers.getContractFactory('TokenValidator', {
    libraries: {
      SmartRouterHelper: smartRouterHelper.address,
    },
  })
  const tokenValidator = await TokenValidator.deploy(config.v2Factory, positionManager_address)
  console.log('TokenValidator deployed to:', tokenValidator.address)

  // await tryVerify(tokenValidator, [config.v2Factory, positionManager_address])

  const contracts = {
    SmartRouter: smartRouter.address,
    SmartRouterHelper: smartRouterHelper.address,
    MixedRouteQuoterV1: mixedRouteQuoterV1.address,
    QuoterV2: quoterV2.address,
    TokenValidator: tokenValidator.address,
  }

  writeFileSync(`./deployments/${network.name}.json`, JSON.stringify(contracts, null, 2))
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
