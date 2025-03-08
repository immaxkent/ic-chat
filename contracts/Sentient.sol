// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./lib/EthMessageHashing.sol";

contract Sentient is Ownable {

    using EthMessageHashing for *;

    mapping(bytes32 => bytes32) public unverifiedCredentials;
    mapping(address => string) public pubEthToRsa;
    address public DAO;
    
    // Events
    event DataUpdated(bytes32 newData, uint256 timestamp);
    event DataRequest(bytes32 signedRequestParameters, address publicKey);
    event PublicKeyRegistered(address indexed owner, string publicKey);
    event DataApproved(bytes32 key, uint256 timestamp);

    modifier onlyDAO() {
        require(msg.sender == DAO, "Only DAO can call this function");
        _;
    }
    
    constructor(address dao, bytes32[2] memory initialData, bytes memory sig, string memory rsaPubKey) Ownable(msg.sender) {
        DAO = dao;
        updateData(initialData);
        registerPublicKey(rsaPubKey, sig);
    }
    
    function updateData(bytes32[2] memory dataEntry) public onlyDAO {
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

    function approveRequest(bytes32 key) external onlyOwner {
        unverifiedCredentials[key] = unverifiedCredentials[key];
        emit DataApproved(key, block.timestamp);
    }
    
    function registerPublicKey(string memory publicKey, bytes memory signature) internal {
        // Verify the signature matches the sender
        string memory message = string(abi.encodePacked("Register RSA public key for ", EthMessageHashing.addressToString(msg.sender)));
        address signer = EthMessageHashing.recoverSigner(bytes32(bytes(message)), signature);
        require(signer == msg.sender, "Invalid signature");
        pubEthToRsa[msg.sender] = publicKey;
        emit PublicKeyRegistered(msg.sender, publicKey);
    }

} 