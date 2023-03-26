chrome.browserAction.onClicked.addListener(function (tab) {
    //在匹配指定条件的标签页上执行 JavaScript 代码的方法
    chrome.tabs.executeScript({
        file: 'content.js'
    });
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action == "translate") {
        var dictionary = JSON.parse(localStorage.getItem("dictionary"));
        var text = request.text;
        var translatedText = translateText(text, dictionary);
        //允许在完成异步操作后向消息发送者发送响应结果
        sendResponse(translatedText);
    }
});

function translateText(text, dictionary) {
    var translatedText = text;
    for (var key in dictionary) {
        //用于处理字符串匹配和替换。它使用模式（pattern）描述要匹配的字符串，并提供了一组用于执行模式匹配操作的方法
        var regex = new RegExp('\\b' + key + '\\b', 'gi');
        translatedText = translatedText.replace(regex, dictionary[key]);
    }
    return translatedText;
}
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === "translate") {
        var dictionary = JSON.parse(localStorage.getItem("dictionary"));
        var text = request.text.toLowerCase().split(' ');
        var translation = '';
        for (var i = 0; i < text.length; i++) {
            var word = text[i].replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
            if (dictionary[word]) {
                translation += dictionary[word] + ' ';
            } else {
                translation += text[i] + ' ';
            }
        }
        sendResponse({ translation: translation.trim() });
    }
});

chrome.runtime.onInstalled.addListener(function (details) {
    if (details.reason === "install") {
        localStorage.setItem("dictionary", JSON.stringify({}));
    }
});