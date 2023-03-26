//此代码将当前字典条目加载到选项页中，并添加编辑或删除现有条目的功能。它还包括用于添加新条目的表单，并处理向本地字典添加新条目的处理。
function loadDictionary() {
    var dictionary = JSON.parse(localStorage.getItem("dictionary"));
    var dictionaryList = document.getElementById('dictionary');
    dictionaryList.innerHTML = '';
    for (var key in dictionary) {
        var li = document.createElement('li');
        var english = document.createTextNode(key);
        var chinese = document.createTextNode(' - ' + dictionary[key]);
        var editButton = document.createElement('button');
        editButton.innerHTML = 'Edit';
        editButton.setAttribute('data-key', key);
        editButton.addEventListener('click', function () {
            var key = this.getAttribute('data-key');
            var value = prompt("Enter the new Chinese translation:", dictionary[key]);
            if (value !== null) {
                dictionary[key] = value;
                localStorage.setItem("dictionary", JSON.stringify(dictionary));
                loadDictionary();
            }
        });
        var deleteButton = document.createElement('button');
        deleteButton.innerHTML = 'Delete';
        deleteButton.setAttribute('data-key', key);
        deleteButton.addEventListener('click', function () {
            var key = this.getAttribute('data-key');
            delete dictionary[key];
            localStorage.setItem("dictionary", JSON.stringify(dictionary));
            loadDictionary();
        });
        li.appendChild(english);
        li.appendChild(chinese);
        li.appendChild(editButton);
        li.appendChild(deleteButton);
        dictionaryList.appendChild(li);
    }
}

function addEntry() {
    var dictionary = JSON.parse(localStorage.getItem("dictionary"));
    var english = document.getElementById('english').value;
    var chinese = document.getElementById('chinese').value;
    if (english && chinese) {
        dictionary[english] = chinese;
        localStorage.setItem("dictionary", JSON.stringify(dictionary));
        document.getElementById('english').value = '';
        document.getElementById('chinese').value = '';
        loadDictionary();
    }
}

document.getElementById('add').addEventListener('click', addEntry);

loadDictionary();