pragma solidity >=0.4.21 <0.6.0;

import "./ERC721Mintable.sol";



// TODO define another contract named SolnSquareVerifier that inherits from your ERC721Mintable class
// TODO define a solutions struct that can hold an index & an address
// TODO define an array of the above struct
// TODO define a mapping to store unique solutions submitted
// TODO Create an event to emit when a solution is added
// TODO Create a function to add the solutions to the array and emit the event
// TODO Create a function to mint new NFT only after the solution has been verified
//  - make sure the solution is unique (has not been used before)
//  - make sure you handle metadata as well as tokenSuplly

contract SolnSquareVerifier is ERC721Mintable {
    Verifier private verifierContract;

    struct Solution {
        uint256 solIndex;
        address solAddress;
    }

    Solution[] solArray;

    mapping (bytes32 => Solution) solMap;

    event SolutionAdded(uint256 solIndex, address indexed solAddress);

    constructor(address veriContract, string memory name, string memory symbol) ERC721Mintable(name, symbol) public {
        verifierContract = Verifier(veriContract);
    }

    function addSolution(
        uint[2] memory a,
        uint[2] memory a_p,
        uint[2][2] memory b,
        uint[2] memory b_p,
        uint[2] memory c,
        uint[2] memory c_p,
        uint[2] memory h,
        uint[2] memory k,
        uint[2] memory input
    ) public {
        bytes32 solKey = keccak256(abi.encodePacked(input[0], input[1]));
        bool verification = verifierContract.verifyTx(a, a_p, b, b_p, c, c_p, h, k, input);
        require(verification, 'Solution needs to be verified');
        solMap[solKey] = Solution(solArray.length, msg.sender);
        solArray.push(solMap[solKey]);
        emit SolutionAdded(solArray.length, msg.sender); 
    }

    function mintNFT(uint a, uint b, address to) public returns (bool) {
        bytes32 solKey = keccak256(abi.encodePacked(a, b));
        require(solMap[solKey].solAddress != address(0), 'Solution either has not been verified or does not exist');
        super.mint(to, solMap[solKey].solIndex);
        return true;
    }
}


// TODO define a contract call to the zokrates generated solidity contract <Verifier> or <renamedVerifier>
contract Verifier {
    function verifyTx(
        uint[2] memory a,
        uint[2] memory a_p,
        uint[2][2] memory b,
        uint[2] memory b_p,
        uint[2] memory c,
        uint[2] memory c_p,
        uint[2] memory h,
        uint[2] memory k,
        uint[2] memory input
    ) public returns (bool r); 
}


  


























