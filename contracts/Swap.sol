// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Permit.sol";

import "./Helper.sol";

contract Swap is Ownable, Helper {
    
    event SwapTokens(address fromToken, address toToken, uint256 amount);

    function swapTokens(address fromTokenAddress, address toTokenAddress, uint256 amount, uint256 deadline, bytes calldata signature) external {
      require(isSupported(fromTokenAddress) && isSupported(toTokenAddress), "Tokens not supported");
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