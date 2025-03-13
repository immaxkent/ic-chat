// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./lib/EthMessageHashing.sol";

contract Sentient is Ownable {

    using EthMessageHashing for *;

    mapping(uint16 => bytes32) public unverifiedCredentials; // sentient's encrypted credentials, stored in key -> value style. schema for key->credential type should be known
    mapping(address => mapping(uint16 => bytes32[])) public pubKeyToKeyValueCredentials; // procurer eth address to key value rsa encrypted sentient credentials, stored in bytes32 array
    address public DAO;
    
    bytes32 public immutable pubKeyPart1;
    bytes32 public immutable pubKeyPart2;
    bytes32 public immutable pubKeyPart3;
    bytes32 public immutable pubKeyPart4;
    
    event DataUpdated(uint8 newData, uint256 timestamp);
    event DataRequest(uint16 credentialKey, address publicKey);

    modifier onlyDAO() {
        require(msg.sender == DAO, "Only DAO can call this function");
        _;
    }
    
    constructor(address _dao,uint8 _key, bytes32 _credentials, bytes32[] memory _pubKeyParts) Ownable(msg.sender) {
        DAO = _dao;
        updateData(_key, _credentials);
        require(_pubKeyParts.length <= 4, "Too many public key parts");
        pubKeyPart1 = _pubKeyParts[0];
        pubKeyPart2 = _pubKeyParts[1];
        pubKeyPart3 = _pubKeyParts[2];
        pubKeyPart4 = _pubKeyParts[3];
    }
    
    function updateData(uint8 key, bytes32 credentials) public onlyDAO {
        unverifiedCredentials[key] = credentials; //bytes32 rsa encrypted datas 
        emit DataUpdated(key, block.timestamp);
    }

    function getData(uint8 key) external view returns (bytes32) {
        return unverifiedCredentials[key];
    }

    function pingRequest(uint16 key, bytes memory signature) external {
        bytes32 dataRequested = unverifiedCredentials[key];
        /**
         * here, we should check that the procurer exists in the registry
         */
        address publicKey = EthMessageHashing.recoverSigner(dataRequested, signature);
        pubKeyToKeyValueCredentials[publicKey][key].push(bytes32(uint256(1))); // Convert int to bytes32
        emit DataRequest(key, publicKey);
    }

    function approveRequest(bytes calldata data, bytes memory signature) external onlyOwner {

        // first we deconstruct the incoming data into the components

        // then, we verify the signature to ensure it came from the owner
        // encryptedCredentials
        // address signer = 0x0000000000000000000000000000000000000000; // pseudo code from deconstruction of calldata
        // require (approvedProcurersToKeyValueCredentials[signer][0] = 1, "unregistered approval attempt"); // 

        // approvedProcurersToKeyValueCredentials[signer].push(); // 


        // then, we publish the rsa encrypted data for the procurer. they are thus able to read the data henceforth.
         
    }
    
    function executeMessage(bytes calldata message) external {
    }
} 