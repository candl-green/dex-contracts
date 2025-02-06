import { ethers } from 'hardhat'
import CandlV3PoolArtifact from '../artifacts/contracts/CandlV3Pool.sol/CandlV3Pool.json'

const hash = ethers.utils.keccak256(CandlV3PoolArtifact.bytecode)
console.log(hash)
