// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity >=0.5.0;

import './pool/ICandlV3PoolImmutables.sol';
import './pool/ICandlV3PoolState.sol';
import './pool/ICandlV3PoolDerivedState.sol';
import './pool/ICandlV3PoolActions.sol';
import './pool/ICandlV3PoolOwnerActions.sol';
import './pool/ICandlV3PoolEvents.sol';

/// @title The interface for a CandlSwap V3 Pool
/// @notice A CandlSwap pool facilitates swapping and automated market making between any two assets that strictly conform
/// to the ERC20 specification
/// @dev The pool interface is broken up into many smaller pieces
interface ICandlV3Pool is
    ICandlV3PoolImmutables,
    ICandlV3PoolState,
    ICandlV3PoolDerivedState,
    ICandlV3PoolActions,
    ICandlV3PoolOwnerActions,
    ICandlV3PoolEvents
{

}
