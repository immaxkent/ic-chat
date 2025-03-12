// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./lib/EthMessageHashing.sol";

contract Sentient is Ownable {

    using EthMessageHashing for *;

    mapping(uint16 => bytes32) public unverifiedCredentials; // sentient's encrypted credentials, stored in key -> value style
    mapping(address => bytes32[]) public approvedProcurersToKeyValueCredentials; // procurer eth address to [0] key and [1] value rsa encrypted sentient credentials
    address public DAO;
    bytes32 public immutable pubKey;
    
    // Events
    event DataUpdated(uint8 newData, uint256 timestamp);
    event DataRequest(bytes32 signedRequestParameters, address publicKey);

    modifier onlyDAO() {
        require(msg.sender == DAO, "Only DAO can call this function");
        _;
    }
    
    constructor(address _dao, uint8 _key, bytes32 _credentials, bytes32 _pubKey) Ownable() {
        DAO = _dao;
        updateData(_key, _credentials);
        pubKey = _pubKey;
    }
    
    function updateData(uint8 key, bytes32 credentials) internal {
        unverifiedCredentials[key] = credentials;
        emit DataUpdated(key, block.timestamp);
    }

    function getData(uint8 key) external view returns (bytes32) {
        return unverifiedCredentials[key];
    }

    function pingRequest(bytes32 key, bytes memory signature) external {
        address publicKey = EthMessageHashing.recoverSigner(key, signature);
        emit DataRequest(key, publicKey);
    }

    function approveRequest(bytes calldata data) external onlyDAO {

        // first we deconstruct the incoming data into the components

        // then, we verify the signature to ensure it came from the owner

        // then, we publish the rsa encrypted data for the procurer. they are thus able to read the data henceforth.
         
    }
    
    function executeMessage(bytes calldata message) external {
    }
} 