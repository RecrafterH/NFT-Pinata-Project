// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

error PuppyNft__NeedMoreEthSent();
error PuppyNft__TotalSupplyReached();

contract PuppyNft is ERC721URIStorage, Ownable {
    uint public tokenCounter = 1;
    string internal puppyTokenUri;
    uint internal mintFee = 0.1 ether;
    uint public totalSupply = 3;

    event NFTMinted(address minter);

    constructor(string memory _puppyTokenUri) ERC721("PuppyNft", "PPT") {
        puppyTokenUri = _puppyTokenUri;
    }

    function requestNft() public payable {
        if (tokenCounter > totalSupply) {
            revert PuppyNft__TotalSupplyReached();
        }
        if (msg.value < mintFee) {
            revert PuppyNft__NeedMoreEthSent();
        }

        uint256 newTokenId = tokenCounter;
        tokenCounter = tokenCounter + 1;
        _safeMint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, puppyTokenUri);
        emit NFTMinted(msg.sender);
    }

    function getTokenUri() public view returns (string memory) {
        return puppyTokenUri;
    }

    function getMintFee() public view returns (uint) {
        return mintFee;
    }

    function getTotalSupply() public view returns (uint) {
        return totalSupply;
    }

    function getTokenCounter() public view returns (uint) {
        return tokenCounter;
    }
}
