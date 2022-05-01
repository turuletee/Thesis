var UniTokenSale = artifacts.require("UniTokenSale.sol");
var UniToken = artifacts.require("UniToken.sol");

contract('UniTokenSale',function(accounts){
	var tokenSaleInstance;
	var admin = accounts[0]; 
	var buyer = accounts[1];
	var tokenPrice = 1000000000000000; //in wei
	var numberOfTokens;
	var tokensAvalable = 750000;

	it('initializes the contract with correct values', function(){
		return UniTokenSale.deployed().then(function(instance){
			 tokenSaleInstance = instance; 
			 return tokenSaleInstance.address
		}).then(function(address){
			assert.notEqual(address,0x0,'has contract address')
			return tokenSaleInstance.tokenContract();
		}).then(function(address){
			assert.notEqual(address,0x0, 'has  token Contract address ')
			return tokenSaleInstance.tokenPrice();
		}).then(function(price){
			assert.equal(price, tokenPrice, 'token price is correct');
		});
	});

	it('facilitates token Buying', function(){
		return UniToken.deployed().then(function(instance){
			//grab tokenInstance first
			tokenInstance = instance 
			return UniTokenSale.deployed();
		}).then(function(instance){
			//then grab TokenSaleInstance
			tokenSaleInstance = instance;
			//assign 75% of tokens to the tokenSale
			return tokenInstance.transfer(tokenSaleInstance.address, tokensAvalable, {from: admin})
		}).then(function(receipt){
			numberOfTokens = 10;
			return tokenSaleInstance.buyTokens(numberOfTokens, {from: buyer, value: numberOfTokens * tokenPrice})
		}).then(function(receipt){
			assert.equal(receipt.logs.length, 1, 'triggers one event');
			assert.equal(receipt.logs[0].event, 'Sell', 'Should be the "Sell" event');
			assert.equal(receipt.logs[0].args._buyer, buyer,'logs the account that purchases the tokens');
			assert.equal(receipt.logs[0].args._ammount, numberOfTokens, 'logs the ammount of tokens bought');
			return tokenSaleInstance.tokensSold();
		}).then(function(ammount){
			assert.equal(ammount.toNumber(), numberOfTokens, 'increments the number of tokens sold');
			return tokenInstance.balanceOf(buyer);
		}).then(function(balance){
			assert.equal(balance.toNumber(),numberOfTokens); 
			return tokenInstance.balanceOf(tokenSaleInstance.address);
		}).then(function(balance){
			assert.equal(balance.toNumber(), tokensAvalable - numberOfTokens);
			//try to buy tokens different from the ether value
			return tokenSaleInstance.buyTokens(numberOfTokens, {from: buyer, value: 1});
		}).then(assert.fail).catch(function(error){
			assert(error.message,'msg.value must equal number of tokens in wei ');
			return tokenInstance.buyTokens(9999999999,{from: buyer, value: numberOfTokens * tokenPrice})
		}).then(assert.fail).catch(function(error){
			assert(error.message, 'cannot purchase more tokens than available');
		});
	});

	it('ends token Sale', function(){
		return UniToken.deployed().then(function(instance){
			//grab tokenInstance first
			tokenInstance = instance 
			return UniTokenSale.deployed();
		}).then(function(instance){
			//then grab TokenSaleInstance
			tokenSaleInstance = instance;
			//try to end sale from account other than admin
			return tokenSaleInstance.endSale({from: buyer}); 
		}).then(assert.fail).catch(function(error){
			assert(error.message,'sale must be ended by admin ');
			//end sale as admin
			return tokenSaleInstance.endSale({from: admin});
		}).then(function(receipt){
			return tokenInstance.balanceOf(admin);
		}).then(function(balance){
			assert.equal(balance.toNumber(),999990, 'returns all unsold uniTokens to admin')
			//check that the contract has no balance
			// balance = web3.eth.getBalance(tokenSaleInstance.address);
			// assert.equal(balance.toNumber(),0,'makes sure that the contract has no balance');
		});
	});
});