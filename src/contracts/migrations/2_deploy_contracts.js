const TokenFarm = artifacts.require("TokenFarm");

module.export = function(deployer){
	deployer.deploy(TokenFarm);
};
