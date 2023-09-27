// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Permit.sol";

import "./Helper.sol";

contract Swap is Ownable, Helper {
    struct TokenBalance {
      address token;
      uint256 balance;
    }

    event AddToken(address token);
    event RemoveToken(address token);
    event SwapTokens(address fromToken, address toToken, uint256 amount);

    address[] private _allTokens;
    mapping(address => bool) private _supportedTokens;

    function allTokens() external view returns (address[] memory) {
      return _allTokens;
    }

    function isSupported(address token) external view returns (bool) {
      return _supportedTokens[token];
    }

    function allSupported() external view returns (address[] memory) {
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

    function tokenBalance (address token) external view returns (TokenBalance memory) {
      IERC20 _token = IERC20(token);
      uint _tokenBalance = _token.balanceOf(address(this));

      return TokenBalance({
        token: token,
        balance: _tokenBalance
      });
    }

    function allSupportedBalances() external view returns (TokenBalance [] memory) {
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

    function isActive(address token) external view returns (bool) {
      return _supportedTokens[token] == true;
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

    function swapTokens(address fromTokenAddress, address toTokenAddress, uint256 amount, uint256 deadline, bytes calldata signature) external {
      require(_supportedTokens[fromTokenAddress] && _supportedTokens[toTokenAddress], "Tokens not supported");
      require(amount > 0, "Amount must be greater than zero");

      IERC20 fromToken = IERC20(fromTokenAddress); 
      IERC20 toToken = IERC20(toTokenAddress);

      // require(fromToken.allowance(msg.sender, address(this)) >= amount, "User need to approve contract before swap");
      require(fromToken.balanceOf(msg.sender) >= amount, "Insufficient token balance");
      require(toToken.balanceOf(address(this)) >= amount, "Insufficient swap token balance");


      // Permit transfer
      (bytes32 r, bytes32 s, uint8 v) = parseSignature(signature);
      IERC20Permit(fromTokenAddress).permit(msg.sender, address(this), amount, deadline, v, r, s);
      
      // From user to contract
      fromToken.transferFrom(msg.sender, address(this), amount);

      // From contract to user
      toToken.approve(address(this), amount);
      toToken.transferFrom(address(this), msg.sender, amount);

      emit SwapTokens(fromTokenAddress, toTokenAddress, amount);
    }
}