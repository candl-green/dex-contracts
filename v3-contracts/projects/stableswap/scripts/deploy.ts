import { tryVerify } from '@candl/common/verify'
import { ContractFactory } from 'ethers'
import { ethers, network } from 'hardhat'
import { sleep } from '@candl/common/sleep'
import fs from 'fs'

type ContractJson = { abi: any; bytecode: string }
const artifacts: { [name: string]: ContractJson } = {
  // eslint-disable-next-line global-require
  CandlStableSwapLPFactory: require('../artifacts/contracts/CandlStableSwapLPFactory.sol/CandlStableSwapLPFactory.json'),
  // eslint-disable-next-line global-require
  CandlStableSwapTwoPoolDeployer: require('../artifacts/contracts/CandlStableSwapTwoPoolDeployer.sol/CandlStableSwapTwoPoolDeployer.json'),
  // eslint-disable-next-line global-require
  CandlStableSwapThreePoolDeployer: require('../artifacts/contracts/CandlStableSwapThreePoolDeployer.sol/CandlStableSwapThreePoolDeployer.json'),
  // eslint-disable-next-line global-require
  CandlStableSwapFactory: require('../artifacts/contracts/CandlStableSwapFactory.sol/CandlStableSwapFactory.json'),
  // eslint-disable-next-line global-require
  CandlStableSwapTwoPoolInfo: require('../artifacts/contracts/CandlStableSwapTwoPoolInfo.sol/CandlStableSwapTwoPoolInfo.json'),
  // eslint-disable-next-line global-require
  CandlStableSwapInfo: require('../artifacts/contracts/CandlStableSwapInfo.sol/CandlStableSwapInfo.json'),
  // eslint-disable-next-line global-require
  CandlStableSwapLP: require('../artifacts/contracts/CandlStableSwapLP.sol/CandlStableSwapLP.json'),
  // eslint-disable-next-line global-require
  CandlStableSwapTwoPool: require('../artifacts/contracts/CandlStableSwapTwoPool.sol/CandlStableSwapTwoPool.json'),
}

