const { ethers, network, run } = require("hardhat");

const main = async () => {
  // Compile contracts
  

  // Deploy Hash Test
  // const HashTest = await ethers.getContractFactory("HashTest");
  // const hashTest = await HashTest.deploy();
  // await hashTest.deployed();
  // console.log("hashTest deployed to:", hashTest.address);

  const config = {
    treasuryAddress: "0x871e800Af5a1515781Fec7D4858e6285a0C4Cd76",
    startTime: 1699394476
  }
  const weth = {
    address: "0x14229c0930C9792B39ECB08028A2784A016935aC"
  }

  const candlFactory = {
    address: "0x98EabdC49aF992b0422A2F72E23ea652AdF1b05F"
  }

  // // Deploy CandlFactory
  // console.log("Deploying CandlFactory..");
  // const CandlFactory = await ethers.getContractFactory("CandlFactory");
  // const candlFactory = await CandlFactory.deploy(
  //   config.treasuryAddress // fee to address
  // );
  // await candlFactory.deployed();
  // console.log("CandlFactory:", candlFactory.address);

  
  // Deploy CandlRouter
  console.log("Deploying CandlRouter..");
  const CandlRouter = await ethers.getContractFactory("CandlRouter");
  const candlRouter = await CandlRouter.deploy(
    candlFactory.address,  // factory
    weth.address   // weth
  );
  await candlRouter.deployed();
  console.log("CandlRouter:", candlRouter.address);


  const PositionHelper = await ethers.getContractFactory("PositionHelper");
  const positionHelper = await PositionHelper.deploy(
    candlRouter.address,  // router
    weth.address   // weth
  );
  await positionHelper.deployed();
  console.log("PositionHelper:", positionHelper.address);

};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
