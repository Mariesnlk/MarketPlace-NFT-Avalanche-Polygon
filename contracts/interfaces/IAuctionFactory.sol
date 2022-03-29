//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

interface IAuctionFactory {
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

    /** @dev create an auction
     */
    function createAuction(
        uint256 _endTime,
        uint256 _minIncrement,
        uint256 _directBuyPrice,
        uint256 _startPrice,
        address _nftAddress,
        uint256 _tokenId
    ) external returns (bool);

    /** @dev return a list of all auctions
     */
    function getAuctions() external view returns (address[] memory _auctions);

    /** @dev return the information of each auction address
     */
    function getAuctionsInfo(address[] calldata _auctionsList)
        external
        view
        returns (
            uint256[] memory directBuy,
            address[] memory owner,
            uint256[] memory highestBid,
            uint256[] memory tokenIds,
            uint256[] memory endTime,
            uint256[] memory startPrice,
            uint256[] memory auctionState
        );
}
