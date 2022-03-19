# NFT Mapketplace DApp

NFT Marketplace (for minting, buying and selling NFTs live with IPFS data hosting) onto Polygon as a layer2.   
- Setting up the DApp development environment
- Create a React app using the create-next-app utility to recompose the React library
- Compile and Deploy Smart Contracts to Blockchain with Hardhat functionality
- Implementing industry standard NFT smart contracts for DApps with the ERC721 OpenZeppelin Contracts
- IPFS data hosting with Infura Blockchain Suite Project Management
- Implementing an NFT Minting form on the front end to lock in Metadata and Files for the DApp
- Looping, iterating, and filtering through hash tables with Javascript and Solidity
- Modern Card Design and UI with Tailwind and CSS
- Hooking up a web3 provider to the Polygon and Ethereum network
- Running full unit testing with Chai

# Developer tools

- OpenZeppelin - a library for secure smartcontracts
- Hardhat - a development environment to compile, deploy, test, and debug your Ethereum software (can also use Truffle)
- Web3.js - a complete and compact library for interacting with the Ethereum Blockchain and its ecosystem (can also use ethers.js)
- Waffle - the most advanced framework for testing smart contracts (can also use Chai and Mocha)


# Running 
To run project you shold install this
```shell
https://hardhat.org/getting-started/
```

To run tests
```shell
npx hardhat test
```

To deploy to local network
```shell
npx hardhat node
npx hardhat run scripts/deploy.js --network localhost
```

To run on localhost
```shell
npm run start
```
or 
```shell
npm run build
npm run start
```

# Use stack

```shell
 1. Polygon blockchain (Polygon Mumbai)
 2. Infura (should be created a new project on Ethereum)
```
