//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IAuctionFactory.sol";
import "./interfaces/IAuction.sol";
import "./Auction.sol";

/// @title AuctionFactory contract
contract AuctionFactory is IAuctionFactory, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private auctionIds;
    /// @notice min value auction duration
    uint256 public minAuctionDuration = 5 minutes;
    /// @notice auction id => auction info
    mapping(uint256 => Auction) public auctions;
    /// @notice auction id => AuctionInfo (address, bool)
    mapping(uint256 => AuctionInfo) public auctionsInfo;

    /**
     * @dev set new minumum value of the auction duration
     * @param auctionDuration minumum value of the auction duration
     * @notice only owner can set
     */
    function setMinAuctionDuration(uint256 auctionDuration) external onlyOwner {
        require(
            auctionDuration > 0,
            "AuctionFactory: invalid min auction duration"
        );
        minAuctionDuration = auctionDuration;
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
    ) external override returns (bool) {
        require(
            _endTime >= minAuctionDuration,
            "Auction: invalid auction duration"
        );
        uint256 auctionId = auctionIds.current();
        auctionIds.increment();
        Auction auction = new Auction(
            msg.sender,
            _endTime,
            _minIncrement,
            _directBuyPrice,
            _startPrice,
            _nftAddress,
            _tokenId
        );

        IERC721 nftToken = IERC721(_nftAddress);
        nftToken.transferFrom(msg.sender, address(auction), _tokenId);
        auctions[auctionId] = auction;
        auctionsInfo[auctionId].auction = address(auction);
        auctionsInfo[auctionId].isExists = true;

        emit CreatedAuction(
            msg.sender,
            block.timestamp,
            _endTime,
            _minIncrement,
            _directBuyPrice,
            _startPrice,
            _nftAddress,
            _tokenId
        );

        return true;
    }

    /**
     * @dev deleting auction
     * @notice only owner of the auction can delete
     * @param auctionId address of the auction that will be deleted
     **/
    function deleteAuction(uint256 auctionId) external override returns (bool) {
        require(
            auctionsInfo[auctionId].isExists,
            "AuctionFactory: the auction is deleted"
        );

        IAuction(auctionsInfo[auctionId].auction).cancelAuction();

        delete auctionsInfo[auctionId];
        delete auctions[auctionId];

        return true;
    }

    /**
     * @dev get a list of all auctions
     */
    function getAuctions()
        external
        view
        override
        returns (address[] memory _auctions)
    {
        uint256 getAuctionsIds = auctionIds.current();
        _auctions = new address[](getAuctionsIds);
        for (uint256 i = 0; i < getAuctionsIds; i++) {
            _auctions[i] = address(auctions[i]);
        }
        return _auctions;
    }

    /**
     * @dev get the information of each auction address
     */
    function getAuctionsInfo(address[] calldata _auctionsList)
        external
        view
        override
        returns (
            uint256[] memory directBuy,
            address[] memory holder,
            uint256[] memory highestBid,
            uint256[] memory tokenIds,
            uint256[] memory endTime,
            uint256[] memory startPrice,
            uint256[] memory auctionState
        )
    {
        directBuy = new uint256[](_auctionsList.length);
        holder = new address[](_auctionsList.length);
        highestBid = new uint256[](_auctionsList.length);
        tokenIds = new uint256[](_auctionsList.length);
        endTime = new uint256[](_auctionsList.length);
        startPrice = new uint256[](_auctionsList.length);
        auctionState = new uint256[](_auctionsList.length);

        for (uint256 i = 0; i < _auctionsList.length; i++) {
            directBuy[i] = Auction(auctions[i]).directBuyPrice();
            holder[i] = Auction(auctions[i]).creator();
            highestBid[i] = Auction(auctions[i]).maxBid();
            tokenIds[i] = Auction(auctions[i]).tokenId();
            endTime[i] = Auction(auctions[i]).endTime();
            startPrice[i] = Auction(auctions[i]).startPrice();
            auctionState[i] = uint256(
                Auction(auctions[i]).getAuctionState()
            );
        }

        return (
            directBuy,
            holder,
            highestBid,
            tokenIds,
            endTime,
            startPrice,
            auctionState
        );
    }
}
