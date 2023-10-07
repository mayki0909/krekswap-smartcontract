import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import 'dotenv/config'

const config: HardhatUserConfig = {
  solidity: "0.8.18",
  defaultNetwork: 'localhost',
  networks: {
    localhost: {
      url: process.env.LOCALHOST_URL,
      accounts: [`${process.env.LOCALHOST_PRIVATE_KEY}`]
    },
    mumbai: {
      url: `${process.env.MUMBAI_URL}`,
      chainId: 80001,
      accounts: [`${process.env.MUMBAI_PRIVATE_KEY}`]
    },
    polygon: {
      url: `${process.env.POLYGON_URL}`,
      chainId: 137,
      accounts: [`${process.env.POLYGON_PRIVATE_KEY}`]
    }
  }
};

export default config;
