const { expect } = require("chai");
const { ethers } = require("hardhat");
const {
    constants
} = require("@openzeppelin/test-helpers");

describe("AuctionFactory", () => {

    let nft;
    let market;
    let token;
    let auction1;
    let auction2;
    let auctionFactory;

    let nftContractAddress;
    let marketAddress;
    let auctionAddress1;
    let auctionAddress2;
    let auctionFactoryAddress;
    let tokenAddress;

    let listingPrice;
    let duration;
    let minIncrement;
    let directBuyPrice;
    let startPrice;
    let nftAddress;
    let tokenId;

    let name = "Mariia Coin"
    let symbol = "MRSNLK"
    let totalSupply = 1000000000

    beforeEach(async () => {
        [creater, minter, buyer, auctionOwner, bidder1, bidder2, bidder3, ...otherAccounts] = await ethers.getSigners();

        const Token = await ethers.getContractFactory('Token');
        token = await Token.deploy(name, symbol, totalSupply);
        tokenAddress = token.address;

        const Market = await ethers.getContractFactory('KPMarket');
        market = await Market.deploy(tokenAddress);
        marketAddress = market.address;

        const NFT = await ethers.getContractFactory('NFT');
        nft = await NFT.deploy(marketAddress);
        nftContractAddress = nft.address;

        await market.setNFTContract(nftContractAddress);

        listingPrice = await market.listingPrice();

        const AuctionFactory = await ethers.getContractFactory('AuctionFactory');
        auctionFactory = await AuctionFactory.deploy();
        auctionFactoryAddress = auctionFactory.address;

        auctionFactory.setMinAuctionDuration(60 * 60 * 5);

    });

    it('Set minAuctionDuration', async () => {
        await expect(auctionFactory.setMinAuctionDuration(0))
            .to.be.revertedWith("AuctionFactory: invalid min auction duration");

    });

    describe('Intercat with auction factory', async () => {
        describe('createAuction', async () => {
            it('Should reverted if auction time less than 5 min', async () => {
                await nft.connect(auctionOwner).mintToken('https-p1');

                duration = 60 * 60;
                minIncrement = ethers.utils.parseUnits('0.002', 'ether');
                directBuyPrice = ethers.utils.parseUnits('5', 'ether');
                startPrice = ethers.utils.parseUnits('0.02', 'ether');
                nftAddress = nftContractAddress;
                tokenId = 1;

                await nft.connect(auctionOwner).approve(auctionFactoryAddress, 1);

                await expect(auctionFactory.connect(auctionOwner).createAuction(
                    duration,
                    minIncrement,
                    directBuyPrice,
                    startPrice,
                    nftAddress,
                    tokenId
                ))
                    .to.be.revertedWith("Auction: invalid auction duration");

            });

            it('Should reverted if min increment for bid annot be less than 0', async () => {
                await nft.connect(auctionOwner).mintToken('https-p1');

                duration = 60 * 60 * 10; // 10 min
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
                    duration,
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

                duration = 60 * 60 * 10; // 10 min
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
                    duration,
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

                duration = 60 * 60 * 10; // 10 min
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
                    duration,
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

                duration = 60 * 60 * 10; // 10 min
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
                    duration,
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

                duration = 60 * 60 * 10; // 10 min
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
                    duration,
                    minIncrement,
                    directBuyPrice,
                    startPrice,
                    nftAddress,
                    0
                ))
                    .to.be.revertedWith("Auction: token id cannot be less than 0");

            });

            it('Should sucessfully create the auction', async () => {
                await nft.connect(auctionOwner).mintToken('https-p1');

                duration = 60 * 60 * 10; // 10 min
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
                    duration,
                    minIncrement,
                    directBuyPrice,
                    startPrice,
                    nftAddress,
                    tokenId
                ))
                    .to.emit(auctionFactory, 'CreatedAuction')
                    .withArgs(auctionOwner.address,
                        currentTime,
                        duration,
                        ethers.utils.parseUnits('0.002', 'ether'),
                        ethers.utils.parseUnits('5', 'ether'),
                        ethers.utils.parseUnits('0.02', 'ether'),
                        nftContractAddress,
                        1);
            });

        });

        describe('getAuctions', async () => {
            it('Should successfully get auctions', async () => {
                duration = 60 * 60 * 10; // 10 min
                minIncrement = ethers.utils.parseUnits('0.002', 'ether');
                directBuyPrice = ethers.utils.parseUnits('5', 'ether');
                startPrice = ethers.utils.parseUnits('0.02', 'ether');
                nftAddress = nftContractAddress;

                await nft.connect(auctionOwner).mintToken('https-p1');
                tokenId = 1;
                await nft.connect(auctionOwner).approve(auctionFactoryAddress, 1);
                await auctionFactory.connect(auctionOwner).createAuction(
                    duration,
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

        describe('deletAuction', async () => {
            it('Reverted if the auction is already deleted', async () => {
                await nft.connect(auctionOwner).mintToken('https-p1');

                duration = 60 * 60 * 10; // 10 min
                minIncrement = ethers.utils.parseUnits('0.002', 'ether');
                directBuyPrice = ethers.utils.parseUnits('5', 'ether');
                startPrice = ethers.utils.parseUnits('0.02', 'ether');
                nftAddress = nftContractAddress;
                tokenId = 1;

                await nft.connect(auctionOwner).approve(auctionFactoryAddress, 1);

                blockNumBefore = await ethers.provider.getBlockNumber();
                blockBefore = await ethers.provider.getBlock(blockNumBefore);
                currentTime = blockBefore.timestamp + 1;

                await auctionFactory.connect(auctionOwner).createAuction(
                    duration,
                    minIncrement,
                    directBuyPrice,
                    startPrice,
                    nftAddress,
                    tokenId
                );

                await auctionFactory.connect(auctionOwner).deleteAuction(0);
                expect(await auctionFactory.auctions(0)).to.be.equal(constants.ZERO_ADDRESS);

                await expect(auctionFactory.connect(auctionOwner).deleteAuction(0))
                    .to.be.revertedWith("ALREADY_DELETED");
            });

            it('Sucessfully deleted the auction', async () => {
                await nft.connect(auctionOwner).mintToken('https-p1');

                duration = 60 * 60 * 10; // 10 min
                minIncrement = ethers.utils.parseUnits('0.002', 'ether');
                directBuyPrice = ethers.utils.parseUnits('5', 'ether');
                startPrice = ethers.utils.parseUnits('0.02', 'ether');
                nftAddress = nftContractAddress;
                tokenId = 1;

                await nft.connect(auctionOwner).approve(auctionFactoryAddress, 1);

                blockNumBefore = await ethers.provider.getBlockNumber();
                blockBefore = await ethers.provider.getBlock(blockNumBefore);
                currentTime = blockBefore.timestamp + 1;

                await auctionFactory.connect(auctionOwner).createAuction(
                    duration,
                    minIncrement,
                    directBuyPrice,
                    startPrice,
                    nftAddress,
                    tokenId
                );

                const [auctionAddress, isExist] = await auctionFactory.auctionsInfo(0);

                expect(await nft.ownerOf(tokenId)).to.be.equal(auctionAddress);

                // need to appove
                // await nft.connect(auctionAddress).approve(auctionOwner.address, 1);
                expect(await auctionFactory.connect(auctionOwner).deleteAuction(0))
                    .to.emit(auctionFactory, 'AuctionCancelled');

                expect(await auctionFactory.auctions(0)).to.be.equal(constants.ZERO_ADDRESS);
                // not changed nft owner
                // expect(await nft.ownerOf(tokenId)).to.be.equal(auctionOwner.address);

            });
        });

        describe('getAuctionsInfo', async () => {
            it('get info about all auctions', async () => {
                //first auction 
                await nft.connect(auctionOwner).mintToken('https-p1');

                duration = 60 * 60 * 10; // 10 min
                minIncrement = ethers.utils.parseUnits('0.002', 'ether');
                directBuyPrice = ethers.utils.parseUnits('5', 'ether');
                startPrice = ethers.utils.parseUnits('0.02', 'ether');
                nftAddress = nftContractAddress;
                tokenId = 1;

                await nft.connect(auctionOwner).approve(auctionFactoryAddress, 1);

                blockNumBefore = await ethers.provider.getBlockNumber();
                blockBefore = await ethers.provider.getBlock(blockNumBefore);
                currentTime = blockBefore.timestamp + 1;

                await auctionFactory.connect(auctionOwner).createAuction(
                    duration,
                    minIncrement,
                    directBuyPrice,
                    startPrice,
                    nftAddress,
                    tokenId
                );

                const [auctionAddress1, isExist] = await auctionFactory.auctionsInfo(0);

                let Auction = await ethers.getContractFactory("Auction");
                let auctionInstance = Auction.attach(
                    auctionAddress1
                );

                await auctionInstance.connect(bidder1).placeBid(
                    { value: ethers.utils.parseUnits('0.02', 'ether') }
                );
                await auctionInstance.connect(bidder2).placeBid(
                    { value: ethers.utils.parseUnits('0.025', 'ether') }
                );
                await auctionInstance.connect(bidder1).placeBid(
                    { value: ethers.utils.parseUnits('5.1', 'ether') }
                );

                //second auction
                await nft.connect(auctionOwner).mintToken('https-p2');

                tokenId = 2;

                await nft.connect(auctionOwner).approve(auctionFactoryAddress, 2);

                await auctionFactory.connect(auctionOwner).createAuction(
                    duration,
                    minIncrement,
                    directBuyPrice,
                    startPrice,
                    nftAddress,
                    tokenId
                );

                const [auctionAddress2, isExist1] = await auctionFactory.auctionsInfo(1);

                Auction = await ethers.getContractFactory("Auction");
                auctionInstance = Auction.attach(
                    auctionAddress2
                );

                await auctionInstance.connect(bidder1).placeBid(
                    { value: ethers.utils.parseUnits('0.05', 'ether') }
                );
                await auctionInstance.connect(bidder2).placeBid(
                    { value: ethers.utils.parseUnits('0.09', 'ether') }
                );
                await auctionInstance.connect(bidder3).placeBid(
                    { value: ethers.utils.parseUnits('0.2', 'ether') }
                );
                await auctionInstance.connect(bidder2).placeBid(
                    { value: ethers.utils.parseUnits('0.3', 'ether') }
                );

                await ethers.provider.send("evm_increaseTime", [60 * 60 * 15]);
                await ethers.provider.send("evm_mine");

                expect(await auctionInstance.getAuctionState()).to.be.equal(2);

                // get info about requested auctions
                console.log(await auctionFactory.getAuctionsInfo([auctionAddress1, auctionAddress2]));

            });

        });

    });

});