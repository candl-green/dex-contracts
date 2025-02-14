import bn from 'bignumber.js'
import { Contract, ContractFactory, utils, BigNumber } from 'ethers'
import { ethers, upgrades, network } from 'hardhat'
import { linkLibraries } from '../util/linkLibraries'
import { tryVerify } from '@candl/common/verify'
import { configs } from '@candl/common/config'
import { sleep } from '@candl/common/sleep'
import fs from 'fs'

type ContractJson = { abi: any; bytecode: string }
const artifacts: { [name: string]: ContractJson } = {
  QuoterV2: require('../artifacts/contracts/lens/QuoterV2.sol/QuoterV2.json'),
  TickLens: require('../artifacts/contracts/lens/TickLens.sol/TickLens.json'),
  V3Migrator: require('../artifacts/contracts/V3Migrator.sol/V3Migrator.json'),
  CandlInterfaceMulticall: require('../artifacts/contracts/lens/CandlInterfaceMulticall.sol/CandlInterfaceMulticall.json'),
  CandlInterfaceMulticallV2: require('../artifacts/contracts/lens/CandlInterfaceMulticallV2.sol/CandlInterfaceMulticallV2.json'),
  // eslint-disable-next-line global-require
  SwapRouter: require('../artifacts/contracts/SwapRouter.sol/SwapRouter.json'),
  // eslint-disable-next-line global-require
  NFTDescriptor: require('../artifacts/contracts/libraries/NFTDescriptor.sol/NFTDescriptor.json'),
  // eslint-disable-next-line global-require
  NFTDescriptorEx: require('../artifacts/contracts/NFTDescriptorEx.sol/NFTDescriptorEx.json'),
  // eslint-disable-next-line global-require
  NonfungibleTokenPositionDescriptor: require('../artifacts/contracts/NonfungibleTokenPositionDescriptor.sol/NonfungibleTokenPositionDescriptor.json'),
  // eslint-disable-next-line global-require
  NonfungibleTokenPositionDescriptorOffChain: require('../artifacts/contracts/NonfungibleTokenPositionDescriptorOffChain.sol/NonfungibleTokenPositionDescriptorOffChain.json'),
  // eslint-disable-next-line global-require
  NonfungiblePositionManager: require('../artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json'),
}

bn.config({ EXPONENTIAL_AT: 999999, DECIMAL_PLACES: 40 })
function encodePriceSqrt(reserve1: any, reserve0: any) {
  return BigNumber.from(
    // eslint-disable-next-line new-cap
    new bn(reserve1.toString())
      .div(reserve0.toString())
      .sqrt()
      // eslint-disable-next-line new-cap
      .multipliedBy(new bn(2).pow(96))
      .integerValue(3)
      .toString()
  )
}

function isAscii(str: string): boolean {
  return /^[\x00-\x7F]*$/.test(str)
}
function asciiStringToBytes32(str: string): string {
  if (str.length > 32 || !isAscii(str)) {
    throw new Error('Invalid label, must be less than 32 characters')
  }

  return '0x' + Buffer.from(str, 'ascii').toString('hex').padEnd(64, '0')
}

