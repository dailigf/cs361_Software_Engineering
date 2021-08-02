const Migrations = artifacts.require("Migrations");

module.export = function(deployer){
	deployer.deploy(Migrations);
};
