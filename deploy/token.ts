import { ethers } from "hardhat";

async function main() {
  const name = 'Test token'
  const symbol = 'TKK'
  const initialSupply = 10000;

  const Token = await ethers.getContractFactory('Token');
  const token = await Token.deploy(name, symbol, initialSupply);

  await token.waitForDeployment()

  const totalSupply = await token.totalSupply()
  const address = await token.getAddress()

  console.log(
    `${name} (${symbol}) was deployed on address ${address} with an initialSupply ${totalSupply}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
