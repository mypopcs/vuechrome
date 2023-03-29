// 获取表单和表格元素
const addForm = document.getElementById('add-form');
const wordTable = document.getElementById('word-table').querySelector('tbody');

// 获取API URL
const apiUrl = 'http://41.77.243.233:1337/api/words-lists';

// 获取所有数据并填充表格
const xhr = new XMLHttpRequest();
xhr.open('GET', apiUrl);
xhr.onload = function () {
  if (xhr.status === 200) {
    const data = JSON.parse(xhr.responseText).data;
    data.forEach(word => {
      addWordToTable(word);
    });
  }
};
xhr.send();

// 将新单词添加到表格中
addForm.addEventListener('submit', event => {
  event.preventDefault();

  const englishInput = addForm.querySelector('#english-input');
  const chineseInput = addForm.querySelector('#chinese-input');

  const xhr = new XMLHttpRequest();
  xhr.open('POST', apiUrl);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.onload = function () {
    if (xhr.status === 201) {
      const word = JSON.parse(xhr.responseText).data;
      addWordToTable(word);
      englishInput.value = '';
      chineseInput.value = '';
    }
  };
  const data = JSON.stringify({
    english: englishInput.value,
    chinese: chineseInput.value
  });
  xhr.send(data);
});

// 编辑单词
function editWord(id, englishCell, chineseCell) {
  const english = englishCell.textContent;
  const chinese = chineseCell.textContent;

  const newEnglish = prompt('Enter new English word:', english);
  const newChinese = prompt('Enter new Chinese word:', chinese);

  if (newEnglish && newChinese) {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', `${apiUrl}/${id}`);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function () {
      if (xhr.status === 200) {
        const data = JSON.parse(xhr.responseText).data;
        englishCell.textContent = data.attributes.english;
        chineseCell.textContent = data.attributes.chinese;
      }
    };
    const data = JSON.stringify({
      english: newEnglish,
      chinese: newChinese
    });
    xhr.send(data);
  }
}

// 删除单词
function deleteWord(id, row) {
  if (confirm('Are you sure you want to delete this word?')) {
    const xhr = new XMLHttpRequest();
    xhr.open('DELETE', `${apiUrl}/${id}`);
    xhr.onload = function () {
      if (xhr.status === 204) {
        row.remove();
      }
    };
    xhr.send();
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