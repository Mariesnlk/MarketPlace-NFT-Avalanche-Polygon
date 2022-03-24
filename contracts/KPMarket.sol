//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./interfaces/IKPMarket.sol";

contract KPMarket is IKPMarket, ReentrancyGuard {
    using Counters for Counters.Counter;

    Counters.Counter private tokenIds;
    Counters.Counter private tokenSold;

    IERC721 private nftContract;

    uint256 private listingPrice = 0.045 ether;

    address payable private owner;

    constructor() {
        owner = payable(msg.sender);
    }

    // tokenId return which MarketToken - fetch which one it is
    mapping(uint256 => MarketToken) private idToMarketToken;

    function setNFTContractAddress(address nftContract_) external {
        require(
            nftContract_ != address(0),
            "KPMarket: invalid nftContract address"
        );
        nftContract = IERC721(nftContract_);
    }

    function updateListingPrice(uint256 _listingPrice) public payable {
        require(
            owner == msg.sender,
            "KPMarket: only marketplace owner can update listing price."
        );
        listingPrice = _listingPrice;
    }

    function getListingPrice() external view returns (uint256) {
        return listingPrice;
    }

    // function to put item up for sale
    function createMarketItem(uint256 tokenId, uint256 price)
        external
        payable
        override
        nonReentrant
    {
        require(price > 0, "KPMarket: price must be at least one wei");
        require(
            msg.value == listingPrice,
            "KPMarket: price must be equal to listening price"
        );

        tokenIds.increment();
        uint256 itemId = tokenIds.current();

        //putting it up for sale
        idToMarketToken[itemId] = MarketToken(
            itemId,
            address(nftContract),
            tokenId,
            payable(msg.sender),
            payable(address(0)),
            price,
            0,
            false
        );

        nftContract.transferFrom(msg.sender, address(this), tokenId);

        emit MarketTokenMinted(
            itemId,
            address(nftContract),
            tokenId,
            msg.sender,
            address(0),
            price,
            false
        );
    }

    function resellToken(uint256 tokenId, uint256 price) external payable override {
        require(
            idToMarketToken[tokenId].owner == msg.sender,
            "KPMarket: only item owner can perform this operation"
        );
        require(
            msg.value == listingPrice,
            "KPMarket: price must be equal to listing price"
        );
        idToMarketToken[tokenId].sold = false;
        idToMarketToken[tokenId].price = price;
        idToMarketToken[tokenId].seller = payable(msg.sender);
        idToMarketToken[tokenId].owner = payable(address(this));

        tokenIds.decrement();

        nftContract.transferFrom(msg.sender, address(this), tokenId);
    }

    // function to conduct transactions and market sales
    function createMarketSale(uint256 itemId)
        external
        payable
        override
        nonReentrant
    {
        uint256 price = idToMarketToken[itemId].price;
        uint256 tokenId = idToMarketToken[itemId].tokenId;

        require(
            msg.value == price,
            "KPMarket: please submit the asking price in order to continue"
        );

        idToMarketToken[itemId].seller.transfer(msg.value);

        nftContract.transferFrom(address(this), msg.sender, tokenId);

        idToMarketToken[itemId].owner = payable(msg.sender);
        idToMarketToken[itemId].sold = true;

        tokenSold.increment();

        // payable(owner).transfer(listingPrice);
        (bool success, ) = payable(owner).call{value: listingPrice}("");
        require(success, "Failed to transfer Ether");
    }

    function getUnsoldItems()
        external
        view
        override
        returns (MarketToken[] memory)
    {
        uint256 itemsCount = tokenIds.current();
        uint256 unsoldItemCount = tokenIds.current() - tokenSold.current();
        uint256 currentIndex = 0;

        MarketToken[] memory items = new MarketToken[](unsoldItemCount);

        for (uint256 i = 0; i < itemsCount; i++) {
            //if it is unsold item
            if (idToMarketToken[i + 1].owner == address(0)) {
                uint256 currentId = i + 1;
                MarketToken storage currentItem = idToMarketToken[currentId];
                items[currentIndex] = currentItem;
                currentIndex++;
            }
        }

        return items;
    }

    // return nfts that the user has purchased
    function getMyNFTs()
        external
        view
        override
        returns (MarketToken[] memory)
    {
        uint256 totalItemCount = tokenIds.current();
        //counter for each individual user
        uint256 itemCount = 0;
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idToMarketToken[i + 1].owner == msg.sender) {
                itemCount++;
            }
        }

        MarketToken[] memory items = new MarketToken[](itemCount);

        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idToMarketToken[i + 1].owner == msg.sender) {
                uint256 currentId = idToMarketToken[i + 1].itemId;
                MarketToken storage currentItem = idToMarketToken[currentId];
                items[currentId] = currentItem;
                currentIndex++;
            }
        }

        return items;
    }

    // function for returning an array of minting nfts(.seller)
    function getOnlyCreatedItems()
        external
        view
        override
        returns (MarketToken[] memory)
    {
        uint256 totalItemCount = tokenIds.current();
        uint256 itemCount = 0;
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idToMarketToken[i + 1].seller == msg.sender) {
                itemCount++;
            }
        }

        MarketToken[] memory items = new MarketToken[](itemCount);

        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idToMarketToken[i + 1].seller == msg.sender) {
                uint256 currentId = idToMarketToken[i + 1].itemId;
                MarketToken storage currentItem = idToMarketToken[currentId];
                items[currentId] = currentItem;
                currentIndex++;
            }
        }

        return items;
    }
}
