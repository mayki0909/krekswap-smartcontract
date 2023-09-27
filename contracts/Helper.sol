// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Helper {
  function parseSignature(bytes memory signature) public pure returns (bytes32 r, bytes32 s, uint8 v) {
    require(signature.length == 65, "Invalid signature length");

    assembly {
        // Extract r by copying the first 32 bytes from the signature
        r := mload(add(signature, 32))

        // Extract s by copying the next 32 bytes from the signature
        s := mload(add(signature, 64))

        // Extract v by masking the last byte (the recovery id)
        v := byte(0, mload(add(signature, 96)))
    }
  }
}