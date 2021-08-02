function selectApplication(application) {
    var applications = document.querySelector('#application-selector');
    console.log(application);
    applications.value = application;
}

function verifyFunds(event){
	event.preventDefault();
	var address = $('#address').val();
	let url = 'http://127.0.0.1:31337/dApp/verifyFunds?query=' + address;
	location.href = url;

	//$.ajax({
	//	url:		'/dApp/verifyFunds',
	//	type:		'GET',
	//	data:		{query: address},
	//	success:	function(response){
	//		console.log(response);
	//	}	
	//})
}

function test(event){
	event.preventDefault();
	event.stopPropagation();
	alert('clicked translate');

	var url = 'http://127.0.0.1:31337/dApp';
	var buyer = $('#buyer').val();
	var text = $('#translateText').val();
	data = {
		buyer: buyer,
		text: text
	};
	alert(url);
	alert(buyer);
	alert(text);
	$.redirect(
		url,
		data
	);
}

