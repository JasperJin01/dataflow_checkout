
// 中期指标常量
export const midtermMetrics = {
  'PageRank': 6, // GTEPS
  'k-Clique': 1.5, // GTSPS
  'GCN': 1, // GOPS
};

// 数据集执行结果
export const PERFORMANCE_DATA = {
  'PageRank': [
    {
      Algorithm: 'PageRank',
      Dataset: 'Rmat-16',
      Vertices: Math.pow(2, 16),
      Edges: Math.pow(2, 20),
      'CPU-Time(s)': 0.182,
      'ACC-Time(s)': 0.004,
      'Speedup': 0.182 / 0.004,  // 45.5
      'GTSPS': 7.47603
    },
    {
      Algorithm: 'PageRank',
      Dataset: 'Rmat-17',
      Vertices: Math.pow(2, 17),
      Edges: Math.pow(2, 21),
      'CPU-Time(s)': 0.394,
      'ACC-Time(s)': 0.009,
      'Speedup': 0.394 / 0.009,  // ~43.78
      'GTSPS': 6.65543
    },
    {
      Algorithm: 'PageRank',
      Dataset: 'Rmat-18',
      Vertices: Math.pow(2, 18),
      Edges: Math.pow(2, 21),
      'CPU-Time(s)': 0.531,
      'ACC-Time(s)': 0.009,
      'Speedup': 0.531 / 0.009,  // 59
      'GTSPS': 6.617
    },
    {
      Algorithm: 'PageRank',
      Dataset: 'Rmat-19',
      Vertices: Math.pow(2, 19),
      Edges: Math.pow(2, 22),
      'CPU-Time(s)': 2.16,
      'ACC-Time(s)': 0.036,
      'Speedup': 2.16 / 0.036,  // 60
      'GTSPS': 6.102
    },
    {
      Algorithm: 'PageRank',
      Dataset: 'Rmat-20',
      Vertices: Math.pow(2, 20),
      Edges: Math.pow(2, 23),
      'CPU-Time(s)': 3.84,
      'ACC-Time(s)': 0.034,
      'Speedup': 3.84 / 0.034,  // ~112.94
      'GTSPS': 6.141
    }
  ],
  'k-Clique': [
    {
      Algorithm: 'k-Clique',
      Dataset: 'Rmat-16',
      Vertices: Math.pow(2, 16),
      Edges: Math.pow(2, 20),
      'CPU-Time(s)': 0.256,
      'ACC-Time(s)': 0.048,
      'Speedup': 0.256 / 0.048,  // ~5.33
      'GTSPS': 2.525
    },
    {
      Algorithm: 'k-Clique',
      Dataset: 'Rmat-17',
      Vertices: Math.pow(2, 17),
      Edges: Math.pow(2, 21),
      'CPU-Time(s)': 0.639,
      'ACC-Time(s)': 0.127,
      'Speedup': 0.639 / 0.127,  // ~5.03
      'GTSPS': 2.531
    },
    {
      Algorithm: 'k-Clique',
      Dataset: 'Rmat-18',
      Vertices: Math.pow(2, 18),
      Edges: Math.pow(2, 21),
      'CPU-Time(s)': 0.512,
      'ACC-Time(s)': 0.118,
      'Speedup': 0.512 / 0.118,  // ~4.34
      'GTSPS': 2.308
    },
    {
      Algorithm: 'k-Clique',
      Dataset: 'Rmat-19',
      Vertices: Math.pow(2, 19),
      Edges: Math.pow(2, 22),
      'CPU-Time(s)': 1.275,
      'ACC-Time(s)': 0.371,
      'Speedup': 1.275 / 0.371,  // ~3.44
      'GTSPS': 2.054
    },
    {
      Algorithm: 'k-Clique',
      Dataset: 'Rmat-20',
      Vertices: Math.pow(2, 20),
      Edges: Math.pow(2, 23),
      'CPU-Time(s)': 3.181,
      'ACC-Time(s)': 0.796,
      'Speedup': 3.181 / 0.796,  // ~4
      'GTSPS': 2.495
    }
  ],
  'GCN': [
    {
      Algorithm: 'GCN',
      Dataset: 'Rmat-16',
      Vertices: Math.pow(2, 16),
      Edges: Math.pow(2, 20),
      'CPU-Time(s)': 1.084,
      'ACC-Time(s)': 0.442,
      'Speedup': 1.084 / 0.442,  // ~2.45
      'GTSPS': 1.227
    },
    {
      Algorithm: 'GCN',
      Dataset: 'Rmat-17',
      Vertices: Math.pow(2, 17),
      Edges: Math.pow(2, 21),
      'CPU-Time(s)': 2.168,
      'ACC-Time(s)': 0.884,
      'Speedup': 2.168 / 0.884,  // ~2.45
      'GTSPS': 1.227
    },
    {
      Algorithm: 'GCN',
      Dataset: 'Rmat-18',
      Vertices: Math.pow(2, 18),
      Edges: Math.pow(2, 21),
      'CPU-Time(s)': 4.001,
      'ACC-Time(s)': 1.506,
      'Speedup': 4.001 / 1.506,  // ~2.66
      'GTSPS': 1.328
    },
    {
      Algorithm: 'GCN',
      Dataset: 'Rmat-19',
      Vertices: Math.pow(2, 19),
      Edges: Math.pow(2, 22),
      'CPU-Time(s)': 7.625,
      'ACC-Time(s)': 2.971,
      'Speedup': 7.625 / 2.971,  // ~2.57
      'GTSPS': 1.283
    },
    {
      Algorithm: 'GCN',
      Dataset: 'Rmat-20',
      Vertices: Math.pow(2, 20),
      Edges: Math.pow(2, 23),
      'CPU-Time(s)': 16.005,
      'ACC-Time(s)': 6.023,
      'Speedup': 16.005 / 6.023,  // ~2.66
      'GTSPS': 1.329
    }
  ]
};



