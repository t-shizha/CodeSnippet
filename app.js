addScript();

var div = document.createElement('div');
div.setAttribute("id", "real-api-usage");
document.getElementById("main").appendChild(div);

var uid = getUidName();
getFromWebAPI(uid, div, renderRequestResult);

function getFromWebAPI(uid, resultDiv, callback) {
    var xHttp = new XMLHttpRequest();
    xHttp.onreadystatechange = function (e) {
        if (xHttp.readyState == 4){
            if(xHttp.status == 200){
                callback(resultDiv, this.responseText);
            }
            else{
                console.log("Fail to load code snippet for uid:" + uid);
                console.log(e);
            }
        }
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

var realApiUsageCount = 0;
var realApiUsageCurrent = 0;
function renderRequestResult(resultDiv, responses) {
    try {
        // set raw content
        var info = JSON.parse(responses);
        var numOfItems = info.length;
        realApiUsageCount = numOfItems;
        realApiUsageCurrent = 1;
        var content = "<hr/><h2>Real API Usage :</h2>";
        content += "<p>This is the real code snippet (from public github repo) that uses this API:</p>";
        content += "<div><button class='button is-primary' onclick='previousSnippet()'>👈 Previous Snippet</button>";
        content += "<button style='position: absolute; left: 45%; transform: translateX(-50%)' class='button is-success'>👍</button>";
        content += "<button style='position: absolute; left: 55%; transform: translateX(-50%)' class='button is-info'>👎</button>";
        content += "<button style='float: right' class='button is-primary' onclick='nextSnippet()'>Next Snippet 👉</button></div>"
        for (var i = 0; i < numOfItems; ++i) {
            var gitUrl = info[i].gitUrl;
            var codesnippet = info[i].codeSnippet;
            var start = info[i].startLineInCodeSnippet;
            var end = info[i].endLineInCodeSnippet;

            content += `<div id='real-api-usage-${i + 1}'>`;
            content += `<pre class='wrap'><code class='csharp lang-csharp' dir='ltr' highlight-lines='${start}-${end}' giturl='${gitUrl}'>`;
            content += deIndent(codesnippet);
            content += "</code></pre>";
            content += "</div>";
        }
        resultDiv.innerHTML = content;

        // set hidden
        updateSnippet();

        // add real api usage customized styles
        window.addEventListener('real-api-usage-highlighted', addGitUrl, true);
        
        // leverage existing code to highlight, add code header
        var event = new Event('real-api-usage-loaded');
        window.dispatchEvent(event);
    }
    catch(e){
        console.log(e);
        resultDiv.innerHTML = "No Smaple Code!";
    }
}

function addScript(){ 
    var script = document.createElement('script');
    script.innerHTML = `
${previousSnippet.toString()}
${nextSnippet.toString()}
${updateSnippet.toString()}
`;
    document.body.appendChild(script);
}


function previousSnippet(){ 
    realApiUsageCurrent--;
    if(realApiUsageCurrent <= 0) realApiUsageCurrent = 1;
    updateSnippet();
}
function nextSnippet(){ 
    realApiUsageCurrent++;
    if(realApiUsageCurrent > realApiUsageCount) realApiUsageCurrent = realApiUsageCount;
    updateSnippet();
}
function updateSnippet(){
    var snippets = document.querySelectorAll("div[id^='real-api-usage-']");
    snippets.forEach(snippet => {
        snippet.hidden = false;
    });
    var current = document.querySelector(`div#real-api-usage-${realApiUsageCurrent}`);
    current.hidden = true;
}

function addGitUrl() {
    var codes = document.querySelectorAll("div#real-api-usage code[giturl]");
    for (var i = 0; i < codes.length; ++i) {
        var code = codes[i];
        var gitUrl = code.getAttribute("giturl");
        var header = code.parentElement.previousElementSibling;

        // git name
        var lang = header.querySelector("span.language");
        // https://github.com/Azure-Samples/gov-intelligent-mission/blob/master
        var name = gitUrl.slice(19, gitUrl.indexOf('blob') - 1);
        lang.innerHTML = lang.innerHTML + " - from " + name;

        // git url
        var button = header.querySelector("button");
        var gitLink = document.createElement("span");
        gitLink.setAttribute("class", "action");
        gitLink.innerHTML = `<a href='${gitUrl}' target='_blank'>View Source Code</a>`;
        header.insertBefore(gitLink, button);
    }
}

function deIndent(code) {
    let lines = code.split(/\r?\n/);
    let count = Number.MAX_SAFE_INTEGER;
    for(var i = 1; i<lines.length; i++){
        count = Math.min(count, lines[i].search(/[^ ]/));
    }

    if(count == Number.MAX_SAFE_INTEGER){
        return code;
    }
    else{
        return lines.map( (line,i) => i==0? line : line.slice(count)).join("\r\n");
    }
}