async function main() {
  const [owner] = await ethers.getSigners()
  const networkName = network.name
  console.log('owner', owner.address)

  const config = configs[networkName as keyof typeof configs]

  if (!config) {
    throw new Error(`No config found for network ${networkName}`)
  }

  const deployedContracts = await import(`@candl/v3-core/deployments/${networkName}.json`)

  const candlV3PoolDeployer_address = deployedContracts.CandlV3PoolDeployer
  const candlV3Factory_address = deployedContracts.CandlV3Factory

  const SwapRouter = new ContractFactory(artifacts.SwapRouter.abi, artifacts.SwapRouter.bytecode, owner)
  const swapRouter = await SwapRouter.deploy(candlV3PoolDeployer_address, candlV3Factory_address, config.WNATIVE)
  sleep(100)

  // await tryVerify(swapRouter, [candlV3PoolDeployer_address, candlV3Factory_address, config.WNATIVE])
  console.log('swapRouter', swapRouter.address)

  // off chain version
  const NonfungibleTokenPositionDescriptor = new ContractFactory(
    artifacts.NonfungibleTokenPositionDescriptorOffChain.abi,
    artifacts.NonfungibleTokenPositionDescriptorOffChain.bytecode,
    owner
  )
  const baseTokenUri = 'https://nft.blockgames.com/dice/'
  const nonfungibleTokenPositionDescriptor = await upgrades.deployProxy(NonfungibleTokenPositionDescriptor, [
    baseTokenUri,
  ])
  await nonfungibleTokenPositionDescriptor.deployed()
  sleep(100)
  console.log('nonfungibleTokenPositionDescriptor', nonfungibleTokenPositionDescriptor.address)

  // await tryVerify(nonfungibleTokenPositionDescriptor)

  const NonfungiblePositionManager = new ContractFactory(
    artifacts.NonfungiblePositionManager.abi,
    artifacts.NonfungiblePositionManager.bytecode,
    owner
  )
  const nonfungiblePositionManager = await NonfungiblePositionManager.deploy(
    candlV3PoolDeployer_address,
    candlV3Factory_address,
    config.WNATIVE,
    nonfungibleTokenPositionDescriptor.address
  )
  sleep(100)

  console.log('nonfungiblePositionManager', nonfungiblePositionManager.address)

  const CandlInterfaceMulticall = new ContractFactory(
    artifacts.CandlInterfaceMulticall.abi,
    artifacts.CandlInterfaceMulticall.bytecode,
    owner
  )

  const candlInterfaceMulticall = await CandlInterfaceMulticall.deploy()
  sleep(100)
  console.log('CandlInterfaceMulticall', candlInterfaceMulticall.address)

  const CandlInterfaceMulticallV2 = new ContractFactory(
    artifacts.CandlInterfaceMulticallV2.abi,
    artifacts.CandlInterfaceMulticallV2.bytecode,
    owner
  )

  const candlInterfaceMulticallV2 = await CandlInterfaceMulticallV2.deploy()
  sleep(100)
  console.log('CandlInterfaceMulticallV2', candlInterfaceMulticallV2.address)

  // await tryVerify(candlInterfaceMulticall)
  // const swapRouter = {
  //   address: '0x8055CA3e1f13661Be73860DBC0c56602dA9A6150'
  // }
  // const nonfungibleTokenPositionDescriptor =  {
  //   address: '0xF183E27623c57BD498EA332e7e7a10877CAc6AcB'
  // }
  // const nonfungiblePositionManager =  {
  //   address: '0xA06Fa05469bD8aa31163f53a1C87591F602e1688'
  // }
  // const candlInterfaceMulticall =  {
  //   address: '0x0bc337154a4551CeD1b1Bb2e164854fF17e6aE90'
  // }

  const V3Migrator = new ContractFactory(artifacts.V3Migrator.abi, artifacts.V3Migrator.bytecode, owner)
  const v3Migrator = await V3Migrator.deploy(
    candlV3PoolDeployer_address,
    candlV3Factory_address,
    config.WNATIVE,
    nonfungiblePositionManager.address
  )
  sleep(100)
  console.log('V3Migrator', v3Migrator.address)

  const TickLens = new ContractFactory(artifacts.TickLens.abi, artifacts.TickLens.bytecode, owner)
  const tickLens = await TickLens.deploy()
  sleep(100)
  console.log('TickLens', tickLens.address)

  // await tryVerify(tickLens)

  const QuoterV2 = new ContractFactory(artifacts.QuoterV2.abi, artifacts.QuoterV2.bytecode, owner)
  const quoterV2 = await QuoterV2.deploy(candlV3PoolDeployer_address, candlV3Factory_address, config.WNATIVE)
  sleep(100)
  console.log('QuoterV2', quoterV2.address)

  await tryVerify(quoterV2, [candlV3PoolDeployer_address, candlV3Factory_address, config.WNATIVE])

  const contracts = {
    SwapRouter: swapRouter.address,
    V3Migrator: v3Migrator.address,
    QuoterV2: quoterV2.address,
    TickLens: tickLens.address,
    NonfungibleTokenPositionDescriptor: nonfungibleTokenPositionDescriptor.address,
    NonfungiblePositionManager: nonfungiblePositionManager.address,
    CandlInterfaceMulticall: candlInterfaceMulticall.address,
    CandlInterfaceMulticallV2: candlInterfaceMulticallV2.address,
  }

  fs.writeFileSync(`./deployments/${networkName}.json`, JSON.stringify(contracts, null, 2))
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
