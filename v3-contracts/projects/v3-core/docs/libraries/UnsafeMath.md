# Solidity API

## UnsafeMath

Contains methods that perform common math functions but do not do any overflow or underflow checks

### divRoundingUp

```solidity
function divRoundingUp(uint256 x, uint256 y) internal pure returns (uint256 z)
```

Returns ceil(x / y)

_division by 0 has unspecified behavior, and must be checked externally_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| x | uint256 | The dividend |
| y | uint256 | The divisor |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| z | uint256 | The quotient, ceil(x / y) |

