import { ethers } from "hardhat";

async function main() {
  const contract = await ethers.getContractFactory('Casino')
  const casino = await contract.deploy()
  await casino.waitForDeployment()

  const address = await casino.getAddress()
  console.log(`Casino contract is deployed on address ${address}`)
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});