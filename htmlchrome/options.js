const apiBaseUrl = 'http://41.77.243.233:1337/api/words-lists';
const headers = {
  'Content-Type': 'application/json;charset=utf-8',
  'Authorization': `Bearer ${'961b5b81ce5dc2942fd5578b7a105ee5aa423e2ff4ef939e23d2ad8ffaa43c259d6d04c3b990c76a80d81280a40bfdc799613c4791ff0524c5ed79d10a5d02464e989b5ca69bb0cfba3032c165a34aff772e9dd31dace325c2ffb43b9b0fdd01b8a1de8a69d586670ed4d7f684b2edf55b4a0c9ad6520fefc47d7cc01ae16066'}`
};

const api = {
  getWords: () => $.ajax({ url: apiBaseUrl, headers }),
  searchWords: query => $.ajax({ url: `${apiBaseUrl}?filter[english_contains]=${query}`, headers }),
  addWord: data => $.ajax({ url: apiBaseUrl, method: 'POST', headers, data: JSON.stringify({ data }) }),
  updateWord: (id, data) => $.ajax({ url: `${apiBaseUrl}/${id}`, method: 'PUT', headers, data: JSON.stringify({ data }) }),
  deleteWord: id => $.ajax({ url: `${apiBaseUrl}/${id}`, method: 'DELETE', headers })
};

function validateWord(english, chinese) {
  if (!english || !chinese) {
    alert('English and Chinese fields are required.');
    return false;
  }
  return true;
}

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

  const editButton = row.find('.edit-btn');
  editButton.on('click', () => editWord(id, row.find('td:eq(1)'), row.find('td:eq(2)')));

  const deleteButton = row.find('.delete-btn');
  deleteButton.on('click', () => deleteWord(id, row));
  $('#word-table tbody').append(row);
}

function editWord(id, englishCell, chineseCell) {
  const english = englishCell.text().trim();
  const chinese = chineseCell.text().trim();

  if (validateWord(english, chinese)) {
    const newEnglish = prompt('Enter new English word:', english);
    const newChinese = prompt('Enter new Chinese word:', chinese);

    if (newEnglish && newChinese) {
      api.updateWord(id, { english: newEnglish, chinese: newChinese })
        .then(() => { alert('Word edited successfully!'); location.reload(); })
        .catch(() => alert('Failed to edit word.'));
    }
  }
}

function deleteWord(id, row) {
  if (confirm('Are you sure you want to delete this word?')) {
    api.deleteWord(id)
      .then(() => { alert('Word deleted successfully!'); row.remove(); })
      .catch(error => { console.error(error); alert(`Failed to delete word: ${error.message}`); });
  }
}

function exportToExcel(data, filename) {
  const header = Object.keys(data[0]);
  const worksheet = XLSX.utils.json_to_sheet(data, { header });
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  XLSX.writeFile(workbook, filename);
}

function importFromExcel(file) {
  const reader = new FileReader();
  reader.onload = event => {
    const data = new Uint8Array(event.target.result);
    const workbook = XLSX.read(data, { type: 'array' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    // Get rid of the first row (header)
    rows.shift();

    rows.forEach(row => {
      api.addWord({ english: row[1], chinese: row[2] })
        .then(() => console.log(`Word with ID ${row[0]} added successfully.`))
        .catch(error => console.error(`Failed to add word with ID ${row[0]}: ${error.message}`));
    });

    location.reload();
  };
  reader.readAsArrayBuffer(file);
}


$(function () {
  // 显示单词列表
  api.getWords()
    .then(data => data.data.forEach(addWordToTable))
    .catch(error => console.error(error));

  // 搜索单词
  $('#search-form').on('submit', event => {
    event.preventDefault();
    const searchQuery = $('#search-input').val().trim();
    if (!searchQuery) return;

    api.searchWords(searchQuery)
      .then(data => {
        $('#word-table tbody').empty();
        if (data.data.length === 0) {
          alert('No matching words found.');
        } else {
          data.data.forEach(addWordToTable);
        }
      })
      .catch(error => console.error(error));
  });

  // 添加单词
  $('#add-form').on('submit', event => {
    event.preventDefault();
    const english = $('#english-input').val().trim();
    const chinese = $('#chinese-input').val().trim();
    if (validateWord(english, chinese)) {
      api.addWord({ english, chinese })
        .then(data => { alert('Word added successfully!'); addWordToTable(data.data); })
        .catch(() => alert('Failed to add word.'));
    }
  });

  // 导出单词列表为Excel文件
  $('#export-btn').on('click', () => {
    api.getWords()
      .then(data => {
        const words = data.data;
        const formattedData = words.map(word => ({
          'ID': word.id,
          'English': word.attributes.english,
          'Chinese': word.attributes.chinese
        }));
        exportToExcel(formattedData, 'words.xlsx');
      })
      .catch(error => console.error(error));
  });

  // 导入Excel中的单词
  $('#import-btn').on('change', event => {
    const file = event.target.files[0];
    if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      importFromExcel(file);
    } else {
      alert('Please choose a valid Excel file.');
    }
  });
});