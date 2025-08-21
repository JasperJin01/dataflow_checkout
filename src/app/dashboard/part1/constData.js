export const URL_MAPS = {
  algorithm: {
    'PageRank': 'pr',
    'ViT': 'vit'
  },
  dataset: {
    'Rmat-16': 'rmat16',
    'Rmat-18': 'rmat18',
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

// run/log 控制字典（现在统一设为 log）
export function getRunMode(platform, algorithm, dataset) {
  return 'log';
}



// 性能指标数据（示例数据）
export const PERFORMANCE_DATA = {
  'PageRank': {
    'CPU': [
      {
        'Dataset': 'Rmat-16',
        'Baseline-Time(s)': 12.5,
        'Dataflow-Time(s)': 5.2,
        'Baseline-Throughput': 2.1, // GTEPS
        'Dataflow-Throughput': 5.4  // GTEPS
      },
      {
        'Dataset': 'Rmat-18',
        'Baseline-Time(s)': 42.3,
        'Dataflow-Time(s)': 21.7,
        'Baseline-Throughput': 2.2, // GTEPS
        'Dataflow-Throughput': 4.1  // GTEPS
      },
      {
        'Dataset': 'Rmat-20',
        'Baseline-Time(s)': 78.2,
        'Dataflow-Time(s)': 7.8,
        'Baseline-Throughput': 2.4, // GTEPS
        'Dataflow-Throughput': 24.6 // GTEPS
      }
    ],
    'GPU': [
      {
        'Dataset': 'Rmat-16',
        'Baseline-Time(s)': 9,
        'Dataflow-Time(s)': 3,
        'Baseline-Throughput': 3, // GTEPS
        'Dataflow-Throughput': 9  // GTEPS
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
        'Baseline-Time(s)': 9,
        'Dataflow-Time(s)': 4.2,
        'Baseline-Throughput': 3, // GTEPS
        'Dataflow-Throughput': 7.5 // GTEPS
      },
      {
        'Dataset': 'Rmat-18',
        'Baseline-Time(s)': 29.8,
        'Dataflow-Time(s)': 15.1,
        'Baseline-Throughput': 3.2, // GTEPS
        'Dataflow-Throughput': 5.8 // GTEPS
      },
      {
        'Dataset': 'Rmat-20',
        'Baseline-Time(s)': 58.5,
        'Dataflow-Time(s)': 5.1,
        'Baseline-Throughput': 3.3, // GTEPS
        'Dataflow-Throughput': 38.6 // GTEPS
      }
    ],
    'DSA': [
      {
        'Dataset': 'Rmat-16',
        'Baseline-Time(s)': 9,
        'Dataflow-Time(s)': 2.8,
        'Baseline-Throughput': 3, // GTEPS
        'Dataflow-Throughput': 10.2 // GTEPS
      },
      {
        'Dataset': 'Rmat-18',
        'Baseline-Time(s)': 29.8,
        'Dataflow-Time(s)': 12.1,
        'Baseline-Throughput': 3.2, // GTEPS
        'Dataflow-Throughput': 7.1 // GTEPS
      },
      {
        'Dataset': 'Rmat-20',
        'Baseline-Time(s)': 58.5,
        'Dataflow-Time(s)': 3.5,
        'Baseline-Throughput': 3.3, // GTEPS
        'Dataflow-Throughput': 55.8 // GTEPS
      }
    ]
  },
  'ViT': {
    'CPU': [
      {
        'Dataset': 'ImageNet',
        'Baseline-Time(s)': 165.0,
        'Dataflow-Time(s)': 102.0,
        'Baseline-Throughput': 320, // GFLOPS
        'Dataflow-Throughput': 510  // GFLOPS
      },
      {
        'Dataset': 'DriveSeg',
        'Baseline-Time(s)': 117.0,
        'Dataflow-Time(s)': 73.5,
        'Baseline-Throughput': 230, // GFLOPS
        'Dataflow-Throughput': 380  // GFLOPS
      }
    ],
    'GPU': [
      {
        'Dataset': 'ImageNet',
        'Baseline-Time(s)': 110.0,
        'Dataflow-Time(s)': 68.0,
        'Baseline-Throughput': 580, // GFLOPS
        'Dataflow-Throughput': 920  // GFLOPS
      },
      {
        'Dataset': 'DriveSeg',
        'Baseline-Time(s)': 78.0,
        'Dataflow-Time(s)': 49.0,
        'Baseline-Throughput': 420, // GFLOPS
        'Dataflow-Throughput': 690  // GFLOPS
      }
    ],
    'FPGA': [
      {
        'Dataset': 'ImageNet',
        'Baseline-Time(s)': 110.0,
        'Dataflow-Time(s)': 72.0,
        'Baseline-Throughput': 580, // GFLOPS
        'Dataflow-Throughput': 880  // GFLOPS
      },
      {
        'Dataset': 'DriveSeg',
        'Baseline-Time(s)': 78.0,
        'Dataflow-Time(s)': 52.0,
        'Baseline-Throughput': 420, // GFLOPS
        'Dataflow-Throughput': 650  // GFLOPS
      }
    ],
    'DSA': [
      {
        'Dataset': 'ImageNet',
        'Baseline-Time(s)': 110.0,
        'Dataflow-Time(s)': 65.0,
        'Baseline-Throughput': 580, // GFLOPS
        'Dataflow-Throughput': 950  // GFLOPS
      },
      {
        'Dataset': 'DriveSeg',
        'Baseline-Time(s)': 78.0,
        'Dataflow-Time(s)': 47.0,
        'Baseline-Throughput': 420, // GFLOPS
        'Dataflow-Throughput': 710  // GFLOPS
      }
    ]
  }
};