async function main() {
  const [owner] = await ethers.getSigners()
  const networkName = network.name
  console.log('owner', owner.address)

  let candlStableSwapLPFactory_address = ''
  let candlStableSwapLPFactoryDeployer
  const CandlStableSwapLPFactory = new ContractFactory(
    artifacts.CandlStableSwapLPFactory.abi,
    artifacts.CandlStableSwapLPFactory.bytecode,
    owner
  )
  if (!candlStableSwapLPFactory_address) {
    candlStableSwapLPFactoryDeployer = await CandlStableSwapLPFactory.deploy()

    candlStableSwapLPFactory_address = candlStableSwapLPFactoryDeployer.address
    console.log('candlStableSwapLPFactory', candlStableSwapLPFactory_address)
  } else {
    candlStableSwapLPFactoryDeployer = new ethers.Contract(
      candlStableSwapLPFactory_address,
      artifacts.CandlStableSwapLPFactory.abi,
      owner
    )
  }
  sleep(100)

  let candlStableSwapTwoPoolDeployer_address = ''
  let candlStableSwapTwoPoolDeployerDeployer
  const CandlStableSwapTwoPoolDeployer = new ContractFactory(
    artifacts.CandlStableSwapTwoPoolDeployer.abi,
    artifacts.CandlStableSwapTwoPoolDeployer.bytecode,
    owner
  )
  if (!candlStableSwapTwoPoolDeployer_address) {
    candlStableSwapTwoPoolDeployerDeployer = await CandlStableSwapTwoPoolDeployer.deploy()

    candlStableSwapTwoPoolDeployer_address = candlStableSwapTwoPoolDeployerDeployer.address
    console.log('candlStableSwapTwoPoolDeployerDeployer', candlStableSwapTwoPoolDeployer_address)
  } else {
    candlStableSwapTwoPoolDeployerDeployer = new ethers.Contract(
      candlStableSwapTwoPoolDeployer_address,
      artifacts.CandlStableSwapTwoPoolDeployer.abi,
      owner
    )
  }
  sleep(100)

  let candlStableSwapThreePoolDeployer_address = ''
  let candlStableSwapThreePoolDeployerDeployer
  const CandlStableSwapThreePoolDeployer = new ContractFactory(
    artifacts.CandlStableSwapThreePoolDeployer.abi,
    artifacts.CandlStableSwapThreePoolDeployer.bytecode,
    owner
  )
  if (!candlStableSwapThreePoolDeployer_address) {
    candlStableSwapThreePoolDeployerDeployer = await CandlStableSwapThreePoolDeployer.deploy()

    candlStableSwapThreePoolDeployer_address = candlStableSwapThreePoolDeployerDeployer.address
    console.log('candlStableSwapThreePoolDeployerDeployer', candlStableSwapThreePoolDeployer_address)
  } else {
    candlStableSwapThreePoolDeployerDeployer = new ethers.Contract(
      candlStableSwapThreePoolDeployer_address,
      artifacts.CandlStableSwapThreePoolDeployer.abi,
      owner
    )
  }
  sleep(100)

  let candlStableSwapFactory_address = ''
  let candlStableSwapFactoryDeployer
  const CandlStableSwapFactory = new ContractFactory(
    artifacts.CandlStableSwapFactory.abi,
    artifacts.CandlStableSwapFactory.bytecode,
    owner
  )
  if (!candlStableSwapFactory_address) {
    candlStableSwapFactoryDeployer = await CandlStableSwapFactory.deploy(
      candlStableSwapLPFactory_address,
      candlStableSwapTwoPoolDeployer_address,
      candlStableSwapThreePoolDeployer_address
    )

    candlStableSwapFactory_address = candlStableSwapFactoryDeployer.address
    console.log('candlStableSwapFactoryDeployer', candlStableSwapFactory_address)
  } else {
    candlStableSwapFactoryDeployer = new ethers.Contract(
      candlStableSwapFactory_address,
      artifacts.CandlStableSwapFactory.abi,
      owner
    )
  }
  sleep(100)


  let candlStableSwapTwoPoolInfo_address = ''
  let candlStableSwapTwoPoolInfoDeployer
  const CandlStableSwapTwoPoolInfo = new ContractFactory(
    artifacts.CandlStableSwapTwoPoolInfo.abi,
    artifacts.CandlStableSwapTwoPoolInfo.bytecode,
    owner
  )
  if (!candlStableSwapTwoPoolInfo_address) {
    candlStableSwapTwoPoolInfoDeployer = await CandlStableSwapTwoPoolInfo.deploy()

    candlStableSwapTwoPoolInfo_address = candlStableSwapTwoPoolInfoDeployer.address
    console.log('candlStableSwapTwoPoolInfoDeployer', candlStableSwapTwoPoolInfo_address)
  } else {
    candlStableSwapTwoPoolInfoDeployer = new ethers.Contract(
      candlStableSwapTwoPoolInfo_address,
      artifacts.CandlStableSwapTwoPoolInfo.abi,
      owner
    )
  }
  

  const CandlStableSwapInfo = new ContractFactory(
    artifacts.CandlStableSwapInfo.abi,
    artifacts.CandlStableSwapInfo.bytecode,
    owner
  )
  const candlStableSwapInfo = await CandlStableSwapInfo.deploy()



  const contracts = {
    CandlStableSwapLPFactory: candlStableSwapLPFactory_address,
    CandlStableSwapTwoPoolDeployer: candlStableSwapTwoPoolDeployer_address,
    CandlStableSwapThreePoolDeployer: candlStableSwapThreePoolDeployer_address,
    CandlStableSwapFactory: candlStableSwapFactory_address,
    CandlStableSwapTwoPoolInfo: candlStableSwapTwoPoolInfo_address,
    CandlStableSwapInfo: candlStableSwapInfo.address
  }

  fs.writeFileSync(`./deployments/${networkName}.json`, JSON.stringify(contracts, null, 2))

  
  await candlStableSwapLPFactoryDeployer.transferOwnership(candlStableSwapFactory_address)
  sleep(100)

  await candlStableSwapTwoPoolDeployerDeployer.transferOwnership(candlStableSwapFactory_address)
  sleep(100)

  await candlStableSwapThreePoolDeployerDeployer.transferOwnership(candlStableSwapFactory_address)
  sleep(100)

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
