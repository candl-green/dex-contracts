// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

interface ICandlStableSwapLPFactory {
    function createSwapLP(
        address _tokenA,
        address _tokenB,
        address _tokenC,
        address _minter
    ) external returns (address);
}
