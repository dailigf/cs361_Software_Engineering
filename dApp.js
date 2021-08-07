module.exports = function () {
	var express = require('express');
	var router = express.Router();
	var Tx = require('ethereumjs-tx').Transaction;
  	var Web3 = require('Web3');
  	const web3 = new Web3('http://127.0.0.1:7545');

	const privateKeys = new Map();
	
	//Keys for Ganache Graphical
	privateKeys.set('0x18D89A1F41829aBb070c89AAe91763dB46BCDa0D', '8bf73c44567ac0dd53d54c72691dfe349b022fe38e3618667dd0f50e631a7cd1');
	privateKeys.set('0xC53c7A63c134cd7b92d0Ea14Ed5e23f2f0a15C18', 'a4b000bff523fdc644e5b8df7fa4c36015a6e6f99edf5ee8774dc0d6f91c69ae');
	privateKeys.set('0xA90c5099abAb61FAD511e45cf0531C0417c48De0', '355717585d175d9fa2a77b8480093f94f56737eca1a5b755e8939a40a8547ee1');
	privateKeys.set('0xB69298340cBdE5A255f51acDadA0BaBF72d96Db6', '15fc02fe4d5bcaf328b823ea83f7d0539ff132f247355f72c9aee52e9275fc88');
	privateKeys.set('0x5BcB57B0f3e310eBB8291fb7E93B778E9b3E15AD', 'dccacfc4ada926b1132f58394581edf31ad3bf9a20be82a85bf41f7e483abe46');
	privateKeys.set('0x9fAe9D4a544d77D972029e14Fad754fED5F86aDF', '95442e0f6ac34ee4101599d3f5568da1c07a3d83761915ec3dc368d5992583b2');

	const seller = '0xc6EfbA1f45dD02294e4503F3dEFC6008cd7326dc';
	privateKeys.set(seller, '9b175370afbd39ef4b038676888a68b005590ef8d430a30c65d28284165d482a');

	const stripHexPrefix = require('strip-hex-prefix');


	async function createTxObject(address, seller){
		/* This function will be used to create a transaction object
		 * :param address: wallet address of the buy
		 * :type addres: hex string
		 * :param seller: wallet address of the seller
		 * :type seller: hex string
		 *
		 * :return: returns a transaction object
		 * :rtype: json map
		 */
		const txObject = {
			nonce: web3.utils.toHex(await web3.eth.getTransactionCount(address)),
			from: address,
			to: seller,
			value: web3.utils.toHex(web3.utils.toWei('1', 'ether')),
			gasLimit: '0x6691B7',
			gasPrice: web3.utils.toHex(web3.utils.toWei('1', 'gwei'))
		};

		return txObject;

	}
	async function getBalance_Improved(address){
		/* This function will get the balance of an address
		 * :param address: The address of a wallet
		 * :type address: hex string
		 *
		 * :return: balance of an address
		 * :rtype: int
		 */
		return web3.eth.getBalance(address);
	}


	async function writeTransaction_Improved(address, seller, context){
		/* This function will write a transaction to the bock chain
		 * :param address: hexadecimal string that represents the wallet address
		 * :type address: string
		 *
		 * :param context: map that will be used to store variables
		 * :type context: map
		 */
		const txObject = await createTxObject(address, seller);

		const tx = new Tx(txObject);
		tx.sign(Buffer.from(privateKeys.get(address),'hex'));

		const serializedTransaction = tx.serialize();
		const raw = serializedTransaction.toString('hex');

		const txHash = (await web3.eth.sendSignedTransaction(raw))["transactionHash"];

		const txObj = await web3.eth.getTransactionReceipt(txHash);

		context.purchase_price = {'purchase_price': parseInt(txObject.value, 16).toString()};
		context.gas_used = {'gas_used': web3.utils.toWei(txObj.gasUsed.toString(), 'gwei').toString()};
		context.receipt = {'receipt': txHash};
	}


	async function getAddresses_Improved(){
		/* This function will be used the public key wallet addresses from the block chain
		 * :return: addresses on the block chain
		 * :rtype: array
		 */
		var addresses = []
		const accounts = await web3.eth.getAccounts();
		for(let i = 0; i < accounts.length; i++){
			let myObj = { "address": accounts[i] };
			addresses.push(myObj);
		}
		return addresses
	}



	router.get('/', async (req, res) => {
		/*
		 * Root page for /dApp. Function will retrieve wallet addresses. 
		 */
		var context = {};
		context.jsscripts = ["verifyFunds.js", "icons.js"];
		context.Addresses = await getAddresses_Improved();
		console.log('printing context');
		console.log(context);
		res.render('dApp.handlebars', context);
	});


	router.get('/verifyFunds', async (req, res) => {
		/*
		 * Route that is called when user 'clicks' on 'Verify Funds'.  This will get balance for target wallet
		 * Will call getAddresses.
		 */
		var callbackcount = 0;
		var context = {};
		context.jsscripts = ["verifyFunds.js", "translate.js"];
		context.Addresses = await getAddresses_Improved();
		context.curr_Address = req.query;
		const balance = await getBalance_Improved(req.query.query);
		context.funds = {"balance": balance};
		res.render('dApp.handlebars', context);
	});

	router.post('/', async (req, res) => {
		/*
		 * This Route will receive form inputs when the user clicks on 'translate'.  It will deduct funds from
		 * the buyer to the seller.  The seller is Jaq's web address.
		 */
		var context = {}
		context.jsscripts = ["verifyFunds.js", "translate.js"];

		context.buyer = {'buyer': req.body.buyer};

		//Get Buyer's starting balance
		context.buyer_start_bal = {"buyer_start_bal": await getBalance_Improved(req.body.buyer)};

		//Execute a transaction
		await writeTransaction_Improved(req.body.buyer, seller, context);

		//Get Buyer's ending balance
		context.buyer_end_bal = {"buyer_end_bal": await getBalance_Improved(req.body.buyer)};

		//Get Addressed
		context.Addresses = await getAddresses_Improved();

		//Dummy Translated Text
		var text = "This is a dummy text, to be translated in the future";
		context.translated = {'translated_text': text};
		context.original = {'original_text': req.body.text};

		res.render('dApp.handlebars', context);

	});

	router.post('/jaq', async (req, res) => {
		/*
		 * This is the API call for Jaq's application.  The function will receive the buyers wallet address and execute a transaction
		 * It will transfer funds from the buyer to Jaq's wallet address.
		 */
		var context = {}
		context.jsscripts = ["verifyFunds.js", "translate.js"];

		//Get Buyer's starting balance
		context.buyer_start_bal = {"buyer_start_bal": await getBalance_Improved(req.body.buyer)};

		//Get Jaq's starting balance
		context.jaq_start_bal = {'jaq_start_bal': await getBalance_Improved(req.body.jaq)};

		//Execute a transaction
		await writeTransaction_Improved(req.body.buyer, req.body.jaq, context);

		//Get Addressed
		context.Addresses = await getAddresses_Improved();

		//Get Seller Ending Balance
		context.jaq_end_bal = {'jaq_end_bal': await getBalance_Improved(req.body.jaq)};

		//Check to see if funds deposited
		const fundDeposited = (context.jaq_end_bal.jaq_end_bal > context.jaq_start_bal.jaq_start_bal) ? true:false;

		res.status(200).json({
                	"jaq_start_bal": context.jaq_start_bal.jaq_start_bal,
                	"jaq_end_bal": context.jaq_end_bal.jaq_end_bal,
                	"txHash": context.receipt.receipt,
                	"fundDeposited": fundDeposited

		});

	});

	return router;

}();
