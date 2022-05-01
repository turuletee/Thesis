 pragma solidity ^0.8.11;

import "./UniToken.sol";

contract UniTokenSale{

	address payable admin;
	UniToken public tokenContract;
	uint256 public tokenPrice;
	uint256 public tokensSold;

	constructor(UniToken _tokenContract, uint256 _tokenPrice) public{

		admin = payable(msg.sender);
		tokenContract = _tokenContract;
		tokenPrice = _tokenPrice;

	}
//Events

	event Sell(address _buyer, uint256 _ammount);

//Functions
	
	function multiply(uint x, uint y) internal pure returns(uint z) {
		
		require( y == 0 || (z= x * y ) / y == x );
	}

	function buyTokens(uint256 _numberOfTokens) public payable {

		require(msg.value == multiply(_numberOfTokens, tokenPrice));
		require(tokenContract.balanceOf(address(this)) >= _numberOfTokens);
		require(tokenContract.transfer(msg.sender, _numberOfTokens));

		tokensSold += _numberOfTokens;

		emit Sell(msg.sender, _numberOfTokens);

	}

	function endSale() public{
		require(msg.sender == admin);
		require(tokenContract.transfer(admin, tokenContract.balanceOf(address(this))));

		selfdestruct(admin);

	}
}