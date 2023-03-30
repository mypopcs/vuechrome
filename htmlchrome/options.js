// 获取表单和表格元素
const addForm = document.getElementById('add-form');
const wordTable = document.getElementById('word-table').querySelector('tbody');

// 定义API URL和token
const apiUrl = 'http://41.77.243.233:1337/api/words-lists';
const bearToken = '961b5b81ce5dc2942fd5578b7a105ee5aa423e2ff4ef939e23d2ad8ffaa43c259d6d04c3b990c76a80d81280a40bfdc799613c4791ff0524c5ed79d10a5d02464e989b5ca69bb0cfba3032c165a34aff772e9dd31dace325c2ffb43b9b0fdd01b8a1de8a69d586670ed4d7f684b2edf55b4a0c9ad6520fefc47d7cc01ae16066'
const headers = {
  'Content-Type': 'application/json;charset=utf-8',
  'Authorization': `Bearer ${bearToken}`
}


// 获取所有数据并填充表格
fetch(apiUrl, {
  headers: {
    'Authorization': `Bearer ${bearToken}`
  }
})
  .then(response => response.json())
  .then(data => {
    data.data.forEach(word => {
      addWordToTable(word);
    });
  })
  .catch(error => {
    console.error(error);
  });

// 将新单词添加到表格中
addForm.addEventListener('submit', event => {
  event.preventDefault();

  const englishInput = addForm.querySelector('#english-input');
  const chineseInput = addForm.querySelector('#chinese-input');
  console.log(englishInput.value)

  fetch(apiUrl, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify({
      "data": {
        "english": englishInput.value,
        "chinese": chineseInput.value
      }

    })
  })
});

// 编辑单词
function editWord(id, englishCell, chineseCell) {
  const english = englishCell.textContent;
  const chinese = chineseCell.textContent;

  const newEnglish = prompt('Enter new English word:', english);
  const newChinese = prompt('Enter new Chinese word:', chinese);

  if (newEnglish && newChinese) {
    fetch(`${apiUrl}/${id}`, {
      method: 'PUT',
      headers: headers,
      body: JSON.stringify({
        "data": {
          "english": newEnglish,
          "chinese": newChinese
        }
      })
    })
      .then(response => response.json())
      .then(data => {
        const word = data.data;
        englishCell.textContent = word.attributes.english;
        chineseCell.textContent = word.attributes.chinese;
      })
      .catch(error => {
        console.error(error);
      });
  }
}

// 删除单词
function deleteWord(id, row) {
  if (confirm('Are you sure you want to delete this word?')) {
    fetch(`${apiUrl}/${id}`, {
      method: 'DELETE',
      headers: headers,
    })
      .then(response => {
        if (response.status === 204) {
          row.remove();
        }
      })
      .catch(error => {
        console.error(error);
      });
  }
}

// 将单词添加到表格中
function addWordToTable(word) {
  const row = document.createElement('tr');
  const idCell = document.createElement('td');
  const englishCell = document.createElement('td');
  const chineseCell = document.createElement('td');
  const actionsCell = document.createElement('td');
  const editButton = document.createElement('button');
  const deleteButton = document.createElement('button');

  idCell.textContent = word.id;
  englishCell.textContent = word.attributes.english;
  chineseCell.textContent = word.attributes.chinese;
  editButton.textContent = 'Edit';
  deleteButton.textContent = 'Delete';

  editButton.addEventListener('click', () => {
    editWord(word.id, englishCell, chineseCell);
  });

  deleteButton.addEventListener('click', () => {
    deleteWord(word.id, row);
  });

  actionsCell.appendChild(editButton);
  actionsCell.appendChild(deleteButton);
  row.appendChild(idCell);
  row.appendChild(englishCell);
  row.appendChild(chineseCell);
  row.appendChild(actionsCell);

  wordTable.appendChild(row);
}