// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console2} from "forge-std/Test.sol";
import {Sentient} from "../../../contracts/Sentient.sol";

contract SentientTest is Test {
    Sentient public sentient;
    address alice = address(0x1);
    address bob = address(0x2);
    address dao = address(0x3);
    address owner = address(0x4);

    // Mocked signature - in a real test, you'd generate this correctly
    bytes mockSignature = hex"1234567890abcdef";
    string mockRsaPublicKey = "mock-rsa-public-key";

    function setUp() public {
        // Setup users with ETH
        vm.deal(alice, 100 ether);
        vm.deal(bob, 100 ether);
        vm.deal(dao, 100 ether);
        vm.deal(owner, 100 ether);
        
        // Create initial data for constructor
        bytes32[2] memory initialData;
        initialData[0] = bytes32("initial-key");
        initialData[1] = bytes32("initial-value");
        
        // Deploy contract with proper constructor arguments
        vm.prank(owner);
        sentient = new Sentient(
            dao,            // DAO address
            initialData,    // initialData
            mockSignature,  // signature for registering owner's public key
            mockRsaPublicKey // RSA public key for the owner
        );
    }

    function test_GetOwnerPublicKey() public {
        // Test retrieving the owner's public key that was set during construction
        string memory retrievedKey = sentient.pubEthToRsa(owner);
        assertEq(retrievedKey, mockRsaPublicKey);
    }

    function test_UpdateAndGetData() public {
        // Test updating and getting data (only DAO can update)
        bytes32[2] memory newData;
        newData[0] = bytes32("test-key");
        newData[1] = bytes32("test-value");
        
        // Should fail when called by non-DAO
        vm.prank(alice);
        vm.expectRevert("Only DAO can call this function");
        sentient.updateData(newData);
        
        // Should succeed when called by DAO
        vm.prank(dao);
        sentient.updateData(newData);
        
        // Verify the data was updated
        bytes32 retrievedValue = sentient.getData(newData[0]);
        assertEq(retrievedValue, newData[1]);
    }

    function test_PingRequest() public {
        // Test ping request functionality
        bytes32 key = bytes32("data-key");
        
        // Expect an event emission when pingRequest is called
        vm.expectEmit(true, true, false, true);
        emit Sentient.DataRequest(key, alice); // The signature would normally recover to the caller's address
        
        vm.prank(alice);
        sentient.pingRequest(key, mockSignature);
    }

    function test_ApproveRequest() public {
        // Test approve request functionality
        bytes32 key = bytes32("approve-key");
        
        // First set some data at this key
        bytes32[2] memory data;
        data[0] = key;
        data[1] = bytes32("test-data");
        
        vm.prank(dao);
        sentient.updateData(data);
        
        // Expect an event when approving
        vm.expectEmit(true, false, false, true);
        emit Sentient.DataApproved(key, block.timestamp);
        
        // Only owner can approve
        vm.prank(owner);
        sentient.approveRequest(key);
    }
} 