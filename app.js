
var div = document.createElement('div');
div.setAttribute("id", "result");
document.getElementById("main").appendChild(div);
var uid = getUidName();
getFromWebAPI(uid, div, renderRequestResult);


function getFromWebAPI(uid, resultDiv, callback) {

	var xHttp = new XMLHttpRequest();
	xHttp.onreadystatechange = function () {
		if (xHttp.readyState == 4 && xHttp.status == 200)
			callback(resultDiv, this.responseText);
	};
	xHttp.open("get", "https://realapiusage.azurewebsites.net/api/" + uid);
	xHttp.send();
}

function getUidName() {
	const metas = document.getElementsByTagName('meta');
	for (let i = 0; i < metas.length; ++i) {
		if (metas[i].getAttribute('name') === 'ms.assetid')
			return metas[i].getAttribute('content');
	}
}

function renderRequestResult(resultDiv, responses) {
	try {
		var info = JSON.parse(responses);
		var numOfItems = info.length;
		var content = "";
		for (var i = 0; i < numOfItems; ++i) {
			var startLine = info[i].startLineInCodeSnippet;
			var endLine = info[i].endLineInCodeSnippet;
			var invoExpression = info[i].invoExpression;
			var gitUrl = info[i].gitUrl;
			var url = info[i].url;
			content += "<h2>Sample " + (i + 1) + ":</h2>";
			content += "<h4>Start-End Line: " + startLine + "-" + endLine + "</h4>";
			content += "<h4>Invocation Expression: " + invoExpression + "</h4>";
			content += "<a target='_blank' href='" + gitUrl + "'>See Complete Code on Github!</a><br>";
			content += "<a target='_blank' href='" + url + "'>Docs</a>";
			var codesnippet = info[i].codeSnippet;
			content += "<pre class='wrap'><code class='csharp lang-csharp' dir='ltr'>";
			content += codesnippet;
			content += "</code></pre><br>";
		}

		resultDiv.innerHTML = content;
	}
	catch{
		resultDiv.innerHTML = "No Smaple Code!";
	}
}
