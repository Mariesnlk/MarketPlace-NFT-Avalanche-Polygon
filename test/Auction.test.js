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
    let auctionFactoryAddress;

    let listingPrice;
    let endTime;
    let minIncrement;
    let directBuyPrice;
    let startPrice;
    let nftAddress;
    let tokenId;

    let ONE_DAY = 60 * 60 * 24;

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
        endTime = timestampBefore + ONE_DAY; // 1 day
        minIncrement = ethers.utils.parseUnits('0.002', 'ether');
        directBuyPrice = ethers.utils.parseUnits('5', 'ether');
        startedPrice = ethers.utils.parseUnits('0.02', 'ether');
        nftAddress = nftContractAddress;

        await nft.connect(auctionOwner).mintToken('https-p1');
        tokenId = 1;
        await nft.connect(auctionOwner).approve(auctionFactoryAddress, 1);
        await auctionFactory.connect(auctionOwner).createAuction(
            endTime,
            minIncrement,
            directBuyPrice,
            startedPrice,
            nftAddress,
            tokenId
        );

        const [auctionAddress, isExist] = await auctionFactory.auctionsInfo(0);

        const Auction = await ethers.getContractFactory("Auction");
        auctionInstance = await Auction.attach(
            auctionAddress
        );

    });

    describe('Intercat with auction', async () => {
        describe('placeBid', async () => {
            it('Should reverted if the bidder is the auction creator', async () => {
                await expect(auctionInstance.connect(auctionOwner).placeBid(
                    { value: ethers.utils.parseUnits('0.02', 'ether') }
                ))
                    .to.be.revertedWith("Auction: the bidder cannot be the auction creator");
            });

            it('Should reverted if the bidder is the auction creator', async () => {
                await auctionInstance.connect(auctionOwner).cancelAuction();
                await expect(auctionInstance.connect(bidder1).placeBid(
                    { value: ethers.utils.parseUnits('0.02', 'ether') }
                ))
                    .to.be.revertedWith("Auction: the auction must be open");
            });

            it('Should reverted if the bid is is less than sterted price', async () => {
                await expect(auctionInstance.connect(bidder1).placeBid(
                    { value: ethers.utils.parseUnits('0.01', 'ether') }
                ))
                    .to.be.revertedWith("Auction: the bid must be greater than the started price");
            });

            it('Should reverted if the bid is is less than the highest bid + minimum bid increment', async () => {
                await auctionInstance.connect(bidder1).placeBid(
                    { value: ethers.utils.parseUnits('0.02', 'ether') }
                );
                await expect(auctionInstance.connect(bidder2).placeBid(
                    { value: ethers.utils.parseUnits('0.021', 'ether') }
                ))
                    .to.be.revertedWith("Aucton: the bid must be greater than the highest bid + minimum bid increment");
            });

            it('Should sucessfully place a bid', async () => {
                await expect(auctionInstance.connect(bidder1).placeBid(
                    { value: ethers.utils.parseUnits('0.02', 'ether') }
                )).to.emit(auctionInstance, 'NewBid')
                    .withArgs(bidder1.address, ethers.utils.parseUnits('0.02', 'ether'));
                const [sender, bid] = await auctionInstance.bids(0);
                expect(sender).to.be.equal(bidder1.address);
                expect(bid).to.be.equal(ethers.utils.parseUnits('0.02', 'ether'));
                expect(await auctionInstance.maxBid()).to.be.equal(ethers.utils.parseUnits('0.02', 'ether'));
            });
        });

        describe('cancelAuction', async () => {
            it('Should reverted if not the auction creator cancels the auction', async () => {
                await expect(auctionInstance.connect(buyer).cancelAuction())
                    .to.be.revertedWith("Auction: only the auction creator can cancel the auction");
            });

            it('Should reverted if auction is not open', async () => {
                expect(await auctionInstance.getAuctionState()).to.be.equal(0);
                await auctionInstance.connect(auctionOwner).cancelAuction();
                expect(await auctionInstance.getAuctionState()).to.be.equal(1);
                await expect(auctionInstance.connect(auctionOwner).cancelAuction())
                    .to.be.revertedWith("Auction: the auction must be open");
                expect(await auctionInstance.getAuctionState()).to.be.equal(1);
            });

            it('Should reverted if auction has a bid', async () => {
                await auctionInstance.connect(bidder1).placeBid(
                    { value: ethers.utils.parseUnits('0.02', 'ether') }
                );
                expect(await auctionInstance.maxBid()).to.be.equal(ethers.utils.parseUnits('0.02', 'ether'));
                await expect(auctionInstance.connect(auctionOwner).cancelAuction())
                    .to.be.revertedWith("Auction: the auction must not be cancelled if there is a bid");
            });

            it('Should sucessfully cancel the auction', async () => {
                await expect(auctionInstance.connect(auctionOwner).cancelAuction())
                    .to.emit(auctionInstance, 'AuctionCancelled');
            });
        });

        describe('allBids', async () => {
            it('Should sucessfully get all bids', async () => {
                await auctionInstance.connect(bidder1).placeBid(
                    { value: ethers.utils.parseUnits('0.02', 'ether') }
                );
                await auctionInstance.connect(bidder2).placeBid(
                    { value: ethers.utils.parseUnits('0.025', 'ether') }
                );

                const [bidders, bids] = await auctionInstance.allBids();
                expect(await bidders.length).to.be.equal(2);
                expect(await bids.length).to.be.equal(2);
                const [bidders1, bidders2] = bidders;
                expect(await bidders1).to.be.equal(bidder1.address);
                expect(await bidders2).to.be.equal(bidder2.address);
                const [bids1, bids2] = bids;
                expect(await bids1).to.be.equal(ethers.utils.parseUnits('0.02', 'ether'));
                expect(await bids2).to.be.equal(ethers.utils.parseUnits('0.025', 'ether'));
            });
        });

        describe('getAuctionState', async () => {
            it('CREATED -> ENDED', async () => {
                await nft.connect(auctionOwner).mintToken('https-p2');
                duration = 60 * 60 * 10; // 10 min
                minIncrement = ethers.utils.parseUnits('0.002', 'ether');
                directBuyPrice = ethers.utils.parseUnits('5', 'ether');
                startPrice = ethers.utils.parseUnits('0.02', 'ether');
                nftAddress = nftContractAddress;
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

                expect(await auctionInstance.getAuctionState()).to.be.equal(0);
                await ethers.provider.send("evm_increaseTime", [ONE_DAY * 15]);
                await ethers.provider.send("evm_mine");
                expect(await auctionInstance.getAuctionState()).to.be.equal(2);
            });

            it('CREATED -> CANCELED', async () => {
                expect(await auctionInstance.getAuctionState()).to.be.equal(0);
                await auctionInstance.connect(auctionOwner).cancelAuction();
                expect(await auctionInstance.getAuctionState()).to.be.equal(1);
            });

            it('CREATED -> BUY', async () => {
                expect(await auctionInstance.getAuctionState()).to.be.equal(0);
                await auctionInstance.connect(bidder1).placeBid(
                    { value: ethers.utils.parseUnits('5.1', 'ether') }
                );
                expect(await auctionInstance.getAuctionState()).to.be.equal(3);
            });
        });

        describe('withdrawToken', async () => {
            it('Should reverted if the auction is not ended', async () => {
                await auctionInstance.connect(bidder1).placeBid(
                    { value: ethers.utils.parseUnits('3', 'ether') }
                );
                await auctionInstance.connect(bidder2).placeBid(
                    { value: ethers.utils.parseUnits('4', 'ether') }
                );
                await expect(auctionInstance.connect(bidder2).withdrawToken())
                    .to.be.revertedWith("Auction: the auction must be ended by either a direct buy or timeout");
            });

            it('Should reverted if not max bidder withdraw token', async () => {
                await auctionInstance.connect(bidder1).placeBid(
                    { value: ethers.utils.parseUnits('3', 'ether') }
                );
                await auctionInstance.connect(bidder2).placeBid(
                    { value: ethers.utils.parseUnits('6', 'ether') }
                );
                await expect(auctionInstance.connect(bidder1).withdrawToken())
                    .to.be.revertedWith("Auction: only the highest bidder can withdraw the token");
            });

            it('Should sucessfully withdraw token', async () => {
                await auctionInstance.connect(bidder1).placeBid(
                    { value: ethers.utils.parseUnits('3', 'ether') }
                );
                await auctionInstance.connect(bidder2).placeBid(
                    { value: ethers.utils.parseUnits('6', 'ether') }
                );
                expect(await nft.ownerOf(1)).to.be.equal(auctionInstance.address);
                await expect(auctionInstance.connect(bidder2).withdrawToken())
                    .to.emit(auctionInstance, 'WithdrawToken')
                    .withArgs(bidder2.address);
                expect(await nft.ownerOf(1)).to.be.equal(bidder2.address);
            });
        });

        describe('withdrawFunds', async () => {
            it('Should reverted if the auction is not ended', async () => {
                await auctionInstance.connect(bidder1).placeBid(
                    { value: ethers.utils.parseUnits('3', 'ether') }
                );
                await auctionInstance.connect(bidder2).placeBid(
                    { value: ethers.utils.parseUnits('4', 'ether') }
                );
                await expect(auctionInstance.connect(auctionOwner).withdrawFunds())
                    .to.be.revertedWith("Auction: The auction must be ended by either a direct buy or timeout");
            });

            it('Should reverted if not auction creator withdraw funds', async () => {
                await auctionInstance.connect(bidder1).placeBid(
                    { value: ethers.utils.parseUnits('3', 'ether') }
                );
                await auctionInstance.connect(bidder2).placeBid(
                    { value: ethers.utils.parseUnits('6', 'ether') }
                );
                await expect(auctionInstance.connect(bidder2).withdrawFunds())
                    .to.be.revertedWith("Auction: Only the auction creator can withdraw the funds");
            });

            it('Should sucessfully withdraw funds by auction creator', async () => {
                await auctionInstance.connect(bidder1).placeBid(
                    { value: ethers.utils.parseUnits('3', 'ether') }
                );
                await auctionInstance.connect(bidder2).placeBid(
                    { value: ethers.utils.parseUnits('6', 'ether') }
                );
                await expect(auctionInstance.connect(auctionOwner).withdrawFunds())
                    .to.emit(auctionInstance, 'WithdrawFunds')
                    .withArgs(auctionOwner.address, ethers.utils.parseUnits('6', 'ether'));
            });
        });

    });
});