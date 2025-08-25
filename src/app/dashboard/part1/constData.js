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
        'Baseline-Time(s)': 104.11,
        'Dataflow-Time(s)': 20.7,
        'Baseline-Throughput': 0.002234, // GTEPS
        'Dataflow-Throughput': 0.040072 // GTEPS
      },
      {
        'Dataset': 'Rmat-18',
        'Baseline-Time(s)': 216.99,
        'Dataflow-Time(s)': 35.695,
        'Baseline-Throughput': 0.002234, // GTEPS
        'Dataflow-Throughput': 0.061618 // GTEPS
      },
      {
        'Dataset': 'Rmat-20',
        'Baseline-Time(s)': 416.99,
        'Dataflow-Time(s)': 67.054,
        'Baseline-Throughput': 0.001855, // GTEPS
        'Dataflow-Throughput': 0.082105 // GTEPS
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
        'Dataflow-Time(s)': 46.0,
        'Baseline-Throughput': 480, // GFLOPS
        'Dataflow-Throughput': 1279.22  // GFLOPS
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
        'Baseline-Time(s)': 0.0338,
        'Dataflow-Time(s)': 0.0154,
        'Baseline-Throughput': 27.673, // GFLOPS
        'Dataflow-Throughput': 62.882  // GFLOPS
      },
      {
        'Dataset': 'DriveSeg',
        'Baseline-Time(s)': 0.0348,
        'Dataflow-Time(s)': 0.0158,
        'Baseline-Throughput': 25.823, // GFLOPS
        'Dataflow-Throughput': 61.238  // GFLOPS
      }
    ],
    'DSA': [
      {
        'Dataset': 'ImageNet',
        'Baseline-Time(s)': 180.0,
        'Dataflow-Time(s)': 78.66,
        'Baseline-Throughput': 380, // GFLOPS
        'Dataflow-Throughput': 761  // GFLOPS
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
