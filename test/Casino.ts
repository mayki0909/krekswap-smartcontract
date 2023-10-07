import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";
import { Signer } from "ethers";
import { Casino, Token } from "../typechain-types";
import { createPermitSignature } from "./utils/Permit";

describe('Casino', function () {
  let token1: Token;
  let token2: Token;

  let casino: Casino;

  let owner: Signer;
  let user1: Signer;
  let user2: Signer;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();
    
    const Token = await ethers.getContractFactory("Token")
    token1 = await Token.deploy("TOKEN1", "TKN1", 1000)
    await token1.waitForDeployment()
    token2 = await Token.deploy("TOKEN2", "TKN2", 1000)
    await token2.waitForDeployment()

    const Casino = await ethers.getContractFactory("Casino")
    casino = await Casino.deploy()
    await casino.waitForDeployment()

  })

  it('should flip a coin', async () => {
    const amount = BigInt(100);
    const number = 0; // 0 for heads, 1 for tails

    const user1Address = await user1.getAddress()
    const token1Address = await token1.getAddress()
    const casinoAddress = await casino.getAddress()

    await token1.connect(owner).mint(user1Address, amount)
    await token1.connect(owner).mint(casinoAddress, amount)
    await casino.addToken(token1Address)

    const userBalanceBefore = await token1.balanceOf(user1Address)
    const contractBalanceBefore = await token1.balanceOf(casinoAddress)
    expect(amount).to.equal(userBalanceBefore)
    expect(amount).to.equal(contractBalanceBefore)


    const deadline = BigInt(Math.floor(Date.now() / 1000) + 4200)
    const signature = await createPermitSignature(token1, user1, casinoAddress, amount, deadline)

    await expect(casino.connect(user1).flipCoin(token1Address, amount, number, deadline, signature))
          .to.emit(casino, 'FlipCoin')
          .withArgs(token1Address, amount, number, anyValue)
          
          
    const userBalanceAfter = await token1.balanceOf(user1Address)
    const contractBalanceAfter = await token1.balanceOf(casinoAddress)
    if (userBalanceAfter == BigInt(0)) {
      // User lost
      expect(userBalanceBefore - amount).to.equal(userBalanceAfter)
      expect(contractBalanceBefore + amount).to.equal(contractBalanceAfter)
    } else {
      // User won
      expect(userBalanceBefore + amount).to.equal(userBalanceAfter)
      expect(contractBalanceBefore - amount).to.equal(contractBalanceAfter)
    }
  })

  it('should guess a number', async () => {

  })
})