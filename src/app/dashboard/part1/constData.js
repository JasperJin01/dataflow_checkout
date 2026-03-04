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

  // FPGA PageRank 使用实时执行模式
  if (platform === 'FPGA') {
      return 'run';
  }

  if (platform === 'CPU' && algorithm === 'PageRank') {
    return 'run';
  }

  // CPU - VIT 需要处理！
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
        'Baseline-Time(s)': 0.0077,
        'Dataflow-Time(s)': 0.004,
        'Baseline-Throughput': 0.98, // GTEPS
        'Dataflow-Throughput': 1.86 // GTEPS
      },
      {
        'Dataset': 'Rmat-19',
        'Baseline-Time(s)': 0.032,
        'Dataflow-Time(s)': 0.017,
        'Baseline-Throughput': 0.966, // GTEPS
        'Dataflow-Throughput': 1.811 // GTEPS
      },
      {
        'Dataset': 'Rmat-20',
        'Baseline-Time(s)': 0.125,
        'Dataflow-Time(s)': 0.066,
        'Baseline-Throughput': 1.0203, // GTEPS
        'Dataflow-Throughput': 1.954 // GTEPS
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
