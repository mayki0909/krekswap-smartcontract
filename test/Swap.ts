import { expect } from "chai";
import { ethers } from "hardhat";
import { Signer, parseEther } from "ethers";
import { Swap, Token } from "../typechain-types";

describe('Swap', function () {
  let token1: Token;
  let token2: Token;

  let swap: Swap;

  let owner: Signer;
  let addr1: Signer;
  let addr2: Signer;


  
  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    
    const Token = await ethers.getContractFactory("Token")
    token1 = await Token.deploy("TOKEN1", "TKN1", 1000)
    await token1.waitForDeployment()
    token2 = await Token.deploy("TOKEN2", "TKN2", 1000)
    await token2.waitForDeployment()

    const Swap = await ethers.getContractFactory("Swap")
    swap = await Swap.deploy()
    await swap.waitForDeployment()

  })

  it('should add a token', async function () {
    const token1Address = await token1.getAddress()

    expect(await swap.isSupported(token1Address)).to.be.false;
    expect(await swap.isActive(token1Address)).to.be.false;
    expect(await swap.allTokens()).to.not.include(token1Address);

    await swap.addToken(token1Address);

    expect(await swap.isSupported(token1Address)).to.be.true;
    expect(await swap.isActive(token1Address)).to.be.true;

    const allTokens = await swap.allTokens();
    expect(allTokens).to.include(token1Address);
  });

  it('should remove a token', async function () {
    const token1Address = await token1.getAddress()

    expect(await swap.isSupported(token1Address)).to.be.false;
    expect(await swap.isActive(token1Address)).to.be.false;
    expect(await swap.allTokens()).to.not.include(token1Address);

    await swap.addToken(token1Address);

    expect(await swap.isSupported(token1Address)).to.be.true;
    expect(await swap.isActive(token1Address)).to.be.true;
    expect(await swap.allTokens()).to.include(token1Address);

    await swap.removeToken(token1Address);

    expect(await swap.isSupported(token1Address)).to.be.false;
    expect(await swap.isActive(token1Address)).to.be.false;
    expect(await swap.allTokens()).to.include(token1Address);
  });

  it('should swap tokens', async () => {
    const amount = 1000
    const addr1Address = await addr1.getAddress()
    const swapAddress = await swap.getAddress()

    await swap.addToken(await token1.getAddress())
    await swap.addToken(await token2.getAddress())

    await token1.connect(owner).mint(addr1Address, amount)
    await token2.connect(owner).mint(swapAddress, amount)

    expect(await token1.balanceOf(addr1Address)).to.be.equal(amount)
    expect(await token2.balanceOf(addr1Address)).to.be.equal(0)
    expect(await token1.balanceOf(swapAddress)).to.be.equal(0)
    expect(await token2.balanceOf(swapAddress)).to.be.equal(amount)

    await token1.connect(addr1).approve(swap.getAddress(), amount)
    await swap.connect(addr1).swapTokens(await token1.getAddress(), await token2.getAddress(), amount)

    expect(await token1.balanceOf(addr1Address)).to.be.equal(0)
    expect(await token2.balanceOf(addr1Address)).to.be.equal(amount)
    expect(await token1.balanceOf(swapAddress)).to.be.equal(amount)
    expect(await token2.balanceOf(swapAddress)).to.be.equal(0)
  })

  describe('Events', async function () {

  })

})