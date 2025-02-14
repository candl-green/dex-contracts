import { verifyContract } from '@candl/common/verify'
import { sleep } from '@candl/common/sleep'
import { configs } from '@candl/common/config'

async function main() {
  const networkName = network.name
  const config = configs[networkName as keyof typeof configs]

  if (!config) {
    throw new Error(`No config found for network ${networkName}`)
  }
  const deployedContracts_v3_core = await import(`@candl/v3-core/deployments/${networkName}.json`)
  const deployedContracts_v3_periphery = await import(`@candl/v3-periphery/deployments/${networkName}.json`)
  const deployedContracts_smart_router = await import(`@candl/smart-router/deployments/${networkName}.json`)

  const deployedContracts_stableswap = await import(`@candl/stableswap/deployments/${networkName}.json`)

  // Verify SmartRouterHelper
  console.log('Verify SmartRouterHelper')
  await verifyContract(deployedContracts_smart_router.SmartRouterHelper)
  await sleep(10000)

  // Verify swapRouter
  console.log('Verify swapRouter')
  await verifyContract(deployedContracts_smart_router.SmartRouter, [
    config.v2Factory,
    deployedContracts_v3_core.CandlV3PoolDeployer,
    deployedContracts_v3_core.CandlV3Factory,
    deployedContracts_v3_periphery.NonfungiblePositionManager,
    deployedContracts_stableswap.CandlStableSwapFactory,
    deployedContracts_stableswap.CandlStableSwapTwoPoolInfo,
    config.WNATIVE,
  ])
  await sleep(10000)

  // Verify mixedRouteQuoterV1
  console.log('Verify mixedRouteQuoterV1')
  await verifyContract(deployedContracts_smart_router.MixedRouteQuoterV1, [
    deployedContracts_v3_core.CandlV3PoolDeployer,
    deployedContracts_v3_core.CandlV3Factory,
    config.v2Factory,
    deployedContracts_stableswap.CandlStableSwapFactory,
    config.WNATIVE,
  ])
  await sleep(10000)

  // Verify quoterV2
  console.log('Verify quoterV2')
  await verifyContract(deployedContracts_smart_router.QuoterV2, [
    deployedContracts_v3_core.CandlV3PoolDeployer,
    deployedContracts_v3_core.CandlV3Factory,
    config.WNATIVE,
  ])
  await sleep(10000)

  // Verify tokenValidator
  console.log('Verify tokenValidator')
  await verifyContract(deployedContracts_smart_router.TokenValidator, [
    config.v2Factory,
    deployedContracts_v3_periphery.NonfungiblePositionManager,
  ])
  await sleep(10000)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
