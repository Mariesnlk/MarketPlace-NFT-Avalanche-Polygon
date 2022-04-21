//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./interfaces/IAuctionFactory.sol";
import "./Auction.sol";

contract AuctionFactory is IAuctionFactory {
    using Counters for Counters.Counter;
    Counters.Counter private auctionIds;
    // @notice
    uint256 private minAuctionDuration = 5 minutes;
    // @notice
    mapping(uint256 => Auction) public auctions;
    // @notice
    mapping(uint256 => address) public auctionAddresses;

    // requirePermission(ROLE_ADMIN)

    /**
     * @dev create an auction
     */
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
            "Auction: end time must be greater than 5 minutes"
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
        auctionAddresses[auctionId] = address(auction);

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
     * @dev return a list of all auctions
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
     *@dev return the information of each auction address
     */
    function getAuctionsInfo(address[] calldata _auctionsList)
        external
        view
        override
        returns (
            uint256[] memory directBuy,
            address[] memory owner,
            uint256[] memory highestBid,
            uint256[] memory tokenIds,
            uint256[] memory endTime,
            uint256[] memory startPrice,
            uint256[] memory auctionState
        )
    {
        directBuy = new uint256[](_auctionsList.length);
        owner = new address[](_auctionsList.length);
        highestBid = new uint256[](_auctionsList.length);
        tokenIds = new uint256[](_auctionsList.length);
        endTime = new uint256[](_auctionsList.length);
        startPrice = new uint256[](_auctionsList.length);
        auctionState = new uint256[](_auctionsList.length);

        for (uint256 i = 0; i < _auctionsList.length; i++) {
            directBuy[i] = Auction(auctions[i]).directBuyPrice();
            owner[i] = Auction(auctions[i]).creator();
            highestBid[i] = Auction(auctions[i]).maxBid();
            tokenIds[i] = Auction(auctions[i]).tokenId();
            endTime[i] = Auction(auctions[i]).endTime();
            startPrice[i] = Auction(auctions[i]).startPrice();
            auctionState[i] = uint256(Auction(auctions[i]).getAuctionState());
        }

        return (
            directBuy,
            owner,
            highestBid,
            tokenIds,
            endTime,
            startPrice,
            auctionState
        );
    }
}
