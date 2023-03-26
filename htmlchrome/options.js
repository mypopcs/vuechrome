$(function () {
    // 登录表单的提交事件
    $('#loginForm').on('submit', function (e) {
        e.preventDefault();    // 阻止默认提交行为
        var username = $('#username').val();
        var password = $('#password').val();
        $.ajax({
            url: 'https://api.example.com/login',    // 后端API请求地址
            type: 'POST',
            data: {
                username: username,
                password: password
            },
            success: function (data) {
                if (data.success) {     // 登录成功
                    // 隐藏登录表单，显示管理表单
                    $('#loginForm').hide();
                    $('#managementForm').show();

                    // 获取已经存储的数据并展示在表格中
                    chrome.storage.sync.get(null, function (items) {
                        $.each(items, function (key, value) {
                            $('#tableBody').append('<tr><td>' + key + '</td><td>' + value + '</td></tr>');
                        });
                    });
                } else {                // 登录失败
                    alert(data.message);   // 弹出错误提示信息
                }
            }
        });
    });

    // 数据管理表单的提交事件
    $('#form').on('submit', function (e) {
        e.preventDefault();       // 阻止默认提交行为
        var data = $('#data').val();
        var id = $('button:focus').attr('id');   // 获取当前点击的按钮ID
        if (id === 'addBtn') {      // 添加数据
            $.ajax({
                url: 'https://api.example.com/data',
                type: 'POST',
                data: {
                    data: data
                },
                success: function (data) {
                    var newId = parseInt(data.id);
                    chrome.storage.sync.set({ [newId]: data.data }, function () {
                        $('#tableBody').append('<tr><td>' + newId + '</td><td>' + data.data + '</td></tr>');
                    });
                }
            });
        } else if (id === 'updateBtn') {     // 修改数据
            var selectedRow = $('#tableBody tr.selected');
            if (!selectedRow.length) {
                alert('Please select a row to update');
                return;
            }
            var selectedId = selectedRow.find('td:first-child').text();
            $.ajax({
                url: 'https://api.example.com/data/' + selectedId,
                type: 'PUT',
                data: {
                    data: data
                },
                success: function () {
                    chrome.storage.sync.set({ [selectedId]: data }, function () {
                        selectedRow.find('td:last-child').text(data);
                    });
                }
            });
        } else if (id === 'deleteBtn') {    // 删除数据
            var selectedRow = $('#tableBody tr.selected');
            if (!selectedRow.length) {
                alert('Please select a row to delete');
                return;
            }
            var selectedId = selectedRow.find('td:first-child').text();
            $.ajax({
                url: 'https://api.example.com/data/' + selectedId,
                type: 'DELETE',
                success: function () {
                    chrome.storage.sync.remove(selectedId, function () {
                        selectedRow.remove();
                    });
                }
            });
        }
    });

    // 选中行的样式变化
    $('#tableBody').on('click', 'tr', function () {
        $('#tableBody tr').removeClass('selected');
        $(this).addClass('selected');
        var data = $(this).find('td:last-child').text();
        $('#data').val(data);
    });

    // 导入和导出功能
    $('#importBtn').on('click', function () {
        var input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = function () {
            var file = this.files[0];
            var reader = new FileReader();
            reader.onload = function () {
                var data = JSON.parse(reader.result);
                $.ajax({
                    url: 'https://api.example.com/data/import',
                    type: 'POST',
                    data: data,
                    success: function () {
                        chrome.storage.sync.clear(function () {
                            chrome.storage.sync.set(data, function () {
                                location.reload();
                            });
                        });
                    }
                });
            };
            reader.readAsText(file);
        };
        input.click();
    });

    $('#exportBtn').on('click', function () {
        chrome.storage.sync.get(null, function (items) {
            var json = JSON.stringify(items);
            var blob = new Blob([json], { type: 'application/json' });
            var url = URL.createObjectURL(blob);
            chrome.downloads.download({
                url: url,
                filename: 'data.json'
            });
        });
    });
});