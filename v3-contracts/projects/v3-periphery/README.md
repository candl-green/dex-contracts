# CandlSwap V3 Periphery

This repository contains the periphery smart contracts for the CandlSwap V3 Protocol.
For the lower level core contracts, see the [v3-core](../v3-core/)
repository.

## Local deployment

In order to deploy this code to a local testnet, you should install the npm package
`@candl/v3-periphery`
and import bytecode imported from artifacts located at
`@candl/v3-periphery/artifacts/contracts/*/*.json`.
For example:

```typescript
import {
  abi as SWAP_ROUTER_ABI,
  bytecode as SWAP_ROUTER_BYTECODE,
} from '@candl/v3-periphery/artifacts/contracts/SwapRouter.sol/SwapRouter.json'

// deploy the bytecode
```

This will ensure that you are testing against the same bytecode that is deployed to
mainnet and public testnets, and all CandlSwap code will correctly interoperate with
your local deployment.

## Using solidity interfaces

The CandlSwap v3 periphery interfaces are available for import into solidity smart contracts
via the npm artifact `@candl/v3-periphery`, e.g.:

```solidity
import '@candl/v3-periphery/contracts/interfaces/ISwapRouter.sol';

contract MyContract {
  ISwapRouter router;

  function doSomethingWithSwapRouter() {
    // router.exactInput(...);
  }
}

```
