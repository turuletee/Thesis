var UniToken = artifacts.require("UniToken.sol");
var UniTokenSale = artifacts.require("UniTokenSale.sol");

module.exports = function (deployer) {
  deployer.deploy(UniToken, 1000000).then(function(){
    //token price is 0.001 ETH. 
    var tokenPrice = 1000000000000000;
    return  deployer.deploy(UniTokenSale, UniToken.address, tokenPrice);
  });
};
