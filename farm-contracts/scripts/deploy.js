const { parseUnits, parseEther } = require("ethers/lib/utils");
const { ethers, upgrades } = require("hardhat");

async function main() {
  const _startTime = (Math.floor(Date.now() / 1000) + 3600 * 10).toString()
  console.log("Start Time: ", _startTime)
  const config = {
    treasuryAddress: "0x871e800Af5a1515781Fec7D4858e6285a0C4Cd76",
    startTime: _startTime
  }
  // const weth = {
  //   address: '0x06c2e7C81798a00eCc4892829884A3797C06116B'
  // }
  // const candlToken = {
  //   address: '0x4815204D490F4300183E61A9C6b273D62191F7Cd'
  // }
  //   const candlMaster = {
  //     address: '0x17621fB81F1B35A70477eC7145d7bD25e1A1EC49'
  //   }
  // const xCandlToken = {
  //   address: '0xc8B2e27B0E00eA9b7Cb07411f95d63a6E0b55c2b'
  // }

  const USDC = await ethers.getContractFactory("MockERC20")
  const usdc = await USDC.deploy("USD Coin", "USDC", parseUnits("100000000000", 18))
  await usdc.deployed()
  console.log("USDC: ", usdc.address)

  // const USDT = await ethers.getContractFactory("MockERC20")
  // const usdt = await USDT.deploy("Tether USD", "USDT", parseUnits("100000000000", 18))
  // await usdt.deployed()
  // console.log("USDT: ", usdt.address)

  return

  const WrappedEther = await ethers.getContractFactory("WrappedEther")
  const weth = await WrappedEther.deploy()
  await weth.deployed()
  console.log("WETH: ", weth.address)

  const CandlToken = await ethers.getContractFactory("CandlToken");
  const candlToken = await CandlToken.deploy(
    ethers.utils.parseEther("2000000"), // max supply
    ethers.utils.parseEther("1000000"), // initial rate
    ethers.utils.parseEther("0.01"), // emission rate
    config.treasuryAddress // treasury address
  );
  await candlToken.deployed()
  console.log("CandlToken: ", candlToken.address)

  const xCandlToken = await ethers.getContractFactory("xCandlToken");
  const xCandlToken = await xCandlToken.deploy(
    candlToken.address // candl token address
  );
  await xCandlToken.deployed()
  console.log("xCandlToken: ", xCandlToken.address)

  const CandlMaster = await ethers.getContractFactory("CandlMaster");
  const candlMaster = await CandlMaster.deploy(
    candlToken.address, // candl token address
    config.startTime // start time
  );
  await candlMaster.deployed()
  console.log("CandlMaster: ", candlMaster.address)

  const NFTPoolFactory = await ethers.getContractFactory("NFTPoolFactory");
  const nftPoolFactory = await NFTPoolFactory.deploy(
    candlMaster.address, // master
    candlToken.address, // candl token
    xCandlToken.address // xCandl token
  );
  await nftPoolFactory.deployed()
  console.log("NFTPoolFactory: ", nftPoolFactory.address)

  const YieldBooster = await ethers.getContractFactory("YieldBooster");
  const yieldBooster = await YieldBooster.deploy(
    xCandlToken.address // xCandl token
  );
  await yieldBooster.deployed()
  console.log("YieldBooster: ", yieldBooster.address)

  const Dividends = await ethers.getContractFactory("Dividends");
  const dividends = await Dividends.deploy(
    xCandlToken.address, // xCandl token
    config.startTime // start time
  );
  await dividends.deployed()
  console.log("Dividends: ", dividends.address)

  const Launchpad = await ethers.getContractFactory("Launchpad");
  const launchpad = await Launchpad.deploy(
    xCandlToken.address, // xCandl token
  );
  await launchpad.deployed()
  console.log("Launchpad: ", launchpad.address)

  const HyperPoolFactory = await ethers.getContractFactory("HyperPoolFactory");
  const hyperPoolFactory = await HyperPoolFactory.deploy(
    candlToken.address, 
    xCandlToken.address, 
    config.treasuryAddress, 
    config.treasuryAddress
  );
  await hyperPoolFactory.deployed()
  console.log("hyperPoolFactory: ", hyperPoolFactory.address)


  

  ///////////////////////////////////////////////////////////////
  //////////   Setting contracts
  //////////////////////////////////////////////////////////////
  await candlToken.updateAllocations(67,0)
  await candlToken.initializeEmissionStart(config.startTime)
  await candlToken.initializeMasterAddress(candlMaster.address)
  console.log("Setting 1 Pass")
  // await xCandlToken.updateRedeemSettings(50,100,3600,86400,50)   /// for test
  await xCandlToken.updateDividendsAddress(dividends.address)
  await xCandlToken.updateDeallocationFee(dividends.address, 50)
  await xCandlToken.updateDeallocationFee(yieldBooster.address, 50)
  await xCandlToken.updateDeallocationFee(launchpad.address, 50)

  console.log("Setting 2 Pass")
  await xCandlToken.updateTransferWhitelist(dividends.address, true)

  await candlMaster.setYieldBooster(yieldBooster.address)

  console.log("Setting 3 Pass")
  //////////////////////////////////////////
  /////// Manual Setting
  //////////////////////////////////////////

  // await dividends.enableDistributedToken(xCandlToken.address)
  // await dividends.enableDistributedToken(ETH/USDT address)
  // await dividends.addDividendsToPending(xCandlToken.address, amount)
  // await dividends.addDividendsToPending(ETH/USDT address, amount)

  // await candlMaster.add(NFTPool, allocpoint, update)

  // for each pools that you created just now
  // hyperPool.addRewards(amounttoken1, amounttoken2)
  // hyperPool.publish


  const FairAuction = await ethers.getContractFactory("FairAuction");
  const auction = await FairAuction.deploy(
    weth.address, // WETH address
    candlToken.address, // project token1
    ethers.constants.AddressZero, // project token2
    weth.address, // sale token
    config.startTime, // start time
    (Number(config.startTime) + 86400 * 10).toString(), // end time
    config.treasuryAddress, // treasury address
    parseUnits("300000", 18), // max tokens1 to distribute
    0, // max tokens2 to distribute
    parseUnits("0.2", 18), // min raise 
    parseUnits("0.5", 18), // max raise
    parseEther("0.2") // cap per wallet
  );
  await auction.deployed()
  console.log("FairAuction address: ", auction.address)
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
