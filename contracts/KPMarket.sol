//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./interfaces/IKPMarket.sol";

/// @title Market contract
contract KPMarket is IKPMarket, ReentrancyGuard, Ownable {
    using Counters for Counters.Counter;
    /// @notice count of all nfts
    Counters.Counter private tokenIds;
    /// @notice count of sold nfts
    Counters.Counter private tokenSold;
    /// @notice NFT contract
    IERC721 public nftContract;
    /// @notice price that permit add nft to the market
    uint256 public listingPrice = 0.045 ether;
    // tokenId return which MarketToken - fetch which one it is
    mapping(uint256 => MarketNFT) public idToMarketToken;

    /**
     * @dev set address to NFT contract
     */
    function setNFTContract(address _nftContract) external onlyOwner {
        require(
            _nftContract != address(0),
            "KPMarket: invalid nftContract address"
        );
        nftContract = IERC721(_nftContract);
    }

    /**
     * @dev set new value for listing price
     * @notice only owner can update
     */
    function updateListingPrice(uint256 _listingPrice)
        external
        payable
        onlyOwner
    {
        require(
            _listingPrice > 0,
            "KPMarket: listing price value should be more than 0."
        );
        listingPrice = _listingPrice;
    }

    /**
     * @dev add NFT to market
     * @param nftId id of the NFT
     * @param price price to sell
     * @notice function to put item up for sale
     */
    function createMarketNFT(uint256 nftId, uint256 price)
        external
        payable
        override
        nonReentrant
        returns (bool)
    {
        require(price > 0, "KPMarket: price must be at least one wei");
        require(
            msg.value == listingPrice,
            "KPMarket: price must be equal to listening price"
        );

        tokenIds.increment();
        uint256 itemId = tokenIds.current();

        //putting nft up for sale
        idToMarketToken[itemId] = MarketNFT(
            itemId,
            address(nftContract),
            nftId,
            payable(msg.sender),
            payable(address(0)),
            price,
            0,
            false
        );

        // transer nft to market contract
        nftContract.transferFrom(msg.sender, address(this), nftId);

        emit MarketTokenCreated(
            itemId,
            address(nftContract),
            nftId,
            msg.sender,
            address(0),
            price,
            0,
            false
        );

        return true;
    }

    /**
     * @dev reselle NFT
     * @param nftId id of the NFT
     * @param price to resell
     * @notice only NFT owner can resalle
     */
    function reselleNFT(uint256 nftId, uint256 price)
        external
        payable
        override
        returns (bool)
    {
        require(
            idToMarketToken[nftId].owner == msg.sender,
            "KPMarket: only item owner can perform this operation"
        );
        require(
            msg.value == listingPrice,
            "KPMarket: price must be equal to listing price"
        );
        idToMarketToken[nftId].sold = false;
        idToMarketToken[nftId].price = price;
        idToMarketToken[nftId].creator = payable(msg.sender);
        idToMarketToken[nftId].owner = payable(address(this));

        tokenIds.decrement();

        nftContract.transferFrom(msg.sender, address(this), nftId);

        return true;
    }

    /**
     * @dev create selling of the NFT (user buy it)
     * @param nftId id of the NFT
     */
    function marketSaleNFT(uint256 nftId)
        external
        payable
        override
        nonReentrant
        returns (bool)
    {
        uint256 price = idToMarketToken[nftId].price;
        uint256 tokenId = idToMarketToken[nftId].tokenId;

        require(
            msg.value == price,
            "KPMarket: please submit the asking price in order to continue"
        );

        idToMarketToken[nftId].creator.transfer(msg.value);

        nftContract.transferFrom(address(this), msg.sender, tokenId);

        idToMarketToken[nftId].owner = payable(msg.sender);
        idToMarketToken[nftId].sold = true;

        tokenSold.increment();

        // payable(owner).transfer(listingPrice);
        (bool success, ) = payable(msg.sender).call{value: listingPrice}("");
        require(success, "Failed to transfer Ether");

        return true;
    }

    /**
     * @dev get info list of unsoled NFT
     * @notice fetchMarketTokens
     */
    function getUnsoldNFTs()
        external
        view
        override
        returns (MarketNFT[] memory)
    {
        uint256 nftCount = tokenIds.current();
        uint256 unsoldItemCount = tokenIds.current() - tokenSold.current();
        uint256 currentIndex = 0;

        MarketNFT[] memory items = new MarketNFT[](unsoldItemCount);

        for (uint256 i = 0; i < nftCount; i++) {
            //if it is unsold item
            if (idToMarketToken[i + 1].owner == address(0)) {
                uint256 currentId = i + 1;
                MarketNFT storage currentItem = idToMarketToken[currentId];
                items[currentIndex] = currentItem;
                currentIndex++;
            }
        }

        return items;
    }

    /**
     * @dev get info list of NFT that owns msg.sender
     * @notice fetchMyNFTs
     */
    function getMyNFTs() external view override returns (MarketNFT[] memory) {
        uint256 totalNFTCount = tokenIds.current();
        //counter for each individual user
        uint256 itemCount = 0;
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < totalNFTCount; i++) {
            if (idToMarketToken[i + 1].owner == msg.sender) {
                itemCount++;
            }
        }

        MarketNFT[] memory items = new MarketNFT[](itemCount);

        for (uint256 i = 0; i < totalNFTCount; i++) {
            if (idToMarketToken[i + 1].owner == msg.sender) {
                uint256 currentId = idToMarketToken[i + 1].id;
                MarketNFT storage currentItem = idToMarketToken[currentId];
                items[currentIndex] = currentItem;
                currentIndex++;
            }
        }

        return items;
    }

    /**
     * @dev get info list of NFT that only added to market
     * @notice fetchItemsCreated
     */
    function getOnlyCreatedNFTs()
        external
        view
        override
        returns (MarketNFT[] memory)
    {
        uint256 totalNFTCount = tokenIds.current();
        uint256 itemCount = 0;
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < totalNFTCount; i++) {
            if (idToMarketToken[i + 1].creator == msg.sender) {
                itemCount++;
            }
        }

        MarketNFT[] memory items = new MarketNFT[](itemCount);

        for (uint256 i = 0; i < totalNFTCount; i++) {
            if (idToMarketToken[i + 1].creator == msg.sender) {
                uint256 currentId = idToMarketToken[i + 1].id;
                MarketNFT storage currentItem = idToMarketToken[currentId];
                items[currentIndex] = currentItem;
                currentIndex++;
            }
        }

        return items;
    }
}
