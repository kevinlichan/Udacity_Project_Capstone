const truffleAssert = require('truffle-assertions');

const verifierContractDefinition = artifacts.require('Verifier');
const solnSquareVerifierContractDefinition = artifacts.require('SolnSquareVerifier');
const proofJson = require("../../zokrates/code/proof.json");

const name = "ERC721MintableToken";
const symbol = "TOKENSYM";

contract('SolnSquareVerifier', accounts => {
    
    let solnSquareContract;

    before(async() => {
        const verifierContract = await verifierContractDefinition.new({from: accounts[0]});
        solnSquareContract = await solnSquareVerifierContractDefinition.new(verifierContract.address, name, symbol, {from: accounts[0]});
    });

    // Test if a new solution can be added for contract - SolnSquareVerifier
    it('Test if a new solution can be added for contract - SolnSquareVerifier', async() => {
        let result = await solnSquareContract.addSolution(
            proofJson.proof.A,
            proofJson.proof.A_p,
            proofJson.proof.B,
            proofJson.proof.B_p,
            proofJson.proof.C,
            proofJson.proof.C_p,
            proofJson.proof.H,
            proofJson.proof.K,
            proofJson.input,
            {from: accounts[0]}
        );
        truffleAssert.eventEmitted(result, 'SolutionAdded');
    });

    // Test if an ERC721 token can be minted for contract - SolnSquareVerifier
    it('Test if an ERC721 token can be minted for contract - SolnSquareVerifier', async() => {
        let result = await solnSquareContract.mintNFT(2, 0, accounts[1], {from:accounts[0]});
        truffleAssert.eventEmitted(result, 'Transfer');
    });

});
