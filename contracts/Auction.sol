//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "./interfaces/IAuction.sol";

contract Auction is IAuction {
    uint256 private endTime; // Timestamp of the end of the auction (in seconds)
    uint256 private startTime; // The block timestamp which marks the start of the auction
    uint256 private maxBid; // The maximum bid
    address private maxBidder; // The address of the maximum bidder
    address private creator; // The address of the auction creator
    uint256 private tokenId; // The id of the token
    bool private isCancelled; // If the the auction is cancelled
    bool private isDirectBuy; // True if the auction ended due to direct buy
    uint256 private minIncrement; // The minimum increment for the bid
    uint256 private directBuyPrice; // The price for a direct buy
    uint256 private startPrice; // The starting price for the auction
    address private nftAddress;

    IERC721 private _nft; // The NFT token

    Bid[] private bids; // The bids made by the bidders

    constructor(
        address _creator,
        uint256 _endTime,
        uint256 _minIncrement,
        uint256 _directBuyPrice,
        uint256 _startPrice,
        address _nftAddress,
        uint256 _tokenId
    ) {
        require(
            _creator != address(0),
            "Auction: Creator of the auction can't be zero address"
        );
        require(
            _endTime > block.timestamp,
            "Auction: finish time of auction cannot be less than current time"
        );
        require(
            _minIncrement >= 0,
            "Auction: min increment for bid annot be less than 0"
        );
        require(
            _directBuyPrice > 0,
            "Auction: buy price cannot be less than 0"
        );
        require(
            _startPrice >= _directBuyPrice,
            "Auction: start price cannot be less direct price"
        );
        require(
            _nftAddress != address(0),
            "Auction: NFT address can't be zero address"
        );
        require(
            _tokenId > 0,
            "Auction: token id cannot be less than 0"
        );

        creator = _creator;
        startTime = block.timestamp; 
        endTime = startTime + _endTime; 
        minIncrement = _minIncrement; 
        directBuyPrice = _directBuyPrice;
        startPrice = _startPrice;
        _nft = IERC721(_nftAddress);
        nftAddress = _nftAddress;
        tokenId = _tokenId;
        maxBidder = _creator;
    }

    /** @dev - Place a bid on the auction
     */
    function placeBid() external payable override returns (bool) {}

    /** @dev - Withdraw the token after the auction is over
     */
    function withdrawToken() external override returns (bool) {}

    /** @dev - Withdraw the funds after the auction is over
     */
    function withdrawFunds() external override returns (bool) {}

    /** @dev - Cancel the auction
     */
    function cancelAuction() external override returns (bool) {}

    /** @dev - Get the auction state
     */
    function getAuctionState() external view override returns (uint256) {}

    /** @dev - Returns a list of all bids and addresses
     */
    function allBids()
        external
        view
        override
        returns (address[] memory, uint256[] memory)
    {}
}
