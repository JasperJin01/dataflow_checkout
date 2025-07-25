function parseCSRString(csrString) {
  // Split the string into lines and trim whitespace
  const lines = csrString.split('\n').map(line => line.trim());

  // Extract numNodes
  const numNodesMatch = lines[0].match(/Master vertex count: (\d+)/);
  if (!numNodesMatch) {
    throw new Error('Invalid format: Could not parse numNodes');
  }
  // const numNodes = parseInt(numNodesMatch[1], 10);

  // Find and extract rowPtr
  let rowPtr = [];
  let i = 1;
  if (lines[i].startsWith('Vertex Index (CSR row pointers):')) {
    i++;
    let rowPtrLine = '';
    while (i < lines.length && !lines[i].startsWith('Adjacency List')) {
      rowPtrLine += lines[i] + ' ';
      i++;
    }
    rowPtr = rowPtrLine
      .trim()
      .split(/\s+/)
      .map(num => parseInt(num, 10))
      .filter(num => !isNaN(num));
  }
  // 待判断是否需要numNodes
  const numNodes = rowPtr.length;
  if (rowPtr.length !== numNodes) {
    throw new Error(`rowPtr length (${rowPtr.length}) does not match numNodes (${numNodes})`);
  }

  // Find and extract colIndices
  let colIndices = [];
  if (i < lines.length && lines[i].startsWith('Adjacency List (CSR column indices):')) {
    i++;
    let colIndicesLine = '';
    while (i < lines.length) {
      colIndicesLine += lines[i] + ' ';
      i++;
    }
    colIndices = colIndicesLine
      .trim()
      .split(/\s+/)
      .map(num => parseInt(num, 10))
      .filter(num => !isNaN(num));
  }
  if (colIndices.length === 0) {
    throw new Error('No valid colIndices found');
  }

  return { rowPtr, colIndices };
}

function parseVertexLabels(labelString, numNodes, baseId) {
  const lines = labelString.split('\n').map(line => line.trim()).filter(line => line);
  const labels = new Map();

  // 检测格式：是否有标签值
  const isFullFormat = lines.some(line => /\s/.test(line));

  if (isFullFormat) {
    // 完整格式：ID 标签
    lines.forEach(line => {
      const [id, label] = line.split(/\s+/).map(num => parseInt(num, 10));
      if (!isNaN(id) && !isNaN(label)) {
        labels.set(id, label);
      }
    });
  } else {
    // 仅风险节点：列出的 ID 为风险节点（标签 1）
    const riskIds = lines.map(line => parseInt(line, 10)).filter(id => !isNaN(id));
    riskIds.forEach(id => labels.set(id, 1));
    // 其他节点为普通节点（标签 0）
    for (let i = 0; i < numNodes; i++) {
      const id = baseId + i;
      if (!labels.has(id)) {
        labels.set(id, 0);
      }
    }
  }

  return labels;
}

function csrToVisNetwork(rowPtr, colId, labelString) {
  const numNodes = rowPtr.length;
  if (numNodes === 0) {
    throw new Error('rowPtr 数组为空');
  }

  // 提取节点 ID
  const nodeIds = Array.from({ length: numNodes }, (_, i) => i); // 假设从 0 开始
  const baseId = 0;

  // id == index 从0开始


  // 解析标签
  const labels = parseVertexLabels(labelString, numNodes, baseId);

  // 生成节点数组
  const nodes = nodeIds.map(id => {
    const labelValue = labels.get(id) || 0;
    return {
      id,
      label: id.toString(),
      color: labelValue === 1 ? 'red' : 'blue',
    };
  });

  // 生成边数组
  const edges = [];
  for (let i = 0; i < numNodes; i++) {
    const start = rowPtr[i];
    const end = i + 1 < numNodes ? rowPtr[i + 1] : colId.length;
    for (let j = start; j < end; j++) {
      edges.push({ from: i, to: colId[j] });
    }
  }

  return { nodes, edges };
}



// Parse and convert the CSR string to vis-network data
export function getVisNetworkData(csrString, labelString) {
  const { rowPtr, colIndices } = parseCSRString(csrString);
  return csrToVisNetwork(rowPtr, colIndices, labelString);
}




export function getVisNetworkDataInput(rowPtr, colId, labelString) {
  return csrToVisNetwork(rowPtr, colId, labelString);
}
