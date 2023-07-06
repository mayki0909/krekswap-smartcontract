import { expect } from "chai";
import { ethers } from "hardhat";
import { Signer, parseEther } from "ethers";
import { Token } from "../typechain-types";

describe('Token', function () {
  let token: Token;
  let owner: Signer;
  let addr1: Signer;
  let addr2: Signer;

  const name = "Token";
  const symbol = "TKN";
  const initialSupply = parseEther('1000')


  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("Token");
    token = await Token.deploy(name, symbol, initialSupply) as Token;
    await token.waitForDeployment()

    // console.log("Token deployed to:", await token.getAddress());
  });

  it("should have correct name, symbol, and initial supply", async function () {
    expect(await token.name()).to.equal(name);
    expect(await token.symbol()).to.equal(symbol);
    expect(await token.totalSupply()).to.equal(initialSupply);
  });

  it("should mint tokens", async function () {
    const amountToMint = parseEther("100");
    await token.connect(owner).mint(await addr1.getAddress(), amountToMint);

    expect(await token.balanceOf(await addr1.getAddress())).to.equal(amountToMint);
  });

  it("should not allow minting by non-owner", async function () {
    const amountToMint = parseEther("100");
    await expect(
      token.connect(addr1).mint(await addr2.getAddress(), amountToMint)
    ).to.be.revertedWith("Ownable: caller is not the owner");

    expect(await token.balanceOf(await addr2.getAddress())).to.equal(0);
  });

  it("should burn tokens", async function () {
    const initialBalance = await token.balanceOf(await owner.getAddress());
    const amountToBurn = parseEther("100");
    initialBalance

    await token.connect(owner).burn(amountToBurn);

    const finalBalance = await token.balanceOf(await owner.getAddress());
    expect(finalBalance).to.equal(initialBalance - amountToBurn);
  });
})