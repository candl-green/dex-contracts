import { verifyContract } from '@candl/common/verify'
import { sleep } from '@candl/common/sleep'

async function main() {
  const networkName = network.name
  const deployedContracts = await import(`@candl/v3-core/deployments/${networkName}.json`)

  // Verify CandlV3PoolDeployer
  console.log('Verify CandlV3PoolDeployer')
  await verifyContract(deployedContracts.CandlV3PoolDeployer)
  await sleep(10000)

  // Verify candlV3Factory
  console.log('Verify candlV3Factory')
  await verifyContract(deployedContracts.CandlV3Factory, [deployedContracts.CandlV3PoolDeployer])
  await sleep(10000)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
