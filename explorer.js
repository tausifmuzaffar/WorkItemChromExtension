var sfdcAuth;

chrome.app._inject_scope = "data_explorer_test";

function getParameterByName(name, url) {
	if (!url) url = window.location.href;
	name = name.replace(/[\[\]]/g, "\\$&");
	var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
	results = regex.exec(url);
	if (!results) return null;
	if (!results[2]) return '';
	return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function docReady() {
	sfdcAuth = new OAuth2('sfdc', {
	  client_id: '3MVG9_AA.i9MRGPCdaTV2Mrj71NS1aoVL6ua4b2nE7SPks43BdRYDqe1GLMZDKJyu59dFbsKUOIKxZdFscOiS',
	  client_secret: '6329138176269752726',
	  api_scope: 'full'
	});

	sfdcAuth.authorize(function(error) {
		if(typeof(error)!='undefined') {
			alert(error);
		}

		var soqlWork = "SELECT Name, id, Status__c, Subject__c, Sprint_Name__c, Type__c " +
						"FROM ADM_Work__c " +
						"WHERE Assignee__c = '005B00000018XXj' AND Status__c <> 'Closed' " +
						"LIMIT 100";
		var _data_service_url = sfdcAuth.get('instance_url') +"/services/data/v26.0/query/?q=" + soqlWork;
		var _chatterURL = sfdcAuth.get('instance_url') +"/services/data/v39.0/chatter/feeds/record/a07B0000002bpVVIAY/feed-elements";

		$.ajax({
			url: _data_service_url,
			cache: false,
			type: 'GET',
			dataType: 'json',
			headers: {'Authorization': 'OAuth ' + sfdcAuth.getAccessToken()},
			//data: data,
			success:  function(data){
				console.log(data);
				var source   = $("#workrecord-list-template").html();
				t_accounts = Handlebars.compile(source);
				var html = t_accounts(data);
				$("#content").append(html);
			}
		});
	});

	$("#submitChatter").click(function() {
		sfdcAuth = new OAuth2('sfdc', {
		  client_id: '3MVG9_AA.i9MRGPCdaTV2Mrj71NS1aoVL6ua4b2nE7SPks43BdRYDqe1GLMZDKJyu59dFbsKUOIKxZdFscOiS',
		  client_secret: '6329138176269752726',
		  api_scope: 'full'
		});
		sfdcAuth.authorize(function(error) {
			if(typeof(error)!='undefined') {
				alert(error);
			}
			var _postChatterURL = sfdcAuth.get('instance_url') +"/services/data/v39.0/chatter/feed-elements?feedElementType=FeedItem&subjectId=a079A000000OlRLQA0&text="+$("#text-input-01").val();
			$.ajax({
				url: _postChatterURL,
				cache: false,
				type: 'POST',
				dataType: 'json',
				headers: {'Authorization': 'OAuth ' + sfdcAuth.getAccessToken()},
				//data: data,
				success:  function(data){
					console.log(data);
				}
			});
		});
	});

	$("#clearToken").click(function() {
		alert('Please logout of any existing SF sessions to use an another account');
		sfdcAuth.clearAccessToken();
		location.reload();
	});
}

$(docReady);