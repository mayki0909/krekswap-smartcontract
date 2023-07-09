import { expect } from "chai";
import { ethers } from "hardhat";
import { Signer, parseEther, verifyTypedData } from "ethers";
import { Token } from "../typechain-types";

describe('Token', function () {
  let token: Token;
  let owner: Signer;
  let user1: Signer;
  let user2: Signer;

  const name = "Token";
  const symbol = "TKN";
  const initialSupply = parseEther('1000')


  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("Token");
    token = await Token.deploy(name, symbol, initialSupply) as Token;
    await token.waitForDeployment()
  });

  it("should have correct name, symbol, and initial supply", async function () {
    expect(await token.name()).to.equal(name);
    expect(await token.symbol()).to.equal(symbol);
    expect(await token.totalSupply()).to.equal(initialSupply);
  });

  it("should mint tokens", async function () {
    const amountToMint = parseEther("100");
    await token.connect(owner).mint(await user1.getAddress(), amountToMint);

    expect(await token.balanceOf(await user1.getAddress())).to.equal(amountToMint);
  });

  it("should not allow minting by non-owner", async function () {
    const amountToMint = parseEther("100");
    await expect(
      token.connect(user1).mint(await user2.getAddress(), amountToMint)
    ).to.be.revertedWith("Ownable: caller is not the owner");

    expect(await token.balanceOf(await user2.getAddress())).to.equal(0);
  });

  it("should burn tokens", async function () {
    const initialBalance = await token.balanceOf(await owner.getAddress());
    const amountToBurn = parseEther("100");

    await token.connect(owner).burn(amountToBurn);

    const finalBalance = await token.balanceOf(await owner.getAddress());
    expect(finalBalance).to.equal(initialBalance - amountToBurn);
  });

  it("permit", async function () {
    const address1 = await user1.getAddress()
    const address2 = await user2.getAddress()

    const eip712 = await token.eip712Domain()
    //0: bytes1: fields 0x0f
    //1: string: name token
    //2: string: version 1
    //3: uint256: chainId 1
    //4: address: verifyingContract 0xd9145CCE52D386f254917e481eB44e9943F39138
    //5: bytes32: salt 0x0000000000000000000000000000000000000000000000000000000000000000
    //6:  uint256[]: extensions
    
    const name = eip712[0]
    const version = eip712[2]
    const chainId = eip712[3]
    const verifyingContract = eip712[4]
    const nonce = await token.nonces(address1)
    const deadline = '2000000000'
    const value = 100

    const domain = { name, version, chainId, verifyingContract }
    const types = {
      Permit: [{
          name: "owner",
          type: "address"
        },
        {
          name: "spender",
          type: "address"
        },
        {
          name: "value",
          type: "uint256"
        },
        {
          name: "nonce",
          type: "uint256"
        },
        {
          name: "deadline",
          type: "uint256"
        },
      ],
    }
    const values = { owner: address1, spender: address2, value, nonce, deadline }

    const signature = await user1.signTypedData(domain, types, values)
    const recovered = await verifyTypedData(domain, types, values, signature)

    expect(recovered).to.equal(address1)
  })
})

