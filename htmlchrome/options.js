// 获取DOM元素
const addForm = $('#add-form');
const wordTableBody = $('#word-table tbody');

// 定义API URL和token
const apiUrl = 'http://41.77.243.233:1337/api/words-lists';
const bearToken = '961b5b81ce5dc2942fd5578b7a105ee5aa423e2ff4ef939e23d2ad8ffaa43c259d6d04c3b990c76a80d81280a40bfdc799613c4791ff0524c5ed79d10a5d02464e989b5ca69bb0cfba3032c165a34aff772e9dd31dace325c2ffb43b9b0fdd01b8a1de8a69d586670ed4d7f684b2edf55b4a0c9ad6520fefc47d7cc01ae16066';

// 发送请求时使用的headers
const headers = {
  'Content-Type': 'application/json;charset=utf-8',
  'Authorization': `Bearer ${bearToken}`
};

// 获取所有数据并填充表格
$.ajax({
  url: apiUrl,
  headers,
  success: data => {
    data.data.forEach(word => addWordToTable(word));
  },
  error: error => console.error(error)
});

// 将新单词添加到表格中
addForm.on('submit', event => {
  event.preventDefault();

  const englishInput = $('#english-input');
  const chineseInput = $('#chinese-input');

  $.ajax({
    url: apiUrl,
    method: 'POST',
    headers,
    data: JSON.stringify({
      data: {
        english: englishInput.val(),
        chinese: chineseInput.val()
      }
    }),
    success: () => {
      alert('Word added successfully!');
      location.reload();
    },
    error: () => alert('Failed to add word.')
  });
});

// 编辑单词
function editWord(id, englishCell, chineseCell) {
  const english = englishCell.text();
  const chinese = chineseCell.text();

  const newEnglish = prompt('Enter new English word:', english);
  const newChinese = prompt('Enter new Chinese word:', chinese);

  if (newEnglish && newChinese) {
    $.ajax({
      url: `${apiUrl}/${id}`,
      method: 'PUT',
      headers,
      data: JSON.stringify({
        data: { english: newEnglish, chinese: newChinese }
      }),
      success: () => {
        alert('Word edited successfully!');
        location.reload();
      },
      error: () => alert('Failed to edit word.')
    });
  }
}

// 删除单词
function deleteWord(id, row) {
  if (confirm('Are you sure you want to delete this word?')) {
    $.ajax({
      url: `${apiUrl}/${id}`,
      method: 'DELETE',
      headers,
      success: () => {
        alert('Word deleted successfully!');
        row.remove();
      },
      error: error => {
        console.error(error);
        alert(`Failed to delete word: ${error.message}`);
      }
    });
  }
}

// 将单词添加到表格中
function addWordToTable(word) {
  const { id, attributes } = word;
  const row = $(`
    <tr>
      <td>${id}</td>
      <td>${attributes.english}</td>
      <td>${attributes.chinese}</td>
      <td>
        <button class="edit-btn">Edit</button>
        <button class="delete-btn">Delete</button>
      </td>
    </tr>
  `);

  // 编辑按钮
  const editButton = row.find('.edit-btn');
  editButton.on('click', () => editWord(id, row.find('td:eq(1)'), row.find('td:eq(2)')));

  // 删除按钮
  const deleteButton = row.find('.delete-btn');
  deleteButton.on('click', () => deleteWord(id, row));
  wordTableBody.append(row);
}
