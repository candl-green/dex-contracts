import { BigNumber } from 'ethers'
import { ethers } from 'hardhat'
import { MockTimeCandlV3Pool } from '../../typechain-types/contracts/test/MockTimeCandlV3Pool'
import { TestERC20 } from '../../typechain-types/contracts/test/TestERC20'
import { CandlV3Factory } from '../../typechain-types/contracts/CandlV3Factory'
import { CandlV3PoolDeployer } from '../../typechain-types/contracts/CandlV3PoolDeployer'
import { TestCandlV3Callee } from '../../typechain-types/contracts/test/TestCandlV3Callee'
import { TestCandlV3Router } from '../../typechain-types/contracts/test/TestCandlV3Router'
import { MockTimeCandlV3PoolDeployer } from '../../typechain-types/contracts/test/MockTimeCandlV3PoolDeployer'
import CandlV3LmPoolArtifact from '@candl/v3-lm-pool/artifacts/contracts/CandlV3LmPool.sol/CandlV3LmPool.json'

import { Fixture } from 'ethereum-waffle'

interface FactoryFixture {
  factory: CandlV3Factory
}

interface DeployerFixture {
  deployer: CandlV3PoolDeployer
}

async function factoryFixture(): Promise<FactoryFixture> {
  const { deployer } = await deployerFixture()
  const factoryFactory = await ethers.getContractFactory('CandlV3Factory')
  const factory = (await factoryFactory.deploy(deployer.address)) as CandlV3Factory
  return { factory }
}
async function deployerFixture(): Promise<DeployerFixture> {
  const deployerFactory = await ethers.getContractFactory('CandlV3PoolDeployer')
  const deployer = (await deployerFactory.deploy()) as CandlV3PoolDeployer
  return { deployer }
}

interface TokensFixture {
  token0: TestERC20
  token1: TestERC20
  token2: TestERC20
}

async function tokensFixture(): Promise<TokensFixture> {
  const tokenFactory = await ethers.getContractFactory('TestERC20')
  const tokenA = (await tokenFactory.deploy(BigNumber.from(2).pow(255))) as TestERC20
  const tokenB = (await tokenFactory.deploy(BigNumber.from(2).pow(255))) as TestERC20
  const tokenC = (await tokenFactory.deploy(BigNumber.from(2).pow(255))) as TestERC20

  const [token0, token1, token2] = [tokenA, tokenB, tokenC].sort((tokenA, tokenB) =>
    tokenA.address.toLowerCase() < tokenB.address.toLowerCase() ? -1 : 1
  )

  return { token0, token1, token2 }
}

type TokensAndFactoryFixture = FactoryFixture & TokensFixture

interface PoolFixture extends TokensAndFactoryFixture {
  swapTargetCallee: TestCandlV3Callee
  swapTargetRouter: TestCandlV3Router
  createPool(
    fee: number,
    tickSpacing: number,
    firstToken?: TestERC20,
    secondToken?: TestERC20
  ): Promise<MockTimeCandlV3Pool>
}

// Monday, October 5, 2020 9:00:00 AM GMT-05:00
export const TEST_POOL_START_TIME = 1601906400

export const poolFixture: Fixture<PoolFixture> = async function (): Promise<PoolFixture> {
  const { factory } = await factoryFixture()
  const { token0, token1, token2 } = await tokensFixture()

  const MockTimeCandlV3PoolDeployerFactory = await ethers.getContractFactory('MockTimeCandlV3PoolDeployer')
  const MockTimeCandlV3PoolFactory = await ethers.getContractFactory('MockTimeCandlV3Pool')

  const calleeContractFactory = await ethers.getContractFactory('TestCandlV3Callee')
  const routerContractFactory = await ethers.getContractFactory('TestCandlV3Router')

  const swapTargetCallee = (await calleeContractFactory.deploy()) as TestCandlV3Callee
  const swapTargetRouter = (await routerContractFactory.deploy()) as TestCandlV3Router

  const CandlV3LmPoolFactory = await ethers.getContractFactoryFromArtifact(CandlV3LmPoolArtifact)

  return {
    token0,
    token1,
    token2,
    factory,
    swapTargetCallee,
    swapTargetRouter,
    createPool: async (fee, tickSpacing, firstToken = token0, secondToken = token1) => {
      const mockTimePoolDeployer =
        (await MockTimeCandlV3PoolDeployerFactory.deploy()) as MockTimeCandlV3PoolDeployer
      const tx = await mockTimePoolDeployer.deploy(
        factory.address,
        firstToken.address,
        secondToken.address,
        fee,
        tickSpacing
      )

      const receipt = await tx.wait()
      const poolAddress = receipt.events?.[0].args?.pool as string

      const mockTimeCandlV3Pool = MockTimeCandlV3PoolFactory.attach(poolAddress) as MockTimeCandlV3Pool

      await (
        await factory.setLmPool(
          poolAddress,
          (
            await CandlV3LmPoolFactory.deploy(
              poolAddress,
              ethers.constants.AddressZero,
              Math.floor(Date.now() / 1000)
            )
          ).address
        )
      ).wait()

      return mockTimeCandlV3Pool
    },
  }
}
