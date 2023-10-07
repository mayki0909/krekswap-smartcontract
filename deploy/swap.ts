import { ethers } from "hardhat";

async function main() {
  const contract = await ethers.getContractFactory('Swap')
  const swap = await contract.deploy()
  await swap.waitForDeployment()

  const address = await swap.getAddress()
  console.log(`Swap contract is deployed on address ${address}`)
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
