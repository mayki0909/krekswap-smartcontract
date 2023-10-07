# KrekSwap Smart contracts
The project is made with the desire to learn the Solidity language and its development with a strong focus on testing. In the next step of the project I will create simple frontend interface to interact with the Smart Contracts.

Many friends wanted to own their own crypto currency coin so I wanted to make them dream came true. This project connects fun and learning.

## Initializing project
After cloning the project, you need to run in root folder of the project.
```shell
yarn install
``` 
## Preparing .env
Then you need to create `.env` file with following properties

```
LOCALHOST_URL=http://127.0.0.1:8545 # Default
LOCALHOST_PRIVATE_KEY=

MUMBAI_URL=https://rpc-mumbai.maticvigil.com # Default, you can change it to your provider
MUMBAI_PRIVATE_KEY=

POLYGON_URL=https://polygon-rpc.com/ # Default, you can change it to your provider
POLYGON_PRIVATE_KEY=
```
## Compiling contracts
To compile writen contracts run the following command
```shell
npx hardhat compile
```

## Testing
To run all tests in test file run comand
```shell
npx hardhat test
```
If you want to see coverage of tests run
```shell
npx hardhat coverage
```

## Local node
If you want to test your scripts and deploys you can set up local node with command
```shell
npx hardhat node
```

## Deploying contracts
If you leave `--network` flag then the default network is localhost node.
To deploy smart contract you can run following commands:

`Token`:
```shell 
npx hardhat run deploy/token.ts --network mumbai
```

`Swap`:
```shell 
npx hardhat run deploy/swap.ts --network mumbai
```

`Casino`:
```shell 
npx hardhat run deploy/Casino.ts --network mumbai
```