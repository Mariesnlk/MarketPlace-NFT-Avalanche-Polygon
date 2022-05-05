//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

/// @title Define interface for AuctionFactory contract
interface IAuctionFactory {
    /**
     * @notice emitted when an auction is created
     * @param creator address of user who bids
     * @param startTime timestamp when the auction will be started
     * @param duration timestamp how much the auction will be
     * @param minIncrement the minimum increment for the bid
     * @param directBuyPrice the price for a direct buy
     * @param startPrice the starting price for the auction
     * @param nftAddress address of the nft
     * @param tokenId the id of the token
     **/
    event CreatedAuction(
        address indexed creator,
        uint256 startTime,
        uint256 duration,
        uint256 minIncrement,
        uint256 directBuyPrice,
        uint256 startPrice,
        address indexed nftAddress,
        uint256 tokenId
    );

    /**
     * @notice struct of auction address and value if exists it or not
     * @param auction auction address
     * @param isExists is deleted auction
     **/
    struct AuctionInfo {
        address auction;
        bool isExists;
    }

    /**
     * @notice creating auction
     * @param _duration timestamp when the auction will be finished
     * @param _minIncrement the minimum increment for the bid
     * @param _directBuyPrice the price for a direct buy
     * @param _startPrice the starting price for the auction
     * @param _nftAddress address of the nft
     * @param _tokenId the id of the token
     **/
    function createAuction(
        uint256 _duration,
        uint256 _minIncrement,
        uint256 _directBuyPrice,
        uint256 _startPrice,
        address _nftAddress,
        uint256 _tokenId
    ) external returns (bool);

    /**
     * @notice deleting auction
     * @dev only owner of the auction can delete
     * @param auctionId address of the auction that will be deleted
     **/
    function deleteAuction(uint256 auctionId) external returns (bool);

    /**
     * @notice get a list of all auctions
     */
    function getAuctions() external view returns (address[] memory _auctions);

    /**
     * @notice get the information of each auction address
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
