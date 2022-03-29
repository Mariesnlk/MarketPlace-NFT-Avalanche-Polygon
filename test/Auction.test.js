const { expect } = require("chai");
const { ethers } = require("hardhat");


describe("Auction", () => {

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
    let ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

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

    describe('Intercat with auction', async () => {

        it('Should created auction', async () => {
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

            increaseTime = 60 * 60 * 24 * 2; // 2 days
            await ethers.provider.send("evm_increaseTime", [increaseTime]);
            await ethers.provider.send("evm_mine", [])

            // await expect(auctionFactory.connect(ZERO_ADDRESS).createAuction(
            //     endTime,
            //     minIncrement,
            //     directBuyPrice,
            //     startPrice,
            //     nftAddress,
            //     tokenId
            // ))
            //     .to.be.revertedWith("Auction: Creator of the auction can't be zero address");

            await expect(auctionFactory.connect(auctionOwner).createAuction(
                endTime,
                minIncrement,
                directBuyPrice,
                startPrice,
                nftAddress,
                tokenId
            ))
                .to.be.revertedWith("Auction: finish time of auction cannot be less than current time");

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
                .to.be.revertedWith("Auction: min increment for bid annot be less than 0");

            await expect(auctionFactory.connect(auctionOwner).createAuction(
                endTime,
                minIncrement,
                ethers.utils.parseUnits('0', 'ether'),
                startPrice,
                nftAddress,
                tokenId
            ))
                .to.be.revertedWith("Auction: buy price cannot be less than 0");

            await expect(auctionFactory.connect(auctionOwner).createAuction(
                endTime,
                minIncrement,
                directBuyPrice,
                ethers.utils.parseUnits('5', 'ether'),
                nftAddress,
                tokenId
            ))
                .to.be.revertedWith("Auction: start price is smaller than direct buy price");

            await expect(auctionFactory.connect(auctionOwner).createAuction(
                endTime,
                minIncrement,
                directBuyPrice,
                startPrice,
                ZERO_ADDRESS,
                tokenId
            ))
                .to.be.revertedWith("Auction: NFT address can't be zero address");

            await expect(auctionFactory.connect(auctionOwner).createAuction(
                endTime,
                minIncrement,
                directBuyPrice,
                startPrice,
                nftAddress,
                0
            ))
                .to.be.revertedWith("Auction: token id cannot be less than 0");

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

});