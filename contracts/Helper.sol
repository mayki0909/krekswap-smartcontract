// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Helper is Ownable {

  struct TokenBalance {
    address token;
    uint256 balance;
  }

  address[] private _allTokens;
  mapping(address => bool) private _supportedTokens;

  event AddToken(address token);
  event RemoveToken(address token);

  function isSupported(address token) public view returns (bool) {
    return _supportedTokens[token];
  }

  function isActive(address token) public view returns (bool) {
    return _supportedTokens[token] == true;
  }

  function allTokens() public view returns (address[] memory) {
    return _allTokens;
  }

  function allSupported() public view returns (address[] memory) {
    address[] memory allSupportedTemp = new address[](_allTokens.length);
    uint256 supportedCount = 0;
    
    // Loop to check supported coins
    for (uint256 i = 0; i < _allTokens.length; i++) {
      address currentAddress = _allTokens[i];
      if (this.isActive(currentAddress)) {
        allSupportedTemp[i] = currentAddress;
        supportedCount++;
      }
    }

    // Loop to resize array not all coins will always be supported
    // We could use storage but is payable
    address[] memory _allSupported = new address[](supportedCount);
    for (uint256 i = 0; i < _allTokens.length; i++) {
      _allSupported[i] = allSupportedTemp[i];
    }

    return _allSupported;
  }

  function allSupportedBalances() public view returns (TokenBalance [] memory) {
    address[] memory _allSupported = this.allSupported();
    TokenBalance[] memory _allSupportedBalances = new TokenBalance[](_allSupported.length);

    for (uint256 i = 0; i < _allSupported.length; i++) {
      address _tokenAddress = _allSupported[i];
      IERC20 _token = IERC20(_tokenAddress);
      uint _tokenBalance = _token.balanceOf(address(this));

      _allSupportedBalances[i] = TokenBalance({
        token: _tokenAddress,
        balance: _tokenBalance
      });
    }

    return _allSupportedBalances;
  }

  function tokenBalance (address token) public view returns (TokenBalance memory) {
    IERC20 _token = IERC20(token);
    uint _tokenBalance = _token.balanceOf(address(this));

    return TokenBalance({
      token: token,
      balance: _tokenBalance
    });
  }

  function addToken(address tokenAddress) external onlyOwner {
    _allTokens.push(tokenAddress);
    _supportedTokens[tokenAddress] = true;

    emit AddToken(tokenAddress);
  }

  function removeToken(address tokenAddress) external onlyOwner {
    _supportedTokens[tokenAddress] = false;

    emit RemoveToken(tokenAddress);
  }

  function parseSignature(bytes memory signature) public pure returns (bytes32 r, bytes32 s, uint8 v) {
    require(signature.length == 65, "Invalid signature length");

    assembly {
        // Extract r by copying the first 32 bytes from the signature
        r := mload(add(signature, 32))

        // Extract s by copying the next 32 bytes from the signature
        s := mload(add(signature, 64))

        // Extract v by masking the last byte (the recovery id)
        v := byte(0, mload(add(signature, 96)))
    }
  }
}