const hre = require("hardhat");
const fs = require("fs");

async function main() {

    // get the contract to deploy
    const NFTMarket = await hre.ethers.getContractFactory("KPMarket");
    const nftMarket = await NFTMarket.deploy();
    await nftMarket.deployed();
    console.log("nftMarket address:", nftMarket.address);

    const NFT = await hre.ethers.getContractFactory("NFT");
    const nft = await NFT.deploy(nftMarket.address);
    await nft.deployed();
    console.log("nft address:", nft.address);

    let config = `
    export const nftmarketaddress = ${nftMarket.address}
    export const nftaddress = ${nft.address}`

    let data = JSON.stringify(config)
    fs.writeFileSync('consfig.js', JSON.parse(data))
}


main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
