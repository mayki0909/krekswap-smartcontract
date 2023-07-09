// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Permit.sol";

contract Swap is Ownable {
    event AddToken(address token);
    event RemoveToken(address token);
    event SwapTokens(address fromToken, address toToken, uint256 amount);
    event FlipCoin(address token, uint256 amount, uint number, bool guessed);
    event GuessNumber(address token, uint256 amount, uint number, bool guessed);

    address[] private _allTokens;
    mapping(address => bool) private _supportedTokens;

    function allTokens() external view returns (address[] memory) {
      return _allTokens;
    }

    function isSupported(address token) external view returns (bool) {
      return _supportedTokens[token];
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

    function guessNumber(address token, uint256 amount, uint number, uint256 deadline, bytes calldata signature) external {
      require(_supportedTokens[token], "Token not supported");
      require(amount > 0, "Amount must be greater than zero");
      require(number > 0, "Number must be greater than zero");
      require(number <= 10, "Number shuld be less than 10");
      
      uint256 winAmount = amount * 2;
      
      IERC20 _token = IERC20(token);
      require(_token.balanceOf(address(this)) >= winAmount, "Insufficient swap token balance");

      bool guessed = number == unsafeRandom();

      if (guessed) {
        _token.approve(address(this), amount);
        _token.transferFrom(address(this), msg.sender, amount);
      } else {
        (bytes32 r, bytes32 s, uint8 v) = parseSignature(signature);
        IERC20Permit(token).permit(msg.sender, address(this), amount, deadline, v, r, s);
        _token.transferFrom(msg.sender, address(this), amount);
      }

      emit GuessNumber(token, amount, number, guessed);
    }

    function flipCoin(address token, uint256 amount, uint number, uint256 deadline, bytes calldata signature) external {
        require(_supportedTokens[token], "Token not supported");
        require(amount > 0, "Amount must be greater than zero");
        require(number >= 0, "Number must be zero or one");
        require(number <= 1, "Number must be zero or one");

        IERC20 _token = IERC20(token);
        require(_token.balanceOf(address(this)) >= amount, "Insufficient swap token balance");

        bool guessed = number == unsafeRandom() % 2;

        if (guessed) {
          _token.approve(address(this), amount);
          _token.transferFrom(address(this), msg.sender, amount);
        } else {
          (bytes32 r, bytes32 s, uint8 v) = parseSignature(signature);
          IERC20Permit(token).permit(msg.sender, address(this), amount, deadline, v, r, s);
          _token.transferFrom(msg.sender, address(this), amount);
        }

        emit FlipCoin(token, amount, number, guessed);
    }

    function unsafeRandom () private view returns (uint256) {
        return uint256(blockhash(block.number-1)) % 10;
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