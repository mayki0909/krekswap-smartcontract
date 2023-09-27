// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Permit.sol";

import "./Helper.sol";

contract Casino is Ownable, Helper {

  event FlipCoin(address token, uint256 amount, uint number, bool guessed);
  event GuessNumber(address token, uint256 amount, uint number, bool guessed);
  
  function guessNumber(address token, uint256 amount, uint number, uint256 deadline, bytes calldata signature) external {
    // require(_supportedTokens[token], "Token not supported");
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
      // require(_supportedTokens[token], "Token not supported");
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

}  