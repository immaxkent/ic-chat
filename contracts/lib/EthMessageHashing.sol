// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

library EthMessageHashing {

    // function verifyAction(
    //     address signer,
    //     string memory action,
    //     bytes memory signature
    // ) public pure returns (bool){
    //     bytes32 messageHash = keccak256(abi.encodePacked(signer, action));
    //     bytes32 ethSignedMessageHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash));
    //     address recoveredSigner = recoverSigner(ethSignedMessageHash, signature);
    //     return(recoveredSigner == signer);
    // }

    function getMessageHash(bytes32 _message) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(_message));
    }

    function getEthSignedMessageHash(bytes32 _messageHash) public pure returns (bytes32) {
        return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", _messageHash));
    }

    function splitSignature(bytes memory sig) public pure returns (bytes32 r, bytes32 s, uint8 v) {
        require(sig.length == 65, "Invalid signature length");

        assembly {
            r := mload(add(sig, 32))
            s := mload(add(sig, 64))
            v := byte(0, mload(add(sig, 96)))
        }

        if (v < 27) {
            v += 27;
        }
    }

    function recoverSigner(bytes32 message, bytes memory _signature) public pure returns (address) {
        bytes32 _messageHash = getMessageHash(message);
        bytes32 _ethSignedMessageHash = getEthSignedMessageHash(_messageHash);
        (bytes32 r, bytes32 s, uint8 v) = splitSignature(_signature);
        return ecrecover(_ethSignedMessageHash, v, r, s);
    }

    function addressToString(address _addr) internal pure returns (string memory) {
        bytes32 value = bytes32(uint256(uint160(_addr)));
        bytes memory alphabet = "0123456789abcdef";
        
        bytes memory str = new bytes(42);
        str[0] = "0";
        str[1] = "x";
        
        for (uint256 i = 0; i < 20; i++) {
            str[2 + i * 2] = alphabet[uint8(value[i + 12] >> 4)];
            str[3 + i * 2] = alphabet[uint8(value[i + 12] & 0x0f)];
        }
        
        return string(str);
    }
}