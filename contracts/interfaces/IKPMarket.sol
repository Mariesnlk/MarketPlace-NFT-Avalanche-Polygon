//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

interface IKPMarket {
    event MarketTokenMinted(
        uint256 indexed itemId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address seller,
        address owner,
        uint256 price,
        bool sold
    );

    struct MarketToken {
        uint256 itemId;
        address nftContract;
        uint256 tokenId;
        address payable seller;
        address payable owner;
        uint256 price;
        uint256 likes;
        bool sold;
    }

    function createMarketItem(uint256 tokenId, uint256 price) external payable;

    function createMarketSale(uint256 itemId) external payable;

    function resellToken(uint256 tokenId, uint256 price) external payable;

    // fetchMarketTokens
    function getUnsoldItems() external view returns (MarketToken[] memory);

    // fetchMyNFTs
    function getMyNFTs() external view returns (MarketToken[] memory);

    // fetchItemsCreated
    function getOnlyCreatedItems() external view returns (MarketToken[] memory);
}
