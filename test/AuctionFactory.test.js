const { expect } = require("chai");
const { ethers } = require("hardhat");
const {
    constants
} = require("@openzeppelin/test-helpers");
const { abi } = require('../artifacts/contracts/Auction.sol/Auction.json');

describe("AuctionFactory", () => {

    let nft;
    let market;
    let auction1;
    let auction2;
    let auctionFactory;

    let nftContractAddress;
    let marketAddress;
    let auctionAddress1;
    let auctionAddress2;
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

        await market.setNFTContractAddress(nftContractAddress);

        listingPrice = await market.getListingPrice();

        const AuctionFactory = await ethers.getContractFactory('AuctionFactory');
        auctionFactory = await AuctionFactory.deploy();
        auctionFactoryAddress = auctionFactory.address;

    });

    describe('Intercat with auction factory', async () => {
        describe('createAuction', async () => {
            it('Should reverted if auction time less than 5 min', async () => {
                await nft.connect(auctionOwner).mintToken('https-p1');

                let blockNumBefore = await ethers.provider.getBlockNumber();
                let blockBefore = await ethers.provider.getBlock(blockNumBefore);
                let timestampBefore = blockBefore.timestamp;
                endTime = timestampBefore + 60 * 60 * 24; // 1 day
                minIncrement = ethers.utils.parseUnits('0.002', 'ether');
                directBuyPrice = ethers.utils.parseUnits('5', 'ether');
                startPrice = ethers.utils.parseUnits('0.02', 'ether');
                nftAddress = nftContractAddress;
                tokenId = 1;

                await nft.connect(auctionOwner).approve(auctionFactoryAddress, 1);

                // await expect(auctionFactory.connect(auctionOwner).createAuction(
                //     endTime,
                //     minIncrement,
                //     directBuyPrice,
                //     startPrice,
                //     nftAddress,
                //     tokenId
                // ))
                //     .to.be.revertedWith("Auction: end time must be greater than 5 minutes");

            });

            it('Should reverted if finish time of auction less than current time', async () => {
                await nft.connect(auctionOwner).mintToken('https-p1');

                let blockNumBefore = await ethers.provider.getBlockNumber();
                let blockBefore = await ethers.provider.getBlock(blockNumBefore);
                let timestampBefore = blockBefore.timestamp;
                endTime = timestampBefore + 60 * 60 * 24; // 1 day
                minIncrement = ethers.utils.parseUnits('0.002', 'ether');
                directBuyPrice = ethers.utils.parseUnits('5', 'ether');
                startPrice = ethers.utils.parseUnits('0.02', 'ether');
                nftAddress = nftContractAddress;
                tokenId = 1;

                await nft.connect(auctionOwner).approve(auctionFactoryAddress, 1);

                await expect(auctionFactory.connect(auctionOwner).createAuction(
                    endTime,
                    minIncrement,
                    directBuyPrice,
                    startPrice,
                    nftAddress,
                    tokenId
                ))
                    .to.be.revertedWith("Auction: finish time of auction cannot be less than current time");

            });

            it('Should reverted if min increment for bid annot be less than 0', async () => {
                await nft.connect(auctionOwner).mintToken('https-p1');

                let blockNumBefore = await ethers.provider.getBlockNumber();
                let blockBefore = await ethers.provider.getBlock(blockNumBefore);
                let timestampBefore = blockBefore.timestamp;
                endTime = timestampBefore + 60 * 60 * 24; // 1 day
                minIncrement = ethers.utils.parseUnits('0.002', 'ether');
                directBuyPrice = ethers.utils.parseUnits('5', 'ether');
                startPrice = ethers.utils.parseUnits('0.02', 'ether');
                nftAddress = nftContractAddress;
                tokenId = 1;

                await nft.connect(auctionOwner).approve(auctionFactoryAddress, 1);

                blockNumBefore = await ethers.provider.getBlockNumber();
                blockBefore = await ethers.provider.getBlock(blockNumBefore);
                timestampBefore = blockBefore.timestamp;
                endTime = timestampBefore + 60 * 60 * 24; // 1 day

                await expect(auctionFactory.connect(auctionOwner).createAuction(
                    endTime,
                    ethers.utils.parseUnits('0', 'ether'),
                    directBuyPrice,
                    startPrice,
                    nftAddress,
                    tokenId
                ))
                    .to.be.revertedWith("Auction: min increment for bid cannot be less than 0");

            });

            it('Should reverted if buy price less than 0', async () => {
                await nft.connect(auctionOwner).mintToken('https-p1');

                let blockNumBefore = await ethers.provider.getBlockNumber();
                let blockBefore = await ethers.provider.getBlock(blockNumBefore);
                let timestampBefore = blockBefore.timestamp;
                endTime = timestampBefore + 60 * 60 * 24; // 1 day
                minIncrement = ethers.utils.parseUnits('0.002', 'ether');
                directBuyPrice = ethers.utils.parseUnits('5', 'ether');
                startPrice = ethers.utils.parseUnits('0.02', 'ether');
                nftAddress = nftContractAddress;
                tokenId = 1;

                await nft.connect(auctionOwner).approve(auctionFactoryAddress, 1);

                blockNumBefore = await ethers.provider.getBlockNumber();
                blockBefore = await ethers.provider.getBlock(blockNumBefore);
                timestampBefore = blockBefore.timestamp;
                endTime = timestampBefore + 60 * 60 * 24; // 1 day

                await expect(auctionFactory.connect(auctionOwner).createAuction(
                    endTime,
                    minIncrement,
                    ethers.utils.parseUnits('0', 'ether'),
                    startPrice,
                    nftAddress,
                    tokenId
                ))
                    .to.be.revertedWith("Auction: buy price cannot be less than 0");

            });

            it('Should reverted if start price is smaller than direct buy price', async () => {
                await nft.connect(auctionOwner).mintToken('https-p1');

                let blockNumBefore = await ethers.provider.getBlockNumber();
                let blockBefore = await ethers.provider.getBlock(blockNumBefore);
                let timestampBefore = blockBefore.timestamp;
                endTime = timestampBefore + 60 * 60 * 24; // 1 day
                minIncrement = ethers.utils.parseUnits('0.002', 'ether');
                directBuyPrice = ethers.utils.parseUnits('5', 'ether');
                startPrice = ethers.utils.parseUnits('0.02', 'ether');
                nftAddress = nftContractAddress;
                tokenId = 1;

                await nft.connect(auctionOwner).approve(auctionFactoryAddress, 1);

                blockNumBefore = await ethers.provider.getBlockNumber();
                blockBefore = await ethers.provider.getBlock(blockNumBefore);
                timestampBefore = blockBefore.timestamp;
                endTime = timestampBefore + 60 * 60 * 24; // 1 day

                await expect(auctionFactory.connect(auctionOwner).createAuction(
                    endTime,
                    minIncrement,
                    directBuyPrice,
                    ethers.utils.parseUnits('5', 'ether'),
                    nftAddress,
                    tokenId
                ))
                    .to.be.revertedWith("Auction: start price is smaller than direct buy price");

            });

            it('Should reverted if NFT address cannot be ZERO_ADDRESS ', async () => {
                await nft.connect(auctionOwner).mintToken('https-p1');

                let blockNumBefore = await ethers.provider.getBlockNumber();
                let blockBefore = await ethers.provider.getBlock(blockNumBefore);
                let timestampBefore = blockBefore.timestamp;
                endTime = timestampBefore + 60 * 60 * 24; // 1 day
                minIncrement = ethers.utils.parseUnits('0.002', 'ether');
                directBuyPrice = ethers.utils.parseUnits('5', 'ether');
                startPrice = ethers.utils.parseUnits('0.02', 'ether');
                nftAddress = nftContractAddress;
                tokenId = 1;

                await nft.connect(auctionOwner).approve(auctionFactoryAddress, 1);

                blockNumBefore = await ethers.provider.getBlockNumber();
                blockBefore = await ethers.provider.getBlock(blockNumBefore);
                timestampBefore = blockBefore.timestamp;
                endTime = timestampBefore + 60 * 60 * 24; // 1 day

                await expect(auctionFactory.connect(auctionOwner).createAuction(
                    endTime,
                    minIncrement,
                    directBuyPrice,
                    startPrice,
                    constants.ZERO_ADDRESS,
                    tokenId
                ))
                    .to.be.revertedWith("Auction: NFT address can't be zero address");

            });

            it('Should reverted if token id cannot is less than 0', async () => {
                await nft.connect(auctionOwner).mintToken('https-p1');

                let blockNumBefore = await ethers.provider.getBlockNumber();
                let blockBefore = await ethers.provider.getBlock(blockNumBefore);
                let timestampBefore = blockBefore.timestamp;
                endTime = timestampBefore + 60 * 60 * 24; // 1 day
                minIncrement = ethers.utils.parseUnits('0.002', 'ether');
                directBuyPrice = ethers.utils.parseUnits('5', 'ether');
                startPrice = ethers.utils.parseUnits('0.02', 'ether');
                nftAddress = nftContractAddress;
                tokenId = 1;

                await nft.connect(auctionOwner).approve(auctionFactoryAddress, 1);

                blockNumBefore = await ethers.provider.getBlockNumber();
                blockBefore = await ethers.provider.getBlock(blockNumBefore);
                timestampBefore = blockBefore.timestamp;
                endTime = timestampBefore + 60 * 60 * 24; // 1 day

                await expect(auctionFactory.connect(auctionOwner).createAuction(
                    endTime,
                    minIncrement,
                    directBuyPrice,
                    startPrice,
                    nftAddress,
                    0
                ))
                    .to.be.revertedWith("Auction: token id cannot be less than 0");

            });

            it('Should sucessfully create auction', async () => {
                await nft.connect(auctionOwner).mintToken('https-p1');

                let blockNumBefore = await ethers.provider.getBlockNumber();
                let blockBefore = await ethers.provider.getBlock(blockNumBefore);
                let timestampBefore = blockBefore.timestamp;
                endTime = timestampBefore + 60 * 60 * 24; // 1 day
                minIncrement = ethers.utils.parseUnits('0.002', 'ether');
                directBuyPrice = ethers.utils.parseUnits('5', 'ether');
                startPrice = ethers.utils.parseUnits('0.02', 'ether');
                nftAddress = nftContractAddress;
                tokenId = 1;

                await nft.connect(auctionOwner).approve(auctionFactoryAddress, 1);

                blockNumBefore = await ethers.provider.getBlockNumber();
                blockBefore = await ethers.provider.getBlock(blockNumBefore);
                currentTime = blockBefore.timestamp + 1;

                await expect(auctionFactory.connect(auctionOwner).createAuction(
                    endTime,
                    minIncrement,
                    directBuyPrice,
                    startPrice,
                    nftAddress,
                    tokenId
                ))
                    .to.emit(auctionFactory, 'CreatedAuction')
                    .withArgs(auctionOwner.address,
                        currentTime,
                        endTime,
                        ethers.utils.parseUnits('0.002', 'ether'),
                        ethers.utils.parseUnits('5', 'ether'),
                        ethers.utils.parseUnits('0.02', 'ether'),
                        nftContractAddress,
                        1);

            });

        });

        describe('getAuctions', async () => {
            it('Should successfully get auctions', async () => {
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

                await nft.connect(buyer).mintToken('https-p2');
                await nft.connect(buyer).approve(auctionFactoryAddress, 2);
                tokenId = 2;
                await auctionFactory.connect(buyer).createAuction(
                    endTime,
                    minIncrement,
                    directBuyPrice,
                    startPrice,
                    nftAddress,
                    tokenId
                );

                let auctions = await auctionFactory.getAuctions();
                expect(auctions.length).to.be.equal(2);

            });

        });

        // describe('Should place bids to the auction', async () => {
        //     it('Should place bids to the auction', async () => {
        //     });
        // });

    });

});