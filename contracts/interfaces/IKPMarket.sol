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

    function makeMarketItem(
        address nftContract,
        uint256 tokenId,
        uint256 price
    ) external payable;

    function createMarketSale(address nftContract, uint256 itemId)
        external
        payable;

    function fetchMarketTokens() external view returns (MarketToken[] memory);

    function fetchMyNFTs() external view returns (MarketToken[] memory);

    function fetchItemsCreated() external view returns (MarketToken[] memory);
}
