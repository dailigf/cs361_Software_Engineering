module.exports = function () {
	//const seller = '0x1dF62f291b2E969fB0849d99D9Ce41e2F137006e';
	const private_Keys = new Map();
	private_Keys.set('0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1', '4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d');
	private_Keys.set('0xFFcf8FDEE72ac11b5c542428B35EEF5769C409f0', '6cbed15c793ce57650b9877cf6fa156fbef513c4e6134f022a85b1ffdd59b2a1');
	private_Keys.set('0x22d491Bde2303f2f43325b2108D26f1eAbA1e32b', '6370fd033278c143179d81c5526140625662b8daa446c22ee2d73db3707e620c');
	//private_Keys.set(seller,'b0057716d5917badaf911b193b12b910811c1497b5bada8d7711f758981c3773');
	//private_Keys.set('0x18D89A1F41829aBb070c89AAe91763dB46BCDa0D', '8bf73c44567ac0dd53d54c72691dfe349b022fe38e3618667dd0f50e631a7cd1');
	//
	
	//Keys for Ganache Graphical
	private_Keys.set('0x18D89A1F41829aBb070c89AAe91763dB46BCDa0D', '8bf73c44567ac0dd53d54c72691dfe349b022fe38e3618667dd0f50e631a7cd1');
	private_Keys.set('0xC53c7A63c134cd7b92d0Ea14Ed5e23f2f0a15C18', 'a4b000bff523fdc644e5b8df7fa4c36015a6e6f99edf5ee8774dc0d6f91c69ae');
	private_Keys.set('0xA90c5099abAb61FAD511e45cf0531C0417c48De0', '355717585d175d9fa2a77b8480093f94f56737eca1a5b755e8939a40a8547ee1');
	private_Keys.set('0xB69298340cBdE5A255f51acDadA0BaBF72d96Db6', '15fc02fe4d5bcaf328b823ea83f7d0539ff132f247355f72c9aee52e9275fc88');
	private_Keys.set('0x5BcB57B0f3e310eBB8291fb7E93B778E9b3E15AD', 'dccacfc4ada926b1132f58394581edf31ad3bf9a20be82a85bf41f7e483abe46');
	private_Keys.set('0x9fAe9D4a544d77D972029e14Fad754fED5F86aDF', '95442e0f6ac34ee4101599d3f5568da1c07a3d83761915ec3dc368d5992583b2');
	const seller = '0xc6EfbA1f45dD02294e4503F3dEFC6008cd7326dc';
	private_Keys.set(seller, '9b175370afbd39ef4b038676888a68b005590ef8d430a30c65d28284165d482a');


	const stripHexPrefix = require('strip-hex-prefix');
	var express = require('express');
	var router = express.Router();
	var Tx = require('ethereumjs-tx').Transaction;
  	//Web3
  	var Web3 = require('Web3');
  	const web3 = new Web3('http://127.0.0.1:7545');

	async function verifyFunds(address, context, complete){
		web3.eth.getBalance(address)
			.then(balance => {
				let myObj = {"balance":balance};
				context.funds = myObj;
				console.log('printing funds:');
				console.log(context);
				complete();
			});

	}

	async function getStartBalance(address, context, complete){
		web3.eth.getBalance(address, (err, balance) => {
			context.buyer_start_bal = {'buyer_start_bal': balance};
			complete();
		})
	}

	async function getEndBalance(address, context, complete){
		web3.eth.getBalance(address, (err, balance) => {
			context.buyer_end_bal = {'buyer_end_bal': balance};
			complete();
		})
	}

	async function writeTransaction(address, context, complete){
		const buyer_Key = Buffer.from(private_Keys.get(address),'hex');
		const purchase_Price = web3.utils.toWei('1', 'ether');
		let gas_used = 0;

		web3.eth.getTransactionCount(address, (err, txCount) => {
			//Build Transaction
			const txObject = {
				nonce: web3.utils.toHex(txCount),
				from: address,
				to: seller,
				value: web3.utils.toHex(web3.utils.toWei('1', 'ether')),
				gasLimit: '0x6691B7',
				gasPrice: web3.utils.toHex(web3.utils.toWei('1', 'gwei'))
			};

			console.log(txObject);

			//Sign the Transaction with buyers private Key
			const tx = new Tx(txObject);
			tx.sign(buyer_Key);

			const serializedTransaction = tx.serialize();
			const raw = serializedTransaction.toString('hex');

			//Broadcast the Transaction
			//var retObj = web3.eth.sendSignedTransaction(raw);
			//console.log(retObj);
			web3.eth.sendSignedTransaction(raw, (err, txHash) => {
				console.log('txHash: ', raw);
				console.log(txHash);
				web3.eth.getTransactionReceipt(txHash, (err, obj) => {
					//Get Buyer's starting balance
					getEndBalance(address, context, complete);
					gas_used = web3.utils.toWei(obj.gasUsed.toString(), 'gwei').toString();
					console.log(gas_used);
					console.log('purchase price: ', purchase_Price);
					context.purchase_price = {'purchase_price': purchase_Price};
					context.gas_used = {'gas_used': gas_used};
					context.receipt = {'receipt': txHash};
					complete();
				});
			});
		});

	}

	async function getAddresses(context, complete){
		var testData = []
		web3.eth.getAccounts()
			.then(fetchedAccounts=>{
				for(let i = 0; i < fetchedAccounts.length; i++){
					var myObj = {"address":fetchedAccounts[i]};
					testData.push(myObj);
				}
				context.Addresses = testData;
				complete();
			});
	}

	function searchWorkstation(res, mysql, context, searchString, complete) {
		/*Function will used the string input by the user to search for workstations
		 * that have a matchign substring*/
		var sql = "SELECT workstationID, hostName, os FROM Workstations WHERE hostName LIKE ? " +
			"UNION SELECT workstationID, hostName, os FROM Workstations WHERE os LIKE ?"
		var searchMe = "%" + searchString + "%";
		var inserts = [searchMe, searchMe];
		mysql.pool.query(sql, inserts, function (error, results, fields) {
			if (error) {
				res.write(JSON.stringify(error));
				res.end();
			}
			context.workstation = results;
			complete();
		});
	}


	router.get('/', function (req, res) {
		/*root page for workstations.  Calls getWorkstations() and getOperatingSystems to populate
		 * workstations.handlebars page.*/
		var callbackcount = 0;
		var context = {};
		context.jsscripts = ["verifyFunds.js", "icons.js"];
		var testData = []
		web3.eth.getAccounts()
			.then(fetchedAccounts=>{
				for(let i = 0; i < fetchedAccounts.length; i++){
					var myObj = {"address":fetchedAccounts[i]};
					testData.push(myObj);
				}
				context.Addresses = testData;
				console.log(context);
				console.log(context.Addresses)
				res.render('dApp.handlebars', context);
			});
	});


	router.get('/verifyFunds', function (req, res) {
		/*root page for workstations.  Calls getWorkstations() and getOperatingSystems to populate
		 * workstations.handlebars page.*/
		var callbackcount = 0;
		var context = {};
		context.jsscripts = ["verifyFunds.js", "translate.js"];
		getAddresses(context, complete);
		console.log('after asyn call')
		console.log(context);
		var arr = []
		context.curr_Address = req.query;
		//let balance = web3.eth.getBalance(req.query);
		verifyFunds(req.query.query, context, complete);

		function complete() {
			callbackcount++;
			if (callbackcount >= 2) {
				console.log(callbackcount)
				console.log(context);
				console.log('calling the renderer');
				res.render('dApp.handlebars', context);
			}
		}
	});

	router.get('/test', function (req, res) {
		/*When the user clicks on the update link for a target workstation, browser will 'GET'
		 * to this route.  Browser will supply the workstationID, which will be used in the 
		 * getWorkstation() function, it will then redirect to updateWorkstation page*/
		callbackcount = 0;
		context = {};
		//context.jsscripts = ["selectOS.js", "updateWorkstations.js"];
		//var mysql = req.app.get('mysql');
		console.log('calling get Addreses')
		getAddresses(context, complete)
		console.log('returned get Addreses')
		//getOperatingSystems(res, mysql, context, complete);
		function complete() {
			callbackcount++;
			if (callbackcount >= 1) {
				console.log(callbackcount)
				res.render('dApp.handlebars', context);
			}
		}

	});

	router.post('/', function (req, res) {
		/*When the user updates a worktation, browser will submit must a 'POST' request to this route
		 * The user supplied information will be used to update Workstations Table*/
		let callbackcount = 0;
		var context = {}
		context.jsscripts = ["verifyFunds.js", "translate.js"];

		const originalText = req.body.text;
		const buyer = req.body.buyer;
		context.buyer = {'buyer': buyer};
		const buyer_Key = Buffer.from(private_Keys.get(buyer),'hex');
		let buyer_start_bal = 0;
		let buyer_end_bal = 0;

		const purchase_Price = web3.utils.toWei('1', 'ether');
		let gas_used = 0;

		//web3.eth.getTransactionCount(buyer, (err, txCount) => {
		//	//Build Transaction
		//	const txObject = {
		//		nonce: web3.utils.toHex(txCount),
		//		from: buyer,
		//		to: seller,
		//		value: web3.utils.toHex(web3.utils.toWei('1', 'ether')),
		//		gasLimit: '0x6691B7',
		//		gasPrice: web3.utils.toHex(web3.utils.toWei('1', 'gwei'))
		//	};

		//	console.log(txObject);

		//	//Sign the Transaction with buyers private Key
		//	const tx = new Tx(txObject);
		//	tx.sign(buyer_Key);

		//	const serializedTransaction = tx.serialize();
		//	const raw = serializedTransaction.toString('hex');

		//	//Broadcast the Transaction
		//	//var retObj = web3.eth.sendSignedTransaction(raw);
		//	//console.log(retObj);
		//	web3.eth.sendSignedTransaction(raw, (err, txHash) => {
		//		console.log('txHash: ', raw);
		//		console.log(txHash);
		//		web3.eth.getTransactionReceipt(txHash, (err, obj) => {
		//			gas_used = obj.gasUsed;
		//			console.log(web3.utils.toWei(gas_used.toString(), 'gwei'));
		//			console.log('starting balance: ', buyer_start_bal)
		//			console.log('purchase price: ', purchase_Price);
		//		});
		//	});
		//});


		//Get Buyer's starting balance
		getStartBalance(buyer, context, complete);

		//Execute a transaction
		writeTransaction(buyer, context, complete);

		//Get Addressed
		getAddresses(context, complete);

		//Dummy Translated Text
		var text = "This is a dummy text, to be translated in the future";
		context.translated = {'translated_text': text};
		context.original = {'original_text': originalText};


		function complete() {
			callbackcount++;
			if (callbackcount >= 4) {
				console.log(callbackcount)
				console.log(context);
				res.render('dApp.handlebars', context);
			}
		}
	});

	return router;

}();
