export function formatTabularData(data) {
  return data.split('\n').map(line => {
    // 分割每一行的列（按制表符分割）
    const columns = line.split('\t');

    // 计算每列的最大宽度（基于标题行）
    if (line === data.split('\n')[0]) {
      const headerColumns = line.split('\t');
      const columnWidths = headerColumns.map(col => col.length);
      return columns.map((col, i) => col.padEnd(columnWidths[i])).join('  ');
    }

    // 对齐数据行
    const headerLine = data.split('\n')[0];
    const headerColumns = headerLine.split('\t');
    const columnWidths = headerColumns.map(col => col.length);

    return columns.map((col, i) => {
      // 特殊处理空列
      if (col === undefined || col === '') return ' '.repeat(columnWidths[i]);
      return col.padEnd(columnWidths[i]);
    }).join('  ');
  }).join('\n');
}

export function formatTableData(input) {
  // 分割成行
  const rows = input.split('\n').filter(row => row.trim() !== '');

  // 分割每行成列
  const columns = rows.map(row => row.split('\t'));

  // 计算每列的最大宽度
  const colWidths = columns[0].map((_, i) =>
    Math.max(...columns.map(row => (row[i] || '').length))
  );

  // 格式化每行
  const formattedRows = columns.map(row =>
    row.map((cell, i) =>
      (cell || '').padEnd(colWidths[i]) // 用空格填充到列宽
    ).join('  ') // 用两个空格分隔列
  );

  return formattedRows.join('\n');
}
