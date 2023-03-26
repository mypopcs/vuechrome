//此代码侦听单击“翻译”按钮并向后台发送消息.js脚本带有“翻译”操作和要翻译的英文文本然后，它等待来自后台脚本的响应，其中包含翻译的中文文本，并使用响应更新“翻译”文本区域。
//该代码还会侦听单击“编辑词典”按钮，并打开选项页面以管理本地词典。
document.getElementById('translate').addEventListener('click', function() {
    var text = document.getElementById('text').value;
    chrome.runtime.sendMessage({action: "translate", text: text}, function(response) {
      document.getElementById('translation').value = response;
    });
  });
  
  document.getElementById('edit').addEventListener('click', function() {
    chrome.runtime.openOptionsPage();
  });