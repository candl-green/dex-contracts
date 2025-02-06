const { ethers } = require('hardhat')
const PoolArtifact = require('../artifacts/contracts/CandlPair.sol/CandlPair.json')

const hash = ethers.utils.keccak256(PoolArtifact.bytecode)
console.log(hash)

