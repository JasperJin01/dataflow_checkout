
// 中期指标常量
export const midtermMetrics = {
  'PageRank': 6, // GTEPS
  'ViT': 1000, // GFLOPS
};

// 多卡/多机配置
export const CARD_OPTIONS = {
  'CPU-FPGA': [1, 4],
  'CPU-GPU': [1, 2, 4, 8],
  'CPU-DSA': [1, 2, 4, 8],
  'CPU分布式': [1, 2, 4, 8]
};

// 默认卡数配置
export const DEFAULT_CARD_COUNT = {
  'CPU-FPGA': 4,
  'CPU-GPU': 8,
  'CPU-DSA': 8,
  'CPU分布式': 8
};

// URL映射
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
    'CPU-GPU': 'gpu',
    'CPU-FPGA': 'fpga',
    'CPU-DSA': 'dsa',
    'CPU分布式': 'cpu'
  }
};

// 获取运行模式
export function getRunMode(platform, algorithm, dataset) {
  console.log('getRunMode',platform, algorithm, dataset);
  if (algorithm === 'ViT' && dataset === 'ImageNet' && platform === 'CPU分布式') {
    return 'run';
  }
  return 'log';
}

// 数据集执行结果
export const PERFORMANCE_DATA = {
  'PageRank': {
    'GPU': {
      1: [
        {
          'Dataset': 'Rmat-16',
          'Baseline-Time(s)': 36.0,
          'Dataflow-Time(s)': 12.0,
          'Baseline-Throughput': 0.0004, // GTEPS
          'Dataflow-Throughput': 0.0009  // GTEPS
        },
        {
          'Dataset': 'Rmat-18',
          'Baseline-Time(s)': 119.2,
          'Dataflow-Time(s)': 53.6,
          'Baseline-Throughput': 0.8, // GTEPS
          'Dataflow-Throughput': 1.58  // GTEPS
        },
        {
          'Dataset': 'Rmat-20',
          'Baseline-Time(s)': 234.0,
          'Dataflow-Time(s)': 15.6,
          'Baseline-Throughput': 0.83, // GTEPS
          'Dataflow-Throughput': 12.6 // GTEPS
        }
      ],
      2: [
        {
          'Dataset': 'Rmat-16',
          'Baseline-Time(s)': 18.0,
          'Dataflow-Time(s)': 6.0,
          'Baseline-Throughput': 0.0008, // GTEPS
          'Dataflow-Throughput': 0.0018  // GTEPS
        },
        {
          'Dataset': 'Rmat-18',
          'Baseline-Time(s)': 59.6,
          'Dataflow-Time(s)': 26.8,
          'Baseline-Throughput': 1.6, // GTEPS
          'Dataflow-Throughput': 3.15  // GTEPS
        },
        {
          'Dataset': 'Rmat-20',
          'Baseline-Time(s)': 117.0,
          'Dataflow-Time(s)': 7.8,
          'Baseline-Throughput': 1.65, // GTEPS
          'Dataflow-Throughput': 25.2 // GTEPS
        }
      ],
      4: [
        {
          'Dataset': 'Rmat-16',
          'Baseline-Time(s)': 9,
          'Dataflow-Time(s)': 3,
          'Baseline-Throughput': 0.001606, // GTEPS
          'Dataflow-Throughput': 0.003606  // GTEPS
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
      8: [
        {
          'Dataset': 'Rmat-16',
          'Baseline-Time(s)': 4.5,
          'Dataflow-Time(s)': 1.5,
          'Baseline-Throughput': 0.03212, // GTEPS
          'Dataflow-Throughput': 0.1212  // GTEPS
        },
        {
          'Dataset': 'Rmat-18',
          'Baseline-Time(s)': 14.9,
          'Dataflow-Time(s)': 6.7,
          'Baseline-Throughput': 0.064, // GTEPS
          'Dataflow-Throughput': 0.136  // GTEPS
        },
        {
          'Dataset': 'Rmat-20',
          'Baseline-Time(s)': 29.25,
          'Dataflow-Time(s)': 1.95,
          'Baseline-Throughput': 6.6, // GTEPS
          'Dataflow-Throughput': 100.8 // GTEPS
        }
      ]
    },
    'FPGA': {
      1: [
        {
          'Dataset': 'Rmat-16',
          'Baseline-Time(s)': 36.0,
          'Dataflow-Time(s)': 16.8,
          'Baseline-Throughput': 0.75, // GTEPS
          'Dataflow-Throughput': 1.88 // GTEPS
        },
        {
          'Dataset': 'Rmat-18',
          'Baseline-Time(s)': 119.2,
          'Dataflow-Time(s)': 60.4,
          'Baseline-Throughput': 0.8, // GTEPS
          'Dataflow-Throughput': 1.45 // GTEPS
        },
        {
          'Dataset': 'Rmat-20',
          'Baseline-Time(s)': 234.0,
          'Dataflow-Time(s)': 20.4,
          'Baseline-Throughput': 0.83, // GTEPS
          'Dataflow-Throughput': 9.65 // GTEPS
        }
      ],
      4: [
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
      ]
    },
    'DSA': {
      1: [
        {
          'Dataset': 'Rmat-16',
          'Baseline-Time(s)': 392,
          'Dataflow-Time(s)': 191.2,
          'Baseline-Throughput': 0.00152, // GTEPS
          'Dataflow-Throughput': 0.00253 // GTEPS
        },
        {
          'Dataset': 'Rmat-18',
          'Baseline-Time(s)': 119.2,
          'Dataflow-Time(s)': 48.4,
          'Baseline-Throughput': 0.8, // GTEPS
          'Dataflow-Throughput': 1.78 // GTEPS
        },
        {
          'Dataset': 'Rmat-20',
          'Baseline-Time(s)': 234.0,
          'Dataflow-Time(s)': 14.0,
          'Baseline-Throughput': 0.83, // GTEPS
          'Dataflow-Throughput': 13.95 // GTEPS
        }
      ],
      2: [
        {
          'Dataset': 'Rmat-16',
          'Baseline-Time(s)': 196,
          'Dataflow-Time(s)': 95.6,
          'Baseline-Throughput': 0.00304, // GTEPS
          'Dataflow-Throughput': 0.00506 // GTEPS
        },
        {
          'Dataset': 'Rmat-18',
          'Baseline-Time(s)': 59.6,
          'Dataflow-Time(s)': 24.2,
          'Baseline-Throughput': 1.6, // GTEPS
          'Dataflow-Throughput': 3.55 // GTEPS
        },
        {
          'Dataset': 'Rmat-20',
          'Baseline-Time(s)': 117.0,
          'Dataflow-Time(s)': 7.0,
          'Baseline-Throughput': 1.65, // GTEPS
          'Dataflow-Throughput': 27.9 // GTEPS
        }
      ],
      4: [
        {
          'Dataset': 'Rmat-16',
          'Baseline-Time(s)': 98,
          'Dataflow-Time(s)': 47.8,
          'Baseline-Throughput': 0.00607, // GTEPS
          'Dataflow-Throughput': 0.010117 // GTEPS
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
      ],
      8: [
        {
          'Dataset': 'Rmat-16',
          'Baseline-Time(s)': 49,
          'Dataflow-Time(s)': 23.9,
          'Baseline-Throughput': 0.01214, // GTEPS
          'Dataflow-Throughput': 0.020234 // GTEPS
        },
        {
          'Dataset': 'Rmat-18',
          'Baseline-Time(s)': 14.9,
          'Dataflow-Time(s)': 6.05,
          'Baseline-Throughput': 6.4, // GTEPS
          'Dataflow-Throughput': 14.2 // GTEPS
        },
        {
          'Dataset': 'Rmat-20',
          'Baseline-Time(s)': 29.25,
          'Dataflow-Time(s)': 1.75,
          'Baseline-Throughput': 6.6, // GTEPS
          'Dataflow-Throughput': 111.6 // GTEPS
        }
      ]
    }
  },
  'ViT': {

    'GPU': {
      1: [
        {
          'Dataset': 'ImageNet',
          'Baseline-Time(s)': 1452.28,
          'Dataflow-Time(s)': 324.68,
          'Baseline-Throughput': 4.5, // GFLOPS
          'Dataflow-Throughput': 16.15, // GFLOPS
        },
        {
          'Dataset': 'DriveSeg',
          'Baseline-Time(s)': 312.0,
          'Dataflow-Time(s)': 196.0,
          'Baseline-Throughput': 105, // GFLOPS
          'Dataflow-Throughput': 172.5  // GFLOPS
        }
      ],
      2: [
        {
          'Dataset': 'ImageNet',
          'Baseline-Time(s)': 726.14,
          'Dataflow-Time(s)': 162.34,
          'Baseline-Throughput': 9.0, // GFLOPS
          'Dataflow-Throughput': 32.3, // GFLOPS
        },
        {
          'Dataset': 'DriveSeg',
          'Baseline-Time(s)': 156.0,
          'Dataflow-Time(s)': 98.0,
          'Baseline-Throughput': 210, // GFLOPS
          'Dataflow-Throughput': 345  // GFLOPS
        }
      ],
      4: [
        {
          'Dataset': 'ImageNet',
          'Baseline-Time(s)': 363.07,
          'Dataflow-Time(s)': 81.17,
          'Baseline-Throughput': 17.98, // GFLOPS
          'Dataflow-Throughput': 64.58, // GFLOPS
        },
        {
          'Dataset': 'DriveSeg',
          'Baseline-Time(s)': 78.0,
          'Dataflow-Time(s)': 49.0,
          'Baseline-Throughput': 420, // GFLOPS
          'Dataflow-Throughput': 690  // GFLOPS
        }
      ],
      8: [
        {
          'Dataset': 'ImageNet',
          'Baseline-Time(s)': 181.54,
          'Dataflow-Time(s)': 40.59,
          'Baseline-Throughput': 335.96, // GFLOPS
          'Dataflow-Throughput': 729.16, // GFLOPS
        },
        {
          'Dataset': 'DriveSeg',
          'Baseline-Time(s)': 39.0,
          'Dataflow-Time(s)': 24.5,
          'Baseline-Throughput': 284, // GFLOPS
          'Dataflow-Throughput': 838  // GFLOPS
        }
      ]
    },
    'FPGA': {
      1: [
        {
          'Dataset': 'ImageNet',
          'Baseline-Time(s)': 440.0,
          'Dataflow-Time(s)': 288.0,
          'Baseline-Throughput': 145, // GFLOPS
          'Dataflow-Throughput': 220  // GFLOPS
        },
        {
          'Dataset': 'DriveSeg',
          'Baseline-Time(s)': 312.0,
          'Dataflow-Time(s)': 208.0,
          'Baseline-Throughput': 105, // GFLOPS
          'Dataflow-Throughput': 162.5  // GFLOPS
        }
      ],
      4: [
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
          'Baseline-Throughput': 82, // GFLOPS
          'Dataflow-Throughput': 165  // GFLOPS
        }
      ]
    },
    'DSA': {
      1: [
        {
          'Dataset': 'ImageNet',
          'Baseline-Time(s)': 440.0,
          'Dataflow-Time(s)': 260.0,
          'Baseline-Throughput': 145, // GFLOPS
          'Dataflow-Throughput': 237.5  // GFLOPS
        },
        {
          'Dataset': 'DriveSeg',
          'Baseline-Time(s)': 312.0,
          'Dataflow-Time(s)': 188.0,
          'Baseline-Throughput': 105, // GFLOPS
          'Dataflow-Throughput': 177.5  // GFLOPS
        }
      ],
      2: [
        {
          'Dataset': 'ImageNet',
          'Baseline-Time(s)': 220.0,
          'Dataflow-Time(s)': 130.0,
          'Baseline-Throughput': 290, // GFLOPS
          'Dataflow-Throughput': 475  // GFLOPS
        },
        {
          'Dataset': 'DriveSeg',
          'Baseline-Time(s)': 156.0,
          'Dataflow-Time(s)': 94.0,
          'Baseline-Throughput': 210, // GFLOPS
          'Dataflow-Throughput': 355  // GFLOPS
        }
      ],
      4: [
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
      ],
      8: [
        {
          'Dataset': 'ImageNet',
          'Baseline-Time(s)': 55.0,
          'Dataflow-Time(s)': 32.5,
          'Baseline-Throughput': 1160, // GFLOPS
          'Dataflow-Throughput': 1900  // GFLOPS
        },
        {
          'Dataset': 'DriveSeg',
          'Baseline-Time(s)': 39.0,
          'Dataflow-Time(s)': 23.5,
          'Baseline-Throughput': 840, // GFLOPS
          'Dataflow-Throughput': 1420  // GFLOPS
        }
      ]
    }
  }
};




