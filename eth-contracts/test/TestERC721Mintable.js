const truffleAssert = require('truffle-assertions');

const contractDefinition = artifacts.require('ERC721Mintable');

contract('ERC721Mintable', accounts => {

    const name = "ERC721MintableToken";
    const symbol = "TOKENSYM";

    const owner = accounts[0];
    const accountOne = accounts[1];
    const accountTwo = accounts[2];

    let tokenContract;
    
    describe('match erc721 spec', () => {
        before(async() => { 
            tokenContract = await contractDefinition.new(name, symbol, {from: owner});
            
            // TODO: mint multiple tokens
            await tokenContract.mint(accountOne, 1, {from: owner});
            await tokenContract.mint(accountTwo, 2, {from: owner});
            await tokenContract.mint(accountTwo, 3, {from: owner});
        });

        it('should return total supply', async() => {
            let tokenTotal = await tokenContract.totalSupply.call({from: accountOne});
            assert.equal(tokenTotal, 3, 'Tokens were not minted properly');
        });

        it('should get token balance', async() => { 
            let tokenBalance1 = await tokenContract.balanceOf(accountOne);
            assert.equal(tokenBalance1, 1, 'Token balance is not correct');

            let tokenBalance2 = await tokenContract.balanceOf(accountTwo);
            assert.equal(tokenBalance2, 2, 'Token balance is not correct');
        });

        // token uri should be complete i.e: https://s3-us-west-2.amazonaws.com/udacity-blockchain/capstone/1
        it('should return token uri', async() => { 
            let tokenURI = await tokenContract.tokenURI(1);
            assert.equal(tokenURI, "https://s3-us-west-2.amazonaws.com/udacity-blockchain/capstone/1", 'Token balance is not correct');
         });

        it('should approve another address to transfer a token', async() => {
            let result = await tokenContract.approve(accountOne, 3, {from: accountTwo});
            truffleAssert.eventEmitted(result, 'Approval');
            let approval = await tokenContract.getApproved(3);
            assert.equal(approval.toString(), accountOne.toString(), 'Approval was not captured correctly');
        });

        it('should transfer token from one owner to another', async() => { 
            let result = await tokenContract.transferFrom(accountTwo, accountOne, 3, {from: accountOne});
            truffleAssert.eventEmitted(result, 'Transfer');

            let tokenOwner = await tokenContract.ownerOf(3);
            assert.equal(tokenOwner.toString(), accountOne.toString(), 'Token was not transferred correctly');
        });
    });

    describe('match erc721metadata spec', () =>{
        before(async() => { 
            tokenContract = await contractDefinition.new(name, symbol, {from: owner});
        });

        it('Get the token name', async() => {
            let tokenName = await tokenContract.getName({from: accountOne});
            assert.equal(tokenName, name, 'Token name was not set properly');
        });

        it('Get token symbol', async() => {
            let tokenSym = await tokenContract.getSymbol({from: accountOne});
            assert.equal(tokenSym, symbol, 'Token symbol was not set properly');
        });

        it('Get baseTokenURI', async() => {
            let baseTokenURI = await tokenContract.getBaseTokenURI({from: accountOne});
            assert.equal(baseTokenURI, "https://s3-us-west-2.amazonaws.com/udacity-blockchain/capstone/", 'baseTokenURI was not set properly');
        });
    });

    describe('have ownership properties', function () {
        before(async() => { 
            tokenContract = await contractDefinition.new(name, symbol, {from: owner});
        });

        it('should fail when minting when address is not contract owner', async() => {
            await truffleAssert.reverts(tokenContract.mint(accountOne, 4, {from: accountOne}), 'Only the owner can call this function');
        });

        it('should return contract owner', async() => {
            let currentOwner = await tokenContract.getOwner({from: accountOne});
            assert.equal(currentOwner.toString(), owner.toString(), 'Current owner was not set correctly upon contract creation');
        });

        it('should transfer to a new owner (accountOne) and confirm', async() => { 
            let result = await tokenContract.transferOwnership(accountOne, {from: owner});
            truffleAssert.eventEmitted(result, 'OwnerTransferred');
            let newOwner = await tokenContract.getOwner({from: accountOne});
            assert.equal(newOwner.toString(), accountOne.toString(), 'Contract ownership was not transferred properly');
        });

    });

    describe('have pausable properties', function () {
        before(async() => { 
            tokenContract = await contractDefinition.new(name, symbol, {from: owner});
        });

        it('should allow owner to pause the contract', async() => {
            let result = await tokenContract.setPause({from: owner});
            truffleAssert.eventEmitted(result, 'Paused');
        });

        it('contract should not operate when paused', async() => { 
            await truffleAssert.reverts(tokenContract.mint(accountOne, 1, {from: owner}), 'Contract has been paused');
        });

        it('should allow owner to unpause the contract', async() => {
            let result = await tokenContract.setUnpause({from: owner});
            truffleAssert.eventEmitted(result, 'Unpaused');
        });

        it('should only allow the current owner to pause the contract', async() => {
            await truffleAssert.reverts(tokenContract.setPause({from: accountTwo}), 'Only the owner can call this function');
        });
    });

});

const expectToRevert = (promise, errorMessage) => {
    return truffleAssert.reverts(promise, errorMessage);
};