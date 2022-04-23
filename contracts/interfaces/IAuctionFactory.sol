//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

/// @title Define interface for AuctionFactory contract
interface IAuctionFactory {
    /**
     * @dev emitted when an auction is created
     * @param creator address of user who bids
     * @param startTime timestamp when the auction will be started
     * @param endTime timestamp when the auction will be finished
     * @param minIncrement the minimum increment for the bid
     * @param directBuyPrice the price for a direct buy
     * @param startPrice the starting price for the auction
     * @param nftAddress address of the nft
     * @param tokenId the id of the token
     **/
    event CreatedAuction(
        address indexed creator,
        uint256 startTime,
        uint256 endTime,
        uint256 minIncrement,
        uint256 directBuyPrice,
        uint256 startPrice,
        address indexed nftAddress,
        uint256 tokenId
    );

    /**
     * @dev struct of auction address and value if exists it or not
     * @param auction auction address
     * @param isExists is deleted auction
     **/
    struct AuctionInfo {
        address auction;
        bool isExists;
    }

    /**
     * @dev creating auction
     * @param _endTime timestamp when the auction will be finished
     * @param _minIncrement the minimum increment for the bid
     * @param _directBuyPrice the price for a direct buy
     * @param _startPrice the starting price for the auction
     * @param _nftAddress address of the nft
     * @param _tokenId the id of the token
     **/
    function createAuction(
        uint256 _endTime,
        uint256 _minIncrement,
        uint256 _directBuyPrice,
        uint256 _startPrice,
        address _nftAddress,
        uint256 _tokenId
    ) external returns (bool);

    /**
     * @dev deleting auction
     * @notice only owner of the auction can delete
     * @param auctionId address of the auction that will be deleted
     **/
    function deleteAuction(uint256 auctionId) external returns (bool);

    /**
     * @dev get a list of all auctions
     */
    function getAuctions() external view returns (address[] memory _auctions);

    /**
     * @dev get the information of each auction address
     */
    function getAuctionsInfo(address[] calldata _auctionsList)
        external
        view
        returns (
            uint256[] memory directBuy,
            address[] memory holder,
            uint256[] memory highestBid,
            uint256[] memory tokenIds,
            uint256[] memory endTime,
            uint256[] memory startPrice,
            uint256[] memory auctionState
        );
}
