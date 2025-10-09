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

// run/log 控制字典
export function getRunMode(platform, algorithm, dataset) {
  // DSA PageRank 使用实时执行模式
  if (platform === 'DSA' && algorithm === 'PageRank') {
    return 'run';
  }
  // FPGA PageRank 使用实时执行模式
  if (platform === 'FPGA' && algorithm === 'PageRank') {
    return 'run';
  }
  // 其他情况使用日志模式
  return 'log';
}



// 性能指标数据（示例数据）
export const PERFORMANCE_DATA = {
  'PageRank': {
    'CPU': [
      {
        'Dataset': 'Rmat-16',
        'Baseline-Time(s)': 75.225,
        'Dataflow-Time(s)': 18.9,
        'Baseline-Throughput': 0.001577, // GTEPS
        'Dataflow-Throughput': 0.0148415  // GTEPS
      },
      {
        'Dataset': 'Rmat-18',
        'Baseline-Time(s)': 155.493,
        'Dataflow-Time(s)': 37.5,
        'Baseline-Throughput': 0.001480, // GTEPS
        'Dataflow-Throughput': 0.014936  // GTEPS
      },
      {
        'Dataset': 'Rmat-20',
        'Baseline-Time(s)': 318.37,
        'Dataflow-Time(s)': 76.3,
        'Baseline-Throughput': 0.001476, // GTEPS
        'Dataflow-Throughput': 0.01455304 // GTEPS
      }
    ],
    'GPU': [
      {
        'Dataset': 'Rmat-16',
        'Baseline-Time(s)': 70.456,
        'Dataflow-Time(s)': 32.53,
        'Baseline-Throughput': 0.001606, // GTEPS
        'Dataflow-Throughput': 0.01606  // GTEPS
      },
      {
        'Dataset': 'Rmat-18',
        'Baseline-Time(s)': 29.8,
        'Dataflow-Time(s)': 13.4,
        'Baseline-Throughput': 3.2, // GTEPS
        'Dataflow-Throughput': 6.3  // GTEPS
      },
      {
        'Dataset': 'Rmat-20',
        'Baseline-Time(s)': 58.5,
        'Dataflow-Time(s)': 3.9,
        'Baseline-Throughput': 3.3, // GTEPS
        'Dataflow-Throughput': 50.4 // GTEPS
      }
    ],
    'FPGA': [
      {
        'Dataset': 'Rmat-16',
        'Baseline-Time(s)': 0.0077,
        'Dataflow-Time(s)': 0.004,
        'Baseline-Throughput': 0.98, // GTEPS
        'Dataflow-Throughput': 1.86 // GTEPS
      },
      {
        'Dataset': 'Rmat-18',
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
        'Baseline-Time(s)': 0.46,
        'Dataflow-Time(s)': 0.16,
        'Baseline-Throughput': 35.58, // GFLOPS
        'Dataflow-Throughput': 115.41  // GFLOPS
      },
      {
        'Dataset': 'DriveSeg',
        'Baseline-Time(s)': 0.53,
        'Dataflow-Time(s)': 0.19,
        'Baseline-Throughput': 230, // GFLOPS
        'Dataflow-Throughput': 380  // GFLOPS
      }
    ],
    'GPU': [
      {
        'Dataset': 'ImageNet',
        'Baseline-Time(s)': 110.0,
        'Dataflow-Time(s)': 46.5,
        'Baseline-Throughput': 480, // GFLOPS
        'Dataflow-Throughput': 1279.22  // GFLOPS
      },
      {
        'Dataset': 'DriveSeg',
        'Baseline-Time(s)': 128.0,
        'Dataflow-Time(s)': 65.32,
        'Baseline-Throughput': 34.18, // GFLOPS
        'Dataflow-Throughput': 95.01  // GFLOPS
      }
    ],
    'FPGA': [
      {
        'Dataset': 'ImageNet',
        'Baseline-Time(s)': 0.338,
        'Dataflow-Time(s)': 0.154,
        'Baseline-Throughput': 47.673, // GFLOPS
        'Dataflow-Throughput': 111.32  // GFLOPS
      },
      {
        'Dataset': 'DriveSeg',
        'Baseline-Time(s)': 0.348,
        'Dataflow-Time(s)': 0.158,
        'Baseline-Throughput': 55.823, // GFLOPS
        'Dataflow-Throughput': 101.38  // GFLOPS
      }
    ],

  }
};
