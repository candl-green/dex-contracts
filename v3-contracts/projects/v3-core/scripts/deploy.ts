import { tryVerify } from '@candl/common/verify'
import { ContractFactory } from 'ethers'
import { ethers, network } from 'hardhat'
import { sleep } from '@candl/common/sleep'
import fs from 'fs'

type ContractJson = { abi: any; bytecode: string }
const artifacts: { [name: string]: ContractJson } = {
  // eslint-disable-next-line global-require
  CandlV3PoolDeployer: require('../artifacts/contracts/CandlV3PoolDeployer.sol/CandlV3PoolDeployer.json'),
  // eslint-disable-next-line global-require
  CandlV3Factory: require('../artifacts/contracts/CandlV3Factory.sol/CandlV3Factory.json'),
}

async function main() {
  const [owner] = await ethers.getSigners()
  const networkName = network.name
  console.log('owner', owner.address)

  let candlV3PoolDeployer_address = ''
  let candlV3PoolDeployer
  const CandlV3PoolDeployer = new ContractFactory(
    artifacts.CandlV3PoolDeployer.abi,
    artifacts.CandlV3PoolDeployer.bytecode,
    owner
  )
  if (!candlV3PoolDeployer_address) {
    candlV3PoolDeployer = await CandlV3PoolDeployer.deploy()

    candlV3PoolDeployer_address = candlV3PoolDeployer.address
    console.log('candlV3PoolDeployer', candlV3PoolDeployer_address)
  } else {
    candlV3PoolDeployer = new ethers.Contract(
      candlV3PoolDeployer_address,
      artifacts.CandlV3PoolDeployer.abi,
      owner
    )
  }
  sleep(100)

  let candlV3Factory_address = ''
  let candlV3Factory
  if (!candlV3Factory_address) {
    const CandlV3Factory = new ContractFactory(
      artifacts.CandlV3Factory.abi,
      artifacts.CandlV3Factory.bytecode,
      owner
    )
    candlV3Factory = await CandlV3Factory.deploy(candlV3PoolDeployer_address)

    candlV3Factory_address = candlV3Factory.address
    console.log('candlV3Factory', candlV3Factory_address)
  } else {
    candlV3Factory = new ethers.Contract(candlV3Factory_address, artifacts.CandlV3Factory.abi, owner)
  }
  sleep(100)

  // Set FactoryAddress for candlV3PoolDeployer.
  await candlV3PoolDeployer.setFactoryAddress(candlV3Factory_address);


  const contracts = {
    CandlV3Factory: candlV3Factory_address,
    CandlV3PoolDeployer: candlV3PoolDeployer_address,
  }

  fs.writeFileSync(`./deployments/${networkName}.json`, JSON.stringify(contracts, null, 2))
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
