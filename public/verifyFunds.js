function verifyFunds(event){
	/*
	 * This function will be called when the user clicks on the "verify Funds" button
	 */
	event.preventDefault();
	var address = $('#address').val();
	let url = 'http://127.0.0.1:31337/dApp/verifyFunds?query=' + address;
	location.href = url;

}

function verifyFundsManual(event){
	/*
	 * This function will be called when the user clicks on the "verify Funds" button
	 */
	event.preventDefault();
	var address = $('#address-manual').val();
	let url = 'http://127.0.0.1:31337/dApp/verifyFunds?query=' + address;
	location.href = url;

}

function test(event){
	/*
	 * This function will be called when the user clicks on "translate"
	 */
	event.preventDefault();
	event.stopPropagation();
	if(document.forms["translate-form"]["buyer"].value.length == 0 || document.forms["translate-form"]["translateText"].value.length == 0){
		alert("Please select a wallet address and/or insert text to translate!");
	}else{
		let confirmAction = confirm("This will result in an irreversible transaction, your account will be deducted 1ETH.  Continue?");

		if(confirmAction){
			var url = 'http://127.0.0.1:31337/dApp';
			var buyer = $('#buyer').val();
			var text = $('#translateText').val();
			data = {
				buyer: buyer,
				text: text
			};
			$.redirect(url, data);
		}
	}

}

function followLink(event, link){
	event.preventDefault();
	event.stopPropagation();
	let confirmAction = confirm("You will be redirected to another page, wasting precious time.  Continue?");
	if(confirmAction){
		location.href = link;
	}
}

