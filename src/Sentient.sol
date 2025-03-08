// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

contract Sentient {
    address public owner;
    address public dao;
    mapping(bytes32 => bytes32) private dataStore;
    
    event DataUpdated(bytes32 newData, uint256 timestamp);
    event DataRequest(bytes32 signedRequestParameters, address publicKey);
    event PublicKeyRegistered(address indexed owner, string publicKey);
    
    constructor(address _dao, bytes32[2] memory initialData) {
        owner = msg.sender;
        dao = _dao;
        dataStore[initialData[0]] = initialData[1];
    }
    
    // Only DAO can update data
    function updateData(bytes32[2] memory dataEntry) public {
        require(msg.sender == dao, "Only DAO can call this function");
        dataStore[dataEntry[0]] = dataEntry[1];
        emit DataUpdated(dataEntry[1], block.timestamp);
    }
    
    // Anyone can get data
    function getData(bytes32 key) external view returns (bytes32) {
        return dataStore[key];
    }
    
    // Register a public key
    function registerPublicKey(string memory publicKey, bytes memory signature) external {
        // In real implementation, this would verify the signature
        emit PublicKeyRegistered(msg.sender, publicKey);
    }
    
    // Ping request with signed parameters
    function pingRequest(bytes32 key, bytes memory signature) external {
        // In real implementation, this would verify the signature
        emit DataRequest(key, msg.sender);
    }
} 