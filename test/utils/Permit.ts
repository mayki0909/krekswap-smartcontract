import { Signer, verifyTypedData } from "ethers";
import { Token } from "../../typechain-types";


export async function createPermitSignature (token: Token, owner: Signer, spender: string, value: bigint, deadline: bigint) {
  const eip712 = await token.eip712Domain()
  const domain = {
    name: eip712[1],
    version: eip712[2],
    chainId: eip712[3],
    verifyingContract: eip712[4]
  }
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
  const values = {
    owner: await owner.getAddress(),
    spender: spender,
    value, 
    nonce: await token.nonces(owner),
    deadline: deadline
  }

  const signature = await owner.signTypedData(domain, types, values)
  await verifyTypedData(domain, types, values, signature)

  return signature
}