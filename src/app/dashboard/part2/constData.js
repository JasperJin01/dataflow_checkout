
// 中期指标常量
export const midtermMetrics = {
  'PageRank': 6, // GTEPS
  'ViT': 1000, // GFLOPS
};

// 多卡/多机配置
export const CARD_OPTIONS = {
  'CPU-FPGA': [4],
  'CPU-GPU': [2, 4, 8],
  'CPU-DSA': [2, 4, 8]
};

// 默认卡数配置
export const DEFAULT_CARD_COUNT = {
  'CPU-FPGA': 4,
  'CPU-GPU': 8,
  'CPU-DSA': 8
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
  // 读取全局环境变量，默认为 simulation
  const executionMode = process.env.NEXT_PUBLIC_EXECUTION_MODE || 'simulation';
  
  // 如果是模拟模式，全部返回 log
  if (executionMode === 'simulation') {
    return 'log';
  }

  // 后端模式下，只有支持的组合才返回 run
  console.log('getRunMode',platform, algorithm, dataset);

  // FPGA PageRank算法使用实际执行模式
  if (algorithm === 'PageRank' && platform === 'CPU-FPGA') {
    return 'run';
  }
  // CPU-DSA PageRank算法使用实际执行模式
  if (algorithm === 'PageRank' && platform === 'CPU-DSA') {
    return 'run';
  }
  // CPU-FPGA ViT算法使用实际执行模式
  if (algorithm === 'ViT' && platform === 'CPU-FPGA') {
    return 'run';
  }
  if (algorithm === 'ViT' && platform === 'CPU-DSA') {
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
          'Baseline-Time(s)': 471.01,
          'Dataflow-Time(s)': 95.21,
          'Baseline-Throughput': 0.0127, // GTEPS
          'Dataflow-Throughput': 0.0425 // GTEPS
        },
        {
          'Dataset': 'Rmat-19',
          'Baseline-Time(s)': 93.62,
          'Dataflow-Time(s)': 18.79,
          'Baseline-Throughput': 0.0148, // GTEPS
          'Dataflow-Throughput': 0.0298 // GTEPS
        },
        {
          'Dataset': 'Rmat-20',
          'Baseline-Time(s)': 184.71,
          'Dataflow-Time(s)': 39.66,
          'Baseline-Throughput': 0.03, // GTEPS
          'Dataflow-Throughput': 0.0509 // GTEPS
        }
      ],
      4: [
        {
          'Dataset': 'Rmat-18',
          'Baseline-Time(s)': 241.42,
          'Dataflow-Time(s)': 48.46,
          'Baseline-Throughput': 0.0098, // GTEPS
          'Dataflow-Throughput': 0.043 // GTEPS
        },
        {
          'Dataset': 'Rmat-19',
          'Baseline-Time(s)': 484.35,
          'Dataflow-Time(s)': 96.38,
          'Baseline-Throughput': 0.0146, // GTEPS
          'Dataflow-Throughput': 0.044 // GTEPS
        },
        {
          'Dataset': 'Rmat-20',
          'Baseline-Time(s)': 940.18,
          'Dataflow-Time(s)': 194.28,
          'Baseline-Throughput': 0.0243, // GTEPS
          'Dataflow-Throughput': 0.1408 // GTEPS
        }
      ],
      8: [
        {
          'Dataset': 'Rmat-18',
          'Baseline-Time(s)': 236.48,
          'Dataflow-Time(s)': 47.47,
          'Baseline-Throughput': 0.0127, // GTEPS
          'Dataflow-Throughput': 0.043 // GTEPS
        },
        {
          'Dataset': 'Rmat-19',
          'Baseline-Time(s)': 468.08,
          'Dataflow-Time(s)': 94.78,
          'Baseline-Throughput': 0.0142, // GTEPS
          'Dataflow-Throughput': 0.044 // GTEPS
        },
        {
          'Dataset': 'Rmat-20',
          'Baseline-Time(s)': 923.53,
          'Dataflow-Time(s)': 195.02,
          'Baseline-Throughput': 0.03, // GTEPS
          'Dataflow-Throughput': 0.0526 // GTEPS
        }
      ]
    },
    'FPGA': {
      2: [
        {
          'Dataset': 'Rmat-18',
          'Baseline-Time(s)': 0.036,
          'Dataflow-Time(s)': 0.012,
          'Baseline-Throughput': 1.25, // GTEPS
          'Dataflow-Throughput': 2.85 // GTEPS
        },
        {
          'Dataset': 'Rmat-19',
          'Baseline-Time(s)': 0.068,
          'Dataflow-Time(s)': 0.024,
          'Baseline-Throughput': 1.35, // GTEPS
          'Dataflow-Throughput': 3.15 // GTEPS
        },
        {
          'Dataset': 'Rmat-20',
          'Baseline-Time(s)': 0.129,
          'Dataflow-Time(s)': 0.045,
          'Baseline-Throughput': 1.45, // GTEPS
          'Dataflow-Throughput': 3.45 // GTEPS
        }
      ],
      4: [
        {
          'Dataset': 'Rmat-18',
          'Baseline-Time(s)': 0.023,
          'Dataflow-Time(s)': 0.006,
          'Baseline-Throughput': 3.29, // GTEPS
          'Dataflow-Throughput': 6.14 // GTEPS
        },
        {
          'Dataset': 'Rmat-19',
          'Baseline-Time(s)': 0.040,
          'Dataflow-Time(s)': 0.013,
          'Baseline-Throughput': 3.45, // GTEPS
          'Dataflow-Throughput': 6.55 // GTEPS
        },
        {
          'Dataset': 'Rmat-20',
          'Baseline-Time(s)': 0.071,
          'Dataflow-Time(s)': 0.019,
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
          'Baseline-Time(s)': 91.35,
          'Dataflow-Time(s)': 29.92,
          'Baseline-Throughput': 14712.64, // GFLOPS
          'Dataflow-Throughput': 44919.79, // GFLOPS
        },
        {
          'Dataset': 'DriveSeg',
          'Baseline-Time(s)': 37.46,
          'Dataflow-Time(s)': 8.29,
          'Baseline-Throughput': 3737.32, // GFLOPS
          'Dataflow-Throughput': 16887.82  // GFLOPS
        }
      ],
      4: [
        {
          'Dataset': 'ImageNet',
          'Baseline-Time(s)': 61.14,
          'Dataflow-Time(s)': 14.59,
          'Baseline-Throughput': 21982.34, // GFLOPS
          'Dataflow-Throughput': 92117.89, // GFLOPS
        },
        {
          'Dataset': 'DriveSeg',
          'Baseline-Time(s)': 35.56,
          'Dataflow-Time(s)': 4.19,
          'Baseline-Throughput': 3937.01, // GFLOPS
          'Dataflow-Throughput': 33412.89  // GFLOPS
        }
      ],
      8: [
        {
          'Dataset': 'ImageNet',
          'Baseline-Time(s)': 47.5,
          'Dataflow-Time(s)': 7.51,
          'Baseline-Throughput': 28294.74, // GFLOPS
          'Dataflow-Throughput': 178961.38, // GFLOPS
        },
        {
          'Dataset': 'DriveSeg',
          'Baseline-Time(s)': 36.17,
          'Dataflow-Time(s)': 3.65,
          'Baseline-Throughput': 3870.61, // GFLOPS
          'Dataflow-Throughput': 38356.16  // GFLOPS
        }
      ]
    },
    
    'FPGA': {
      1: [
        {
          'Dataset': 'ImageNet',
          'Baseline-Time(s)': 40.49,
          'Dataflow-Time(s)': 15.73,
          'Baseline-Throughput': 96.81, // GFLOPS
          'Dataflow-Throughput': 249.21  // GFLOPS
        },
        {
          'Dataset': 'DriveSeg',
          'Baseline-Time(s)': 42.82,
          'Dataflow-Time(s)': 16.01,
          'Baseline-Throughput': 91.55, // GFLOPS
          'Dataflow-Throughput': 244.85  // GFLOPS
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



