const { expect } = require("chai");
const { ethers } = require("hardhat");
const {
    constants
} = require("@openzeppelin/test-helpers");

describe("AuctionFactory", () => {

    let nft;
    let market;
    let auctionInstance;
    let auctionFactory;

    let nftContractAddress;
    let marketAddress;
    let auctionAddress;
    let auctionFactoryAddress;

    let listingPrice;
    let endTime;
    let minIncrement;
    let directBuyPrice;
    let startPrice;
    let nftAddress;
    let tokenId;

    beforeEach(async () => {
        [creater, minter, buyer, auctionOwner, bidder1, bidder2, ...otherAccounts] = await ethers.getSigners();

        const Market = await ethers.getContractFactory('KPMarket');
        market = await Market.deploy();
        marketAddress = market.address;

        const NFT = await ethers.getContractFactory('NFT');
        nft = await NFT.deploy(marketAddress);
        nftContractAddress = nft.address;

        await market.setNFTContract(nftContractAddress);

        listingPrice = await market.listingPrice();

        const AuctionFactory = await ethers.getContractFactory('AuctionFactory');
        auctionFactory = await AuctionFactory.deploy();
        auctionFactoryAddress = auctionFactory.address;

        let blockNumBefore = await ethers.provider.getBlockNumber();
        let blockBefore = await ethers.provider.getBlock(blockNumBefore);
        let timestampBefore = blockBefore.timestamp;
        endTime = timestampBefore + 60 * 60 * 24; // 1 day
        minIncrement = ethers.utils.parseUnits('0.002', 'ether');
        directBuyPrice = ethers.utils.parseUnits('5', 'ether');
        startPrice = ethers.utils.parseUnits('0.02', 'ether');
        nftAddress = nftContractAddress;

        await nft.connect(auctionOwner).mintToken('https-p1');
        tokenId = 1;
        await nft.connect(auctionOwner).approve(auctionFactoryAddress, 1);
        await auctionFactory.connect(auctionOwner).createAuction(
            endTime,
            minIncrement,
            directBuyPrice,
            startPrice,
            nftAddress,
            tokenId
        );

        const[auctionAddress, isExist] = await auctionFactory.auctionsInfo(0);
        console.log(await auctionAddress)

        const Auction = await ethers.getContractFactory("Auction");
        auctionInstance = await Auction.attach(
            auctionAddress
        );

    });

    describe('Intercat with auction', async () => {
        describe('placeBid', async () => {
            it('Should place bids to the auction', async () => {
                await auctionInstance.connect(bidder1).placeBid(
                    { value: ethers.utils.parseUnits('0.02', 'ether') }
                );

                // await expect(auctionInstance.connect(bidder1).placeBid(
                //     { value: ethers.utils.parseUnits('0.02', 'ether') }
                // ))
                //     .to.be.revertedWith("Auction: the bidder cannot be the auction creator");

            });

        });

    });
});