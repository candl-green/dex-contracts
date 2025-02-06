// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const { ethers } = require("hardhat");

async function main() {
  // const logic = '0x3FC1Acd9B3d2010792DFE33b420ff073f2932522';
  // // const admin = '0x99043BE6678C008eB8f6402fd371eb406E0a1644'; // main
  // const admin = '0x3e6ae6cDd913B5B71aF363908bC0F94B2cA1b859'; // test
  // // const data = "0x8129fc1c" // initialize
  // const data = "0x8129fc1c"
  
  // const test = await ethers.getContractFactory("TransparentUpgradeableProxy");
  // const res = await test.deploy(logic, admin, data);
  // await res.deployed();
  // console.log("proxy address: ", res.address);

  
  // const admin = '0xc139D6223040a3435a1112A96f5666ba57F02DDa' // mumbai

  
  // const Admin = await ethers.getContractFactory("ProxyAdmin");
  // const admin = await Admin.deploy();
  // await admin.deployed()
  // console.log("admin address: ", admin.address)
  const admin = '0xDF390B83FcCc4B697cac66B74753dCFdec4f445a'

  const Marketplace = await ethers.getContractFactory("Marketplace");
  const marketplace = await Marketplace.deploy();
  await marketplace.deployed()
  console.log("marketplace address: ", marketplace.address)

  const MarketplaceProxy = await ethers.getContractFactory("TransparentUpgradeableProxy");
  const marketplaceProxy = await MarketplaceProxy.deploy(marketplace.address, admin, '0x8129fc1c');
  await marketplaceProxy.deployed()
  console.log("marketplace proxy address: ", marketplaceProxy.address)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
