// SPDX-License-Identifier: MIT
pragma solidity =0.7.6;

interface IHyperPoolFactory {
  function emergencyRecoveryAddress() external view returns (address);
  function feeAddress() external view returns (address);
  function getHyperPoolFee(address hyperPoolAddress, address ownerAddress) external view returns (uint256);
  function publishHyperPool(address nftAddress) external;
  function setHyperPoolOwner(address previousOwner, address newOwner) external;
}