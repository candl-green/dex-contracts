// SPDX-License-Identifier: MIT
pragma solidity =0.7.6;
pragma abicoder v2;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/EnumerableSet.sol";

import "./HyperPool.sol";
import "./interfaces/IHyperPoolFactory.sol";
import "./interfaces/tokens/ICandlToken.sol";
import "./interfaces/tokens/IxCandlToken.sol";


contract HyperPoolFactory is Ownable, IHyperPoolFactory {
  using EnumerableSet for EnumerableSet.AddressSet;

  ICandlToken public candlToken; // CANDLToken contract's address
  IxCandlToken public xCandlToken; // xCandlToken contract's address

  EnumerableSet.AddressSet internal _hyperPools; // all hyper pools
  EnumerableSet.AddressSet private _publishedHyperPools; // all published hyper pools
  mapping(address => EnumerableSet.AddressSet) private _nftPoolPublishedHyperPools; // published hyper pools per NFTPool
  mapping(address => EnumerableSet.AddressSet) internal _ownerHyperPools; // hyper pools per owner

  uint256 public constant MAX_DEFAULT_FEE = 100; // (1%) max authorized default fee
  uint256 public defaultFee; // default fee for hyper pools (*1e2)
  address public override feeAddress; // to receive fees when defaultFee is set
  EnumerableSet.AddressSet internal _exemptedAddresses; // owners or hyper addresses exempted from default fee

  address public override emergencyRecoveryAddress; // to recover rewards from emergency closed hyper pools


  constructor(ICandlToken candlToken_, IxCandlToken xCandlToken_, address emergencyRecoveryAddress_, address feeAddress_){
    require(emergencyRecoveryAddress_ != address(0) && feeAddress_ != address(0), "invalid");

    candlToken = candlToken_;
    xCandlToken = xCandlToken_;
    emergencyRecoveryAddress = emergencyRecoveryAddress_;
    feeAddress = feeAddress_;
  }


  /********************************************/
  /****************** EVENTS ******************/
  /********************************************/

  event CreateHyperPool(address indexed hyperAddress, address owner, address nftPoolAddress, IERC20 rewardsToken1, IERC20 rewardsToken2, HyperPool.Settings settings);
  event PublishHyperPool(address hyperAddress);
  event SetDefaultFee(uint256 fee);
  event SetFeeAddress(address feeAddress);
  event SetEmergencyRecoveryAddress(address emergencyRecoveryAddress);
  event SetExemptedAddress(address exemptedAddress, bool isExempted);
  event SetHyperPoolOwner(address previousOwner, address newOwner);


  /***********************************************/
  /****************** MODIFIERS ******************/
  /***********************************************/

  modifier hyperPoolExists(address hyperPoolAddress) {
    require(_hyperPools.contains(hyperPoolAddress), "unknown hyperPool");
    _;
  }


  /**************************************************/
  /****************** PUBLIC VIEWS ******************/
  /**************************************************/

  /**
   * @dev Returns the number of hyperPools
   */
  function hyperPoolsLength() external view returns (uint256) {
    return _hyperPools.length();
  }

  /**
   * @dev Returns a hyperPool from its "index"
   */
  function getHyperPool(uint256 index) external view returns (address) {
    return _hyperPools.at(index);
  }

  /**
   * @dev Returns the number of published hyperPools
   */
  function publishedHyperPoolsLength() external view returns (uint256) {
    return _publishedHyperPools.length();
  }

  /**
   * @dev Returns a published hyperPool from its "index"
   */
  function getPublishedHyperPool(uint256 index) external view returns (address) {
    return _publishedHyperPools.at(index);
  }

  /**
   * @dev Returns the number of published hyperPools linked to "nftPoolAddress" NFTPool
   */
  function nftPoolPublishedHyperPoolsLength(address nftPoolAddress) external view returns (uint256) {
    return _nftPoolPublishedHyperPools[nftPoolAddress].length();
  }

  /**
   * @dev Returns a published hyperPool linked to "nftPoolAddress" from its "index"
   */
  function getNftPoolPublishedHyperPool(address nftPoolAddress, uint256 index) external view returns (address) {
    return _nftPoolPublishedHyperPools[nftPoolAddress].at(index);
  }

  /**
   * @dev Returns the number of hyperPools owned by "userAddress"
   */
  function ownerHyperPoolsLength(address userAddress) external view returns (uint256) {
    return _ownerHyperPools[userAddress].length();
  }

  /**
   * @dev Returns a hyperPool owned by "userAddress" from its "index"
   */
  function getOwnerHyperPool(address userAddress, uint256 index) external view returns (address) {
    return _ownerHyperPools[userAddress].at(index);
  }

  /**
   * @dev Returns the number of exemptedAddresses
   */
  function exemptedAddressesLength() external view returns (uint256) {
    return _exemptedAddresses.length();
  }

  /**
   * @dev Returns an exemptedAddress from its "index"
   */
  function getExemptedAddress(uint256 index) external view returns (address) {
    return _exemptedAddresses.at(index);
  }

  /**
   * @dev Returns if a given address is in exemptedAddresses
   */
  function isExemptedAddress(address checkedAddress) external view returns (bool) {
    return _exemptedAddresses.contains(checkedAddress);
  }

  /**
   * @dev Returns the fee for "hyperPoolAddress" address
   */
  function getHyperPoolFee(address hyperPoolAddress, address ownerAddress) external view override returns (uint256) {
    if(_exemptedAddresses.contains(hyperPoolAddress) || _exemptedAddresses.contains(ownerAddress)) {
      return 0;
    }
    return defaultFee;
  }


  /*****************************************************************/
  /******************  EXTERNAL PUBLIC FUNCTIONS  ******************/
  /*****************************************************************/

  /**
   * @dev Deploys a new Hyper Pool
   */
  function createHyperPool(
    address nftPoolAddress, IERC20 rewardsToken1, IERC20 rewardsToken2, HyperPool.Settings calldata settings
  ) external virtual returns (address hyperPool) {

    // Initialize new hyper pool
    hyperPool = address(
      new HyperPool(
        candlToken, xCandlToken, msg.sender, INFTPool(nftPoolAddress),
          rewardsToken1, rewardsToken2, settings
      )
    );

    // Add new hyper
    _hyperPools.add(hyperPool);
    _ownerHyperPools[msg.sender].add(hyperPool);

    emit CreateHyperPool(hyperPool, msg.sender, nftPoolAddress, rewardsToken1, rewardsToken2, settings);
  }

  /**
   * @dev Publish a Hyper Pool
   *
   * Must only be called by the Hyper Pool contract
   */
  function publishHyperPool(address nftAddress) external override hyperPoolExists(msg.sender) {
    _publishedHyperPools.add(msg.sender);

    _nftPoolPublishedHyperPools[nftAddress].add(msg.sender);

    emit PublishHyperPool(msg.sender);
  }

  /**
   * @dev Transfers a Hyper Pool's ownership
   *
   * Must only be called by the HyperPool contract
   */
  function setHyperPoolOwner(address previousOwner, address newOwner) external override hyperPoolExists(msg.sender) {
    require(_ownerHyperPools[previousOwner].remove(msg.sender), "invalid owner");
    _ownerHyperPools[newOwner].add(msg.sender);

    emit SetHyperPoolOwner(previousOwner, newOwner);
  }

  /**
   * @dev Set hyperPools default fee (when adding rewards)
   *
   * Must only be called by the owner
   */
  function setDefaultFee(uint256 newFee) external onlyOwner {
    require(newFee <= MAX_DEFAULT_FEE, "invalid amount");

    defaultFee = newFee;
    emit SetDefaultFee(newFee);
  }

  /**
   * @dev Set fee address
   *
   * Must only be called by the owner
   */
  function setFeeAddress(address feeAddress_) external onlyOwner {
    require(feeAddress_ != address(0), "zero address");

    feeAddress = feeAddress_;
    emit SetFeeAddress(feeAddress_);
  }

  /**
   * @dev Add or remove exemptedAddresses
   *
   * Must only be called by the owner
   */
  function setExemptedAddress(address exemptedAddress, bool isExempted) external onlyOwner {
    require(exemptedAddress != address(0), "zero address");

    if(isExempted) _exemptedAddresses.add(exemptedAddress);
    else _exemptedAddresses.remove(exemptedAddress);

    emit SetExemptedAddress(exemptedAddress, isExempted);
  }

  /**
   * @dev Set emergencyRecoveryAddress
   *
   * Must only be called by the owner
   */
  function setEmergencyRecoveryAddress(address emergencyRecoveryAddress_) external onlyOwner {
    require(emergencyRecoveryAddress_ != address(0), "zero address");

    emergencyRecoveryAddress = emergencyRecoveryAddress_;
    emit SetEmergencyRecoveryAddress(emergencyRecoveryAddress_);
  }


  /********************************************************/
  /****************** INTERNAL FUNCTIONS ******************/
  /********************************************************/

  /**
   * @dev Utility function to get the current block timestamp
   */
  function _currentBlockTimestamp() internal view virtual returns (uint256) {
    /* solhint-disable not-rely-on-time */
    return block.timestamp;
  }
}