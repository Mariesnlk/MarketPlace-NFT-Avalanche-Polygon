//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

/// @title Define interface for Market contract
interface IKPMarket {
    /**
     * @dev emitted when nft is added to market
     * @param id id
     * @param nftContract address of the nft contract
     * @param tokenId nft token
     * @param creator address of the creater
     * @param owner addreess of the owner
     * @param price amount price to buy
     * @param likes amount of likes
     * @param sold is nft token issold
     **/
    event MarketTokenCreated(
        uint256 indexed id,
        address indexed nftContract,
        uint256 indexed tokenId,
        address creator,
        address owner,
        uint256 price,
        uint256 likes,
        bool sold
    );

    /**
     * @dev mft token added to the market info
     * @param id id
     * @param nftContract address of the nft contract
     * @param tokenId nft token
     * @param creator address of the creater
     * @param owner addreess of the owner
     * @param price amount price to buy
     * @param likes amount of likes
     * @param sold is nft token issold
     **/
    struct MarketNFT {
        uint256 id;
        address nftContract;
        uint256 tokenId;
        address creator;
        address owner;
        uint256 price;
        uint256 likes;
        bool sold;
    }

    /**
     * @dev add NFT to market
     * @param nftId id of the NFT
     * @param price price to sell
     */
    function createMarketNFT(uint256 nftId, uint256 price)
        external
        payable
        returns (bool);

    /**
     * @dev create selling of the NFT (user buy it)
     * @param nftId id of the NFT
     */
    function marketSaleNFT(uint256 nftId) external payable returns (bool);

    /**
     * @dev reselle NFT
     * @param nftId id of the NFT
     * @param price to resell
     * @notice only NFT owner can resalle
     */
    function reselleNFT(uint256 nftId, uint256 price)
        external
        payable
        returns (bool);

    /**
     * @dev get info list of unsoled NFT
     * @notice fetchMarketTokens
     */
    function getUnsoldNFTs() external view returns (MarketNFT[] memory);

    /**
     * @dev get info list of NFT that owns msg.sender
     * @notice fetchMyNFTs
     */
    function getMyNFTs() external view returns (MarketNFT[] memory);

    /**
     * @dev get info list of NFT that only added to market
     * @notice fetchItemsCreated
     */
    function getOnlyCreatedNFTs() external view returns (MarketNFT[] memory);
}
