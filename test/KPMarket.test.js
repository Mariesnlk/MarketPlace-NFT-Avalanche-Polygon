const { expect } = require("chai");
const { ethers } = require("hardhat");
const {
    constants
} = require("@openzeppelin/test-helpers");


describe("KPMarket", () => {

    let market;
    let nft;

    let marketAddress;
    let nftContractAddress;

    let listingPrice;

    beforeEach(async () => {
        [creater, minter, buyer, buyer2, beneficiary4, beneficiary5, ...otherAccounts] = await ethers.getSigners();

        const Market = await ethers.getContractFactory('KPMarket');
        market = await Market.deploy();
        marketAddress = market.address

        const NFT = await ethers.getContractFactory('NFT');
        nft = await NFT.deploy(marketAddress);
        nftContractAddress = nft.address

        await market.setNFTContractAddress(nftContractAddress);

        listingPrice = await market.getListingPrice();

    });

    describe('Intercat with marketplace', async () => {

        it('Should reverted deploying with zero address', async () => {
            await expect(market.setNFTContractAddress(constants.ZERO_ADDRESS))
                .to.be.revertedWith("KPMarket: invalid nftContract address");
        });

        it('Should contracts not to be ..', async () => {
            expect(marketAddress).to.be.not.undefined;
            expect(marketAddress).to.be.not.null;
            expect(marketAddress).to.be.not.NaN;

            expect(nftContractAddress).to.be.not.undefined;
            expect(nftContractAddress).to.be.not.null;
            expect(nftContractAddress).to.be.not.NaN;
        });


        it("Should successfully mint NFTs", async () => {
            await expect(nft.connect(minter).mintToken('https-p1'))
                .to.emit(nft, 'MintedToken')
                .withArgs(minter.address, 'https-p1', 1);
            await expect(nft.connect(minter).mintToken('https-p2'))
                .to.emit(nft, 'MintedToken')
                .withArgs(minter.address, 'https-p2', 2);
        });

        it("Upgate listing price", async () => {
            expect(listingPrice).to.be.equal(ethers.utils.parseUnits('0.045', 'ether'));

            await expect(market.connect(buyer).updateListingPrice(ethers.utils.parseUnits('0.035', 'ether')))
                .to.be.revertedWith("KPMarket: only marketplace owner can update listing price.");

            await expect(market.updateListingPrice(ethers.utils.parseUnits('0', 'ether')))
                .to.be.revertedWith("KPMarket: listing price value should be more than 0.");

            await market.updateListingPrice(ethers.utils.parseUnits('0.035', 'ether'));
            listingPrice = await market.getListingPrice();
            expect(listingPrice).to.be.equal(ethers.utils.parseUnits('0.035', 'ether'));

        });

        it("Should create market item(NFT token)", async () => {
            await nft.mintToken('https-p1');

            await expect(market.createMarketItem(1, ethers.utils.parseUnits('0', 'ether'), { value: listingPrice }))
                .to.be.revertedWith("KPMarket: price must be at least one wei");

            let auctionPrice = ethers.utils.parseUnits('0.02', 'ether');

            await expect(market.createMarketItem(1, auctionPrice, { value: ethers.utils.parseUnits('0.035', 'ether') }))
                .to.be.revertedWith("KPMarket: price must be equal to listening price");

            await expect(market.createMarketItem(1, auctionPrice, { value: listingPrice }))
                .to.emit(market, 'MarketTokenCreated')
                .withArgs(1, nft.address, 1, creater.address, constants.ZERO_ADDRESS, auctionPrice, false);

        });

        it("Should create market sale fot NFT token", async () => {
            await nft.mintToken('https-p1');

            let auctionPrice = ethers.utils.parseUnits('0.02', 'ether');

            await market.createMarketItem(1, auctionPrice, { value: listingPrice });

            await expect(market.connect(buyer).createMarketSale(1, { value: ethers.utils.parseUnits('0.002', 'ether') }))
                .to.be.revertedWith("KPMarket: please submit the asking price in order to continue");

            await market.connect(buyer).createMarketSale(1, { value: auctionPrice });

            const [itemId,
                nftContract,
                tokenId,
                seller,
                owner,
                price,
                likes,
                sold] = await market.idToMarketToken(1);
            expect(itemId).to.be.equal(1);
            expect(nftContract).to.be.equal(nft.address);
            expect(tokenId).to.be.equal(1);
            expect(seller).to.be.equal(creater.address);
            expect(owner).to.be.equal(buyer.address);
            expect(price).to.be.equal(auctionPrice);
            expect(likes).to.be.equal(0);
            expect(sold).to.be.true;

        });

        it("Should create resale fot NFT token", async () => {
            await nft.mintToken('https-p1');
            await nft.mintToken('https-p2');

            let auctionPrice = ethers.utils.parseUnits('0.02', 'ether');

            await market.createMarketItem(1, auctionPrice, { value: listingPrice });
            await market.createMarketItem(2, auctionPrice, { value: listingPrice });

            await market.connect(buyer).createMarketSale(1, { value: auctionPrice });
            await market.connect(buyer2).createMarketSale(2, { value: auctionPrice });

            let resalePrice = ethers.utils.parseUnits('0.022', 'ether');

            await expect(market.connect(buyer).resellToken(2, resalePrice, { value: listingPrice }))
                .to.be.revertedWith("KPMarket: only item owner can perform this operation");

            await expect(market.connect(buyer).resellToken(1, resalePrice, { value: resalePrice }))
                .to.be.revertedWith("KPMarket: price must be equal to listing price");

            await nft.connect(buyer).approve(market.address, 1);
            await market.connect(buyer).resellToken(1, resalePrice, { value: listingPrice });

            const [itemId,
                nftContract,
                tokenId,
                seller,
                owner,
                price,
                likes,
                sold] = await market.idToMarketToken(1);
            expect(itemId).to.be.equal(1);
            expect(nftContract).to.be.equal(nft.address);
            expect(tokenId).to.be.equal(1);
            expect(seller).to.be.equal(buyer.address);
            expect(owner).to.be.equal(market.address);
            expect(price).to.be.equal(resalePrice);
            expect(likes).to.be.equal(0);
            expect(sold).to.be.false;

        });

        it("Should get unsold items(NFT tokens)", async () => {
            await nft.mintToken('https-p1');
            await nft.mintToken('https-p2');

            let auctionPrice = ethers.utils.parseUnits('0.02', 'ether');

            await market.createMarketItem(1, auctionPrice, { value: listingPrice });
            await market.createMarketItem(2, auctionPrice, { value: listingPrice });

            let unsoldItems = await market.getUnsoldItems();
            expect(unsoldItems.length).to.be.equal(2);

            await market.connect(buyer).createMarketSale(1, { value: auctionPrice });

            unsoldItems = await market.getUnsoldItems();
            expect(unsoldItems.length).to.be.equal(1);

        });

        it("Should get user`s NFT that was bought", async () => {
            await nft.mintToken('https-p1');
            await nft.mintToken('https-p2');
            await nft.mintToken('https-p3');

            let auctionPrice = ethers.utils.parseUnits('0.02', 'ether');

            await market.createMarketItem(1, auctionPrice, { value: listingPrice });
            await market.createMarketItem(2, auctionPrice, { value: listingPrice });
            await market.createMarketItem(3, auctionPrice, { value: listingPrice });

            let myNFTs = await market.connect(buyer).getMyNFTs();
            expect(myNFTs.length).to.be.equal(0);

            await market.connect(buyer).createMarketSale(1, { value: auctionPrice });
            await market.connect(buyer).createMarketSale(2, { value: auctionPrice });

            myNFTs = await market.connect(buyer).getMyNFTs();
            expect(myNFTs.length).to.be.equal(2);

        });

        it("Should get only minted NFT", async () => {
            await nft.mintToken('https-p1');
            await nft.mintToken('https-p2');
            await nft.mintToken('https-p3');

            let auctionPrice = ethers.utils.parseUnits('0.02', 'ether');

            await market.createMarketItem(1, auctionPrice, { value: listingPrice });

            let mintedNFTs = await market.getOnlyCreatedItems();
            expect(mintedNFTs.length).to.be.equal(1);

            await market.createMarketItem(3, auctionPrice, { value: listingPrice });

            mintedNFTs = await market.getOnlyCreatedItems();
            expect(mintedNFTs.length).to.be.equal(2);

            mintedNFTs = await market.connect(buyer).getOnlyCreatedItems();
            expect(mintedNFTs.length).to.be.equal(0);

        });


    });
});
