// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./lib/EthMessageHashing.sol";

contract Sentient is Ownable {

    using EthMessageHashing for *;

    mapping(bytes32 => bytes32) public unverifiedCredentials;
    address public DAO;
    
    // Events
    event DataUpdated(bytes32 newData, uint256 timestamp);
    event DataRequest(bytes32 signedRequestParameters, address publicKey);

    modifier onlyDAO() {
        require(msg.sender == DAO, "Only DAO can call this function");
        _;
    }
    
    constructor(address dao, bytes32[2] memory initialData) Ownable(tx.origin) {
        DAO = dao;
        updateData(initialData);
    }
    
    function updateData(bytes32[2] memory dataEntry) internal {
        unverifiedCredentials[dataEntry[0]] = dataEntry[1];
        emit DataUpdated(dataEntry[1], block.timestamp);
    }

        function getData(bytes32 key) external view returns (bytes32) {
        return unverifiedCredentials[key];
    }

    function pingRequest(bytes32 key, bytes memory signature) external {

        address publicKey = EthMessageHashing.recoverSigner(key, signature);
        emit DataRequest(key, publicKey);
    }
    
} 