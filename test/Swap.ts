import { expect } from "chai";
import { ethers } from "hardhat";
import { Signer } from "ethers";
import { Swap, Token } from "../typechain-types";
import { createPermitSignature } from "./utils/Permit";

describe('Swap', function () {
  let token1: Token;
  let token2: Token;

  let swap: Swap;

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
    const currentTimeSeconds = Math.floor(Date.now() / 1000)
    const deadline = BigInt(currentTimeSeconds + 4200)
    const amount = BigInt(1000)

    const token1Address = await token1.getAddress()
    const token2Address = await token2.getAddress()
    const user1Address = await user1.getAddress()
    const swapAddress = await swap.getAddress()

    await swap.addToken(token1Address)
    await swap.addToken(token2Address)

    await token1.connect(owner).mint(user1Address, amount)
    await token2.connect(owner).mint(swapAddress, amount)

    expect(await token1.balanceOf(user1Address)).to.be.equal(amount)
    expect(await token2.balanceOf(user1Address)).to.be.equal(0)
    expect(await token1.balanceOf(swapAddress)).to.be.equal(0)
    expect(await token2.balanceOf(swapAddress)).to.be.equal(amount)

    const signature = await createPermitSignature(token1, user1, swapAddress, amount, deadline)
    await swap.connect(user1).swapTokens(token1Address, token2Address, amount, deadline, signature)

    expect(await token1.balanceOf(user1Address)).to.be.equal(0)
    expect(await token2.balanceOf(user1Address)).to.be.equal(amount)
    expect(await token1.balanceOf(swapAddress)).to.be.equal(amount)
    expect(await token2.balanceOf(swapAddress)).to.be.equal(0)
  })

  it('should get all supported tokens', async () => {
    expect(await swap.allSupported()).to.have.members([])

    const token1Address = await token1.getAddress()
    await swap.addToken(token1Address)

    expect(await swap.allSupported()).to.eql([token1Address])

    const token2Address = await token2.getAddress()
    await swap.addToken(token2Address)

    expect(await swap.allSupported()).to.eql([token1Address, token2Address])
  })

  it('should get all supported balances', async () => {
    expect(await swap.allSupportedBalances()).to.eql([])

    const token1Address = await token1.getAddress()
    await swap.addToken(token1Address)

    expect(await swap.allSupportedBalances()).to.eql([[token1Address, BigInt(0)]])

    const token2Address = await token2.getAddress()
    await swap.addToken(token2Address)

    expect(await swap.allSupportedBalances()).to.eql([
      [token1Address, BigInt(0)],
      [token2Address, BigInt(0)]
    ])

    const swapAddress = await swap.getAddress()
    await token1.connect(owner).mint(swapAddress, 1000)
    await token2.connect(owner).mint(swapAddress, 2000)

    expect(await swap.allSupportedBalances()).to.eql([
      [token1Address, BigInt(1000)],
      [token2Address, BigInt(2000)]
    ])
  })

  it('should get token balance', async () => {
    const token1Address = await token1.getAddress()
    const swapAddress = await swap.getAddress()

    expect(await swap.tokenBalance(token1Address)).to.eql([
      token1Address, BigInt(0)
    ])

    const amount = 1000
    await swap.addToken(token1Address)
    await token1.connect(owner).mint(swapAddress, amount)

    expect(await swap.tokenBalance(token1Address)).to.eql([
      token1Address, BigInt(amount)
    ])
  })
})