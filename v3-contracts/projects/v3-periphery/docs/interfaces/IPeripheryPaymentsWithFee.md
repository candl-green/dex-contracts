# Solidity API

## IPeripheryPaymentsWithFee

Functions to ease deposits and withdrawals of ETH

### unwrapWETH9WithFee

```solidity
function unwrapWETH9WithFee(uint256 amountMinimum, address recipient, uint256 feeBips, address feeRecipient) external payable
```

Unwraps the contract's WETH9 balance and sends it to recipient as ETH, with a percentage between
0 (exclusive), and 1 (inclusive) going to feeRecipient

_The amountMinimum parameter prevents malicious contracts from stealing WETH9 from users._

### sweepTokenWithFee

```solidity
function sweepTokenWithFee(address token, uint256 amountMinimum, address recipient, uint256 feeBips, address feeRecipient) external payable
```

Transfers the full amount of a token held by this contract to recipient, with a percentage between
0 (exclusive) and 1 (inclusive) going to feeRecipient

_The amountMinimum parameter prevents malicious contracts from stealing the token from users_

