const hre = require("hardhat");
const fs = require("fs");

async function main() {

    const Token = await ethers.getContractFactory("Token");
    const token = await Token.deploy("Mariia Paintz Token", "MARIPAINTZ", 1000000000);
    await token.deployed();
    console.log("Token deployed to: ", token.address);
  
    const Vendor = await ethers.getContractFactory("Vendor");
    const vendor = await Vendor.deploy(token.address);
    await vendor.deployed();
    console.log("Vendor deployed to: ", vendor.address);

    const NFTMarket = await hre.ethers.getContractFactory("KPMarket");
    const nftMarket = await NFTMarket.deploy();
    await nftMarket.deployed();
    console.log("NFT Market address: ", nftMarket.address);

    const NFT = await hre.ethers.getContractFactory("NFT");
    const nft = await NFT.deploy(nftMarket.address);
    await nft.deployed();
    console.log("NFT address: ", nft.address);

    const AuctionFactory = await hre.ethers.getContractFactory("AuctionFactory");
    const auctionFactory = await AuctionFactory.deploy();
    await auctionFactory.deployed();
    console.log("Auction Factory address:", auctionFactory.address);

    let config = `
    export const tokenaddress = ${token.address}
    export const vendoraddress = ${vendor.address}
    export const nftmarketaddress = ${nftMarket.address}
    export const nftaddress = ${nft.address}
    export const auctionfactoryaddress = ${auctionFactory.address}`

    let data = JSON.stringify(config)
    fs.writeFileSync('config.js', JSON.parse(data))
}


main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
