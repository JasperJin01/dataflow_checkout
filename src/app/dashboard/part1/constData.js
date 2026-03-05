export const URL_MAPS = {
  algorithm: {
    'PageRank': 'pr',
    'ViT': 'vit'
  },
  dataset: {
    'Rmat-16': 'rmat16',
    'Rmat-18': 'rmat18',
    'Rmat-19': 'rmat19',
    'Rmat-20': 'rmat20',
    'ImageNet': 'imagenet',
    'DriveSeg': 'driveseg'
  },
  platform: {
    'CPU': 'cpu',
    'GPU': 'gpu',
    'FPGA': 'fpga',
    'DSA': 'dsa'
  }
};

// NOTE run/log 控制字典
export function getRunMode(platform, algorithm, dataset) {
  // 读取全局环境变量，默认为 simulation
  const executionMode = process.env.NEXT_PUBLIC_EXECUTION_MODE || 'simulation';
  
  // 如果是模拟模式，全部返回 log
  if (executionMode === 'simulation') {
    return 'log';
  }

  // 后端模式下，只有支持的组合才返回 run
  // FPGA PageRank 使用实时执行模式
  if (platform === 'FPGA') {
      return 'run';
  }

  if (platform === 'CPU' && algorithm === 'PageRank') {
    return 'run';
  }

  // DSA PageRank 也支持
  if (platform === 'DSA' && algorithm === 'PageRank') {
    return 'run';
  }

  // TODO CPU - VIT 需要处理！
  if (platform === 'CPU' && algorithm === 'ViT') {
    return 'log';
  }

  // GPU需要依赖云服务器？
  return 'log';
}



// 单机环境下的性能指标数据
export const PERFORMANCE_DATA = {
  'PageRank': {
    'CPU': [
      {
        'Dataset': 'Rmat-18',
        'Baseline-Time(s)': 62.5,
        'Dataflow-Time(s)': 18.79,
        'Baseline-Throughput': 0.0029, // GTEPS
        'Dataflow-Throughput': 0.0139  // GTEPS
      },
      {
        'Dataset': 'Rmat-19',
        'Baseline-Time(s)': 139.37,
        'Dataflow-Time(s)': 37.86,
        'Baseline-Throughput': 0.0026, // GTEPS
        'Dataflow-Throughput': 0.0149  // GTEPS
      },
      {
        'Dataset': 'Rmat-20',
        'Baseline-Time(s)': 272.16,
        'Dataflow-Time(s)': 76.96,
        'Baseline-Throughput': 0.0025, // GTEPS
        'Dataflow-Throughput': 0.0139 // GTEPS
      }
    ],
    'GPU': [
      {
        'Dataset': 'Rmat-18',
        'Baseline-Time(s)': 45.36,
        'Dataflow-Time(s)': 9.04,
        'Baseline-Throughput': 0.1395, // GTEPS
        'Dataflow-Throughput': 0.6113  // GTEPS
      },
      {
        'Dataset': 'Rmat-19',
        'Baseline-Time(s)': 89.49,
        'Dataflow-Time(s)': 14.7,
        'Baseline-Throughput': 0.1685, // GTEPS
        'Dataflow-Throughput': 0.748  // GTEPS
      },
      {
        'Dataset': 'Rmat-20',
        'Baseline-Time(s)': 164.27,
        'Dataflow-Time(s)': 25.96,
        'Baseline-Throughput': 0.1923, // GTEPS
        'Dataflow-Throughput': 0.8943 // GTEPS
      }
    ],
    'FPGA': [
      {
        'Dataset': 'Rmat-18',
        'Baseline-Time(s)': 0.06,
        'Dataflow-Time(s)': 0.02,
        'Baseline-Throughput': 0.7906, // GTEPS
        'Dataflow-Throughput': 2.3267 // GTEPS
      },
      {
        'Dataset': 'Rmat-19',
        'Baseline-Time(s)': 0.13,
        'Dataflow-Time(s)': 0.05,
        'Baseline-Throughput': 0.7159, // GTEPS
        'Dataflow-Throughput': 2.1216 // GTEPS
      },
      {
        'Dataset': 'Rmat-20',
        'Baseline-Time(s)': 0.25,
        'Dataflow-Time(s)': 0.08,
        'Baseline-Throughput': 0.7739, // GTEPS
        'Dataflow-Throughput': 2.2925 // GTEPS
      }
    ],
    'DSA': [
      {
        'Dataset': 'Rmat-18',
        'Baseline-Time(s)': 65.371,
        'Dataflow-Time(s)': 20.631,
        'Baseline-Throughput': 0.014844, // GTEPS
        'Dataflow-Throughput': 0.039376  // GTEPS
      },
      {
        'Dataset': 'Rmat-19',
        'Baseline-Time(s)': 118.991,
        'Dataflow-Time(s)': 41.8,
        'Baseline-Throughput': 0.021534, // GTEPS
        'Dataflow-Throughput': 0.047  // GTEPS
      },
      {
        'Dataset': 'Rmat-20',
        'Baseline-Time(s)': 242.008,
        'Dataflow-Time(s)': 84.3,
        'Baseline-Throughput': 0.02835, // GTEPS
        'Dataflow-Throughput': 0.050  // GTEPS
      }
    ]

  },
  'ViT': {
    'CPU': [
      {
        'Dataset': 'ImageNet',
        'Baseline-Time(s)': 115.09,
        'Dataflow-Time(s)': 43.56,
        'Baseline-Throughput': 204.12, // GFLOPS
        'Dataflow-Throughput': 539.30  // GFLOPS
      },
      {
        'Dataset': 'DriveSeg',
        'Baseline-Time(s)': 120.35,
        'Dataflow-Time(s)': 39.67,
        'Baseline-Throughput': 232.65, // GFLOPS
        'Dataflow-Throughput': 705.82  // GFLOPS
      }
    ],
    'GPU': [
      {
        'Dataset': 'ImageNet',
        'Baseline-Time(s)': 123.63,
        'Dataflow-Time(s)': 45.9,
        'Baseline-Throughput': 10871.15, // GFLOPS
        'Dataflow-Throughput': 29281.05  // GFLOPS
      },
      {
        'Dataset': 'DriveSeg',
        'Baseline-Time(s)': 99.25,
        'Dataflow-Time(s)': 34.39,
        'Baseline-Throughput': 1410.58, // GFLOPS
        'Dataflow-Throughput': 4070.95  // GFLOPS
      }
    ],
    'FPGA': [
      {
        'Dataset': 'ImageNet',
        'Baseline-Time(s)': 181.34,
        'Dataflow-Time(s)': 63.58,
        'Baseline-Throughput': 23.16, // GFLOPS
        'Dataflow-Throughput': 66.06  // GFLOPS
      },
      {
        'Dataset': 'DriveSeg',
        'Baseline-Time(s)': 193.44,
        'Dataflow-Time(s)': 63.27,
        'Baseline-Throughput': 21.71, // GFLOPS
        'Dataflow-Throughput': 66.38  // GFLOPS
      }
    ],

  }
};
