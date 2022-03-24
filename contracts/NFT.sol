//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract NFT is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    address private contractAddress;

    event MintedToken(address indexed minter, string tokenURI, uint256 itemId);

    constructor(address marketplaceAddress) ERC721("KryptoPaintz", "KPAINTZ") {
        contractAddress = marketplaceAddress;
    }

    function mintToken(string memory tokenURI) external returns (uint256) {
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        //passing id and url
        _mint(msg.sender, newItemId);
        //set the token URI: id and url
        _setTokenURI(newItemId, tokenURI);
        //give the marketplace the approval to transact between users
        setApprovalForAll(contractAddress, true);
        //mint token and set it for sale - return the id to do so

        emit MintedToken(msg.sender, tokenURI, newItemId);

        return newItemId;
    }
}
