import { abi as POOL_ABI } from '@candl/v3-core/artifacts/contracts/CandlV3Pool.sol/CandlV3Pool.json'
import { Contract, Wallet } from 'ethers'
import { ICandlV3Pool } from '../../typechain-types'

export default function poolAtAddress(address: string, wallet: Wallet): ICandlV3Pool {
  return new Contract(address, POOL_ABI, wallet) as ICandlV3Pool
}
