#!/usr/bin/env zx
// import 'zx/globals'

require('dotenv').config({ path: require('find-config')('.env') })

const networks = {
  eth: 'eth',
  goerli: 'goerli',
  bscMainnet: 'bscMainnet',
  bscTestnet: 'bscTestnet',
  hardhat: 'hardhat',
  blockspotTestnet: 'blockspotTestnet',
}

let network = process.env.NETWORK
console.log(network, 'network')
if (!network || !networks[network]) {
  throw new Error(`env NETWORK: ${network}`)
}

await $`yarn workspace @candl/stableswap run hardhat run scripts/verify.ts --network ${network}`

await $`yarn workspace @candl/v3-core run hardhat run scripts/verify.ts --network ${network}`

await $`yarn workspace @candl/v3-periphery run hardhat run scripts/verify.ts --network ${network}`

await $`yarn workspace @candl/smart-router run hardhat run scripts/verify.ts --network ${network}`

console.log(chalk.blue('Done!'))
