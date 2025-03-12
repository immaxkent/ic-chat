// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./lib/EthMessageHashing.sol";

contract Procurer is Ownable {

    using EthMessageHashing for *;

    struct ProcurerPubCreds {
        string businessName;
        uint8 taxRegistrationNumber;
        string governingBody;
    }  // sentient's encrypted credentials stored publicly
    bytes32 public immutable pubKey;
    address public DAO;
    mapping(bool => ProcurerPubCreds) public credentials;
    
    // Events
    event DataUpdated(uint8 newData, uint256 timestamp);
    event DataRequest(bytes32 signedRequestParameters, address publicKey);

    modifier onlyDAO() {
        require(msg.sender == DAO, "Only DAO can call this function");
        _;
    }
    
    constructor(string memory _businessName, uint8 _trn, string memory _governingBody, address _dao, bytes32 _pubKey) Ownable() {
        // here we gon create the credentials struct and store it in the mapping, along with initialisation of other elements of the contract
        ProcurerPubCreds memory initialCreds = ProcurerPubCreds({
            businessName: _businessName,
            taxRegistrationNumber: _trn,
            governingBody: _governingBody
        });
        credentials[true] = initialCreds;
        DAO = _dao;
        pubKey = _pubKey;
    }
    
} 