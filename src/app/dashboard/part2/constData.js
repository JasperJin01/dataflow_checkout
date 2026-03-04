
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
    'Rmat-19': 'rmat19',
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
  // FPGA PageRank算法使用实际执行模式
  if (algorithm === 'PageRank' && platform === 'CPU-FPGA') {
    return 'run';
  }
  // CPU-DSA PageRank算法使用实际执行模式
  if (algorithm === 'PageRank' && platform === 'CPU-DSA') {
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
          'Dataset': 'Rmat-18',
          'Baseline-Time(s)': 36.0,
          'Dataflow-Time(s)': 12.0,
          'Baseline-Throughput': 0.0004, // GTEPS
          'Dataflow-Throughput': 0.0009  // GTEPS
        },
        {
          'Dataset': 'Rmat-19',
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
          'Dataset': 'Rmat-18',
          'Baseline-Time(s)': 36.38,
          'Dataflow-Time(s)': 10.85,
          'Baseline-Throughput': 0.1745, // GTEPS
          'Dataflow-Throughput': 0.5907  // GTEPS
        },
        {
          'Dataset': 'Rmat-19',
          'Baseline-Time(s)': 77.83,
          'Dataflow-Time(s)': 15.61,
          'Baseline-Throughput': 0.184, // GTEPS
          'Dataflow-Throughput': 0.7456  // GTEPS
        },
        {
          'Dataset': 'Rmat-20',
          'Baseline-Time(s)': 155.33,
          'Dataflow-Time(s)': 26.88,
          'Baseline-Throughput': 0.2832, // GTEPS
          'Dataflow-Throughput': 0.8986 // GTEPS
        }
      ],
      4: [
        {
          'Dataset': 'Rmat-18',
          'Baseline-Time(s)': 38.25,
          'Dataflow-Time(s)': 10.95,
          'Baseline-Throughput': 0.1737, // GTEPS
          'Dataflow-Throughput': 0.6179  // GTEPS
        },
        {
          'Dataset': 'Rmat-19',
          'Baseline-Time(s)': 77.84,
          'Dataflow-Time(s)': 24.4,
          'Baseline-Throughput': 0.1843, // GTEPS
          'Dataflow-Throughput': 0.8137  // GTEPS
        },
        {
          'Dataset': 'Rmat-20',
          'Baseline-Time(s)': 155.3,
          'Dataflow-Time(s)': 44.54,
          'Baseline-Throughput': 0.2862, // GTEPS
          'Dataflow-Throughput': 0.9946 // GTEPS
        }
      ],
      8: [
        {
          'Dataset': 'Rmat-18',
          'Baseline-Time(s)': 47.74,
          'Dataflow-Time(s)': 15.35,
          'Baseline-Throughput': 0.1746, // GTEPS
          'Dataflow-Throughput': 0.8267  // GTEPS
        },
        {
          'Dataset': 'Rmat-19',
          'Baseline-Time(s)': 98.82,
          'Dataflow-Time(s)': 32.44,
          'Baseline-Throughput': 0.2033, // GTEPS
          'Dataflow-Throughput': 0.7806  // GTEPS
        },
        {
          'Dataset': 'Rmat-20',
          'Baseline-Time(s)': 192.89,
          'Dataflow-Time(s)': 65.51,
          'Baseline-Throughput': 0.2409, // GTEPS
          'Dataflow-Throughput': 1.0292 // GTEPS
        }
      ]
    },

    'DSA': {
      1: [
        {
          'Dataset': 'Rmat-18',
          'Baseline-Time(s)': 70.629,
          'Dataflow-Time(s)': 20.740,
          'Baseline-Throughput': 0.013313, // GTEPS
          'Dataflow-Throughput': 0.040072 // GTEPS
        },
        {
          'Dataset': 'Rmat-19',
          'Baseline-Time(s)': 128.409 ,
          'Dataflow-Time(s)': 35.695,
          'Baseline-Throughput': 0.021782, // GTEPS
          'Dataflow-Throughput': 0.061618 // GTEPS
        },
        {
          'Dataset': 'Rmat-20',
          'Baseline-Time(s)': 287.210,
          'Dataflow-Time(s)': 67.054,
          'Baseline-Throughput': 0.028851, // GTEPS
          'Dataflow-Throughput': 0.082105 // GTEPS
        }
      ],
      2: [
        {
          'Dataset': 'Rmat-18',
          'Baseline-Time(s)': 47.628,
          'Dataflow-Time(s)': 21.151,
          'Baseline-Throughput': 0.009588, // GTEPS
          'Dataflow-Throughput': 0.027982 // GTEPS
        },
        {
          'Dataset': 'Rmat-19',
          'Baseline-Time(s)': 90.815,
          'Dataflow-Time(s)': 37.789,
          'Baseline-Throughput': 0.015390, // GTEPS
          'Dataflow-Throughput': 0.052945 // GTEPS
        },
        {
          'Dataset': 'Rmat-20',
          'Baseline-Time(s)': 179.492,
          'Dataflow-Time(s)': 70.678,
          'Baseline-Throughput': 0.023772, // GTEPS
          'Dataflow-Throughput': 0.062850 // GTEPS
        }
      ],
      4: [
        {
          'Dataset': 'Rmat-18',
          'Baseline-Time(s)': 47.643,
          'Dataflow-Time(s)': 22.893,
          'Baseline-Throughput': 0.010117, // GTEPS
          'Dataflow-Throughput': 0.017280 // GTEPS
        },
        {
          'Dataset': 'Rmat-19',
          'Baseline-Time(s)': 92.230,
          'Dataflow-Time(s)': 40.628,
          'Baseline-Throughput': 0.019847, // GTEPS
          'Dataflow-Throughput': 0.037072 // GTEPS
        },
        {
          'Dataset': 'Rmat-20',
          'Baseline-Time(s)': 184.639,
          'Dataflow-Time(s)': 72.351,
          'Baseline-Throughput': 0.032640, // GTEPS
          'Dataflow-Throughput': 0.075041 // GTEPS
        }
      ],
      8: [
        {
          'Dataset': 'Rmat-18',
          'Baseline-Time(s)': 56.674,
          'Dataflow-Time(s)': 26.595,
          'Baseline-Throughput': 0.003269, // GTEPS
          'Dataflow-Throughput': 0.009900 // GTEPS
        },
        {
          'Dataset': 'Rmat-19',
          'Baseline-Time(s)': 100.653,
          'Dataflow-Time(s)': 46.535,
          'Baseline-Throughput': 0.007846, // GTEPS
          'Dataflow-Throughput': 0.020744 // GTEPS
        },
        {
          'Dataset': 'Rmat-20',
          'Baseline-Time(s)': 202.137,
          'Dataflow-Time(s)': 83.413,
          'Baseline-Throughput': 0.008283, // GTEPS
          'Dataflow-Throughput': 0.037729 // GTEPS
        }
      ]
    },
    'FPGA': {
      1: [
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
      4: [
        {
          'Dataset': 'Rmat-16',
          'Baseline-Time(s)': 0.003,
          'Dataflow-Time(s)': 0.001,
          'Baseline-Throughput': 2.466, // GTEPS
          'Dataflow-Throughput': 4.52 // GTEPS
        },
        {
          'Dataset': 'Rmat-18',
          'Baseline-Time(s)': 0.009,
          'Dataflow-Time(s)': 0.005,
          'Baseline-Throughput': 3.29, // GTEPS
          'Dataflow-Throughput': 6.14 // GTEPS
        },
        {
          'Dataset': 'Rmat-20',
          'Baseline-Time(s)': 0.035,
          'Dataflow-Time(s)': 0.018,
          'Baseline-Throughput': 3.58, // GTEPS
          'Dataflow-Throughput': 6.82 // GTEPS
        }
      ]
    },

  },
  'ViT': {
    'GPU': {
      1: [
        {
          'Dataset': 'ImageNet',
          'Baseline-Time(s)': 580.42,
          'Dataflow-Time(s)': 246.73,
          'Baseline-Throughput': 547.53, // GFLOPS
          'Dataflow-Throughput': 1279.22, // GFLOPS
        },
        {
          'Dataset': 'DriveSeg',
          'Baseline-Time(s)': 401.39,
          'Dataflow-Time(s)': 190.20,
          'Baseline-Throughput': 95.01, // GFLOPS
          'Dataflow-Throughput': 176.44  // GFLOPS
        }
      ],
      2: [
        {
          'Dataset': 'ImageNet',
          'Baseline-Time(s)': 80.45,
          'Dataflow-Time(s)': 28.09,
          'Baseline-Throughput': 16706.03, // GFLOPS
          'Dataflow-Throughput': 47846.21, // GFLOPS
        },
        {
          'Dataset': 'DriveSeg',
          'Baseline-Time(s)': 70.7,
          'Dataflow-Time(s)': 19.21,
          'Baseline-Throughput': 1980.2, // GFLOPS
          'Dataflow-Throughput': 7287.87  // GFLOPS
        }
      ],
      4: [
        {
          'Dataset': 'ImageNet',
          'Baseline-Time(s)': 65.3,
          'Dataflow-Time(s)': 17.87,
          'Baseline-Throughput': 20581.93, // GFLOPS
          'Dataflow-Throughput': 75209.85, // GFLOPS
        },
        {
          'Dataset': 'DriveSeg',
          'Baseline-Time(s)': 69.86,
          'Dataflow-Time(s)': 14.61,
          'Baseline-Throughput': 2004.01, // GFLOPS
          'Dataflow-Throughput': 9582.46  // GFLOPS
        }
      ],
      8: [
        {
          'Dataset': 'ImageNet',
          'Baseline-Time(s)': 63.74,
          'Dataflow-Time(s)': 15.19,
          'Baseline-Throughput': 21085.66, // GFLOPS
          'Dataflow-Throughput': 88479.26, // GFLOPS
        },
        {
          'Dataset': 'DriveSeg',
          'Baseline-Time(s)': 75.8,
          'Dataflow-Time(s)': 14.6,
          'Baseline-Throughput': 1846.97, // GFLOPS
          'Dataflow-Throughput': 9589.04  // GFLOPS
        }
      ]
    },

    'DSA': {
      1: [
        {
          'Dataset': 'ImageNet',
          'Baseline-Time(s)': 1350.0834,
          'Dataflow-Time(s)': 796.9242,
          'Baseline-Throughput': 383.59, // GFLOPS
          'Dataflow-Throughput': 761.56  // GFLOPS
        },
        {
          'Dataset': 'DriveSeg',
          'Baseline-Time(s)': 1179.5193,
          'Dataflow-Time(s)': 659.2081,
          'Baseline-Throughput': 199.66, // GFLOPS
          'Dataflow-Throughput': 510.1878  // GFLOPS
        }
      ],
      2: [
        {
          'Dataset': 'ImageNet',
          'Baseline-Time(s)': 847.2315,
          'Dataflow-Time(s)': 510.2872,
          'Baseline-Throughput': 657.57, // GFLOPS
          'Dataflow-Throughput': 1429.8162  // GFLOPS
        },
        {
          'Dataset': 'DriveSeg',
          'Baseline-Time(s)': 1219.9593,
          'Dataflow-Time(s)': 690.2182,
          'Baseline-Throughput': 180.13, // GFLOPS
          'Dataflow-Throughput': 470.1951  // GFLOPS
        }
      ],
      4: [
        {
          'Dataset': 'ImageNet',
          'Baseline-Time(s)': 620.0197,
          'Dataflow-Time(s)': 343.8584,
          'Baseline-Throughput': 973.75, // GFLOPS
          'Dataflow-Throughput': 2742.6734  // GFLOPS
        },
        {
          'Dataset': 'DriveSeg',
          'Baseline-Time(s)': 1321.1231,
          'Dataflow-Time(s)': 700.2182,
          'Baseline-Throughput': 157.43, // GFLOPS
          'Dataflow-Throughput': 430.5138  // GFLOPS
        }
      ],
      8: [
        {
          'Dataset': 'ImageNet',
          'Baseline-Time(s)': 512.0332,
          'Dataflow-Time(s)': 241.6504,
          'Baseline-Throughput': 1249.52, // GFLOPS
          'Dataflow-Throughput': 4960.2964  // GFLOPS
        },
        {
          'Dataset': 'DriveSeg',
          'Baseline-Time(s)': 1479.6131,
          'Dataflow-Time(s)': 740.4568,
          'Baseline-Throughput': 140.85, // GFLOPS
          'Dataflow-Throughput': 400.1234  // GFLOPS
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
          'Baseline-Time(s)': 0.175,
          'Dataflow-Time(s)': 0.088,
          'Baseline-Throughput': 220.36, // GFLOPS
          'Dataflow-Throughput': 421.34  // GFLOPS
        },
        {
          'Dataset': 'DriveSeg',
          'Baseline-Time(s)': 0.173,
          'Dataflow-Time(s)': 0.093,
          'Baseline-Throughput': 197.95, // GFLOPS
          'Dataflow-Throughput': 401.28  // GFLOPS
        }
      ]
    },

  }
};



