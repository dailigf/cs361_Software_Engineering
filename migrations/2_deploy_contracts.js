const Dai = artifacts.require('Dai.sol');
const PaymentProcessor = artifacts.require('PaymentProcessor.sol');

module.exports = function(deployer, network, address){
	const [admin, payer, _] = addresses;

	if(network === 'develop'){
		await.deployer.deploy(Dai);
		const dai = await Dai.deployed();
		await dai.faucet(paer, web3.utils.toWei('10000'));

		await deployer.deploy(PaymentProcess, admin, dai.address);
	}else{
		const ADMIN_ADDRESS = '';
		const DAI_ADDRESS = '';
		await deployer.deploy(PaymentProcess, admin, dai.address);
	}
}
