
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
          'Baseline-Time(s)': 18.0,
          'Dataflow-Time(s)': 6.0,
          'Baseline-Throughput': 0.0008, // GTEPS
          'Dataflow-Throughput': 0.0018  // GTEPS
        },
        {
          'Dataset': 'Rmat-19',
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
          'Dataset': 'Rmat-18',
          'Baseline-Time(s)': 9,
          'Dataflow-Time(s)': 3,
          'Baseline-Throughput': 0.001606, // GTEPS
          'Dataflow-Throughput': 0.003606  // GTEPS
        },
        {
          'Dataset': 'Rmat-19',
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
          'Dataset': 'Rmat-18',
          'Baseline-Time(s)': 4.5,
          'Dataflow-Time(s)': 1.5,
          'Baseline-Throughput': 0.03212, // GTEPS
          'Dataflow-Throughput': 0.1212  // GTEPS
        },
        {
          'Dataset': 'Rmat-19',
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
          'Baseline-Time(s)': 447.43,
          'Dataflow-Time(s)': 191.33,
          'Baseline-Throughput': 797.59, // GFLOPS
          'Dataflow-Throughput': 2163.43, // GFLOPS
        },
        {
          'Dataset': 'DriveSeg',
          'Baseline-Time(s)': 322.17 ,
          'Dataflow-Time(s)': 115.81,
          'Baseline-Throughput': 173.96, // GFLOPS
          'Dataflow-Throughput': 327.78  // GFLOPS
        }
      ],
      4: [
        {
          'Dataset': 'ImageNet',
          'Baseline-Time(s)': 390.12,
          'Dataflow-Time(s)': 133.97,
          'Baseline-Throughput': 1052.73, // GFLOPS
          'Dataflow-Throughput': 3524.31, // GFLOPS
        },
        {
          'Dataset': 'DriveSeg',
          'Baseline-Time(s)': 352.74,
          'Dataflow-Time(s)': 71.83,
          'Baseline-Throughput': 284.94, // GFLOPS
          'Dataflow-Throughput': 534.07  // GFLOPS
        }
      ],
      8: [
        {
          'Dataset': 'ImageNet',
          'Baseline-Time(s)': 448.53,
          'Dataflow-Time(s)': 128.07,
          'Baseline-Throughput': 1069.68, // GFLOPS
          'Dataflow-Throughput': 4434.44 , // GFLOPS
        },
        {
          'Dataset': 'DriveSeg',
          'Baseline-Time(s)': 615.99,
          'Dataflow-Time(s)': 73.58,
          'Baseline-Throughput': 289.62, // GFLOPS
          'Dataflow-Throughput': 516.97  // GFLOPS
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




