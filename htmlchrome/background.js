// 获取所有数据
function getData() {
    return new Promise((resolve) => {
        chrome.storage.sync.get("data", (result) => {
            const data = result.data || [];
            resolve(data);
        });
    });
}

// 保存所有数据
function saveData(data) {
    chrome.storage.sync.set({ data }, () => {
        console.log("Data saved to cloud.");
    });
}

// 监听来自options页面的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.type) {
        case "getData":
            getData().then((data) => {
                // 发送所有数据给options页面
                sendResponse({ type: "getDataResponse", data });
            });
            break;
        case "addData":
            getData().then((data) => {
                console.log('收到' + data)
                // 获取最大ID并自增
                const maxId = data.length === 0 ? 0 : Math.max(...data.map((item) => item.id));
                const newData = { id: maxId + 1, ...message.data };

                // 保存新数据并发送成功消息给options页面
                saveData([...data, newData]);
                sendResponse({ type: "addDataResponse" });
            });
            break;
        case "updateData":
            getData().then((data) => {
                // 找到要更新的数据并更新
                const newData = data.map((item) => {
                    if (item.id === message.data.id) {
                        return { ...item, ...message.data };
                    }
                    return item;
                });

                // 保存更新后的数据并发送成功消息给options页面
                saveData(newData);
                sendResponse({ type: "updateDataResponse" });
            });
            break;
        case "deleteData":
            getData().then((data) => {
                // 删除指定ID的数据
                const newData = data.filter((item) => item.id !== message.data.id);

                // 保存删除后的数据并发送成功消息给options页面
                saveData(newData);
                sendResponse({ type: "deleteDataResponse" });
            });
            break;
        default:
            break;
    }

    // 返回true表示异步响应
    return true;
});