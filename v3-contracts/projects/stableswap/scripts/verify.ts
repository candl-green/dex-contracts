import { verifyContract } from '@candl/common/verify'
import { sleep } from '@candl/common/sleep'

async function main() {
  const networkName = network.name
  const deployedContracts = await import(`@candl/v3-core/deployments/${networkName}.json`)

  // Verify CandlStableSwapLPFactory
  console.log('Verify CandlStableSwapLPFactory')
  await verifyContract(deployedContracts.CandlStableSwapLPFactory)
  await sleep(10000)

  // // Verify candlV3Factory
  // console.log('Verify candlV3Factory')
  // await verifyContract(deployedContracts.CandlV3Factory, [deployedContracts.CandlStableSwapLPFactory])
  // await sleep(10000)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
