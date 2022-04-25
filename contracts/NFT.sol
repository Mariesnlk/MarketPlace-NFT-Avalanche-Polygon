//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/// @title NFT contract with ERC721 standart
contract NFT is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    /// @notice market contract address
    address private market;
    /**
     * @dev emitted when NFT is minted
     * @param minter address of creater
     * @param tokenURI nft url
     * @param nftId nft id
     **/
    event MintedNFT(address indexed minter, string tokenURI, uint256 nftId);

    constructor(address marketplaceAddress) ERC721("KryptoPaintz", "KPAINTZ") {
        require(
            marketplaceAddress != address(0),
            "NFT: invalid market address"
        );
        market = marketplaceAddress;
    }

    function mintToken(string memory nftURI) external returns (uint256) {
        _tokenIds.increment();
        uint256 newNftId = _tokenIds.current();
        //passing id and url
        _mint(msg.sender, newNftId);
        //set the token URI: id and url
        _setTokenURI(newNftId, nftURI);
        //give the marketplace the approval to transact between users
        setApprovalForAll(market, true);

        emit MintedNFT(msg.sender, nftURI, newNftId);

        return newNftId;
    }
}
