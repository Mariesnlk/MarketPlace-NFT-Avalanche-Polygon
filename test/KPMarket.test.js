const { SignerWithAddress } = require("@nomiclabs/hardhat-ethers/signers");
const { expect, chai } = require("chai");
const { ethers } = require("hardhat");


describe("KPMarket", () => {

    let market;
    let nft;

    let marketAddress;
    let nftContractAddress;

    let auctionPrice;

    beforeEach(async () => {
        [owner, minter, beneficiary2, beneficiary3, beneficiary4, beneficiary5, ...otherAccounts] = await ethers.getSigners();

        const Market = await ethers.getContractFactory('KPMarket');
        market = await Market.deploy();
        marketAddress = market.address

        const NFT = await ethers.getContractFactory('NFT');
        nft = await NFT.deploy(marketAddress);
        nftContractAddress = nft.address

        await market.setNFTContractAddress(nftContractAddress);

        // test to receive listing price and auction price
        let listingPrice = await market.getListingPrice()
        listingPrice = listingPrice.toString()

        auctionPrice = ethers.utils.parseUnits('100', 'ether')

    });

    describe('Intercat with marketplace', async () => {

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

        it("Should mint and trade NFTs", async () => {

            await nft.mintToken('https-p1');
            await nft.mintToken('https-p2');

            await market.makeMarketItem(nftContractAddress, 1, auctionPrice, { value: listingPrice })
            await market.makeMarketItem(nftContractAddress, 2, auctionPrice, { value: listingPrice })

            // test for different addresses from different users - test accounts
            // return an array of however many addresses
            const [_, buyerAddress] = await ethers.getSigners()

            // create a market sale with address, id and price
            await market.connect(buyerAddress).createMarketSale(nftContractAddress, 1, { value: auctionPrice })

            let items = await market.fetchMarketTokens()

            items = await Promise.all(items.map(async i => {
                // get the uri of the value
                const tokenUri = await nft.tokenURI(i.tokenId)
                let item = {
                    price: i.price.toString(),
                    tokenId: i.tokenId.toString(),
                    seller: i.seller,
                    owner: i.owner,
                    tokenUri
                }
                return item;
            }))

            // test out all items
            console.log('items', items)

        });

    });
});
