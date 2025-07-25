"use client";
import React, { useState, useMemo } from 'react';
import {
  Box, Grid, Button, Select, MenuItem,
  Paper, Typography, LinearProgress
} from '@mui/material';
import ReadOnlyCodeBox from './CodeContainer';
import request from '@/lib/request/request';
import { CGA_CODE_MAP } from './constCGACode';

// 算法和数据集映射
export const algorithmMappings = {
  'bfs': {
    url: 'bfs',
    datasets: ['smallgraph', 'facebook', 'physics', ],
  },
  'sssp': {
    url: 'sssp',
    datasets: ['smallgraph', 'facebook', 'physics', ],
  },
  'wcc': {
    url: 'wcc',
    datasets: ['euroroad', 'pdzbase', 'facebook'],
  },
  'kcore': {
    url: 'kcore',
    datasets: ['physics', 'facebook'],
  },
  'k-Clique': {
    url: 'cf',
    datasets: ['euroroad', 'physics'],
  },
  'ppr': {
    url: 'ppr',
    datasets: ['smallgraph', 'physics', 'facebook'],
  },
  'gcn': {
    url: 'gcn',
    datasets: ['cora'],
  }
};

// 数据集到URL的映射
const datasetMappings = {
  'facebook': 'facebook',
  'euroroad': 'euroroad',
  'physics': 'physics',
  'pdzbase': 'pdzbase',
  'smallgraph':'smallgraph',
  'cora':'cora',
};

const algorithms = Object.keys(algorithmMappings);

// 工具函数：获取算法的URL
const getAlgorithmUrl = (algorithm) => {
  return algorithmMappings[algorithm]?.url || algorithm;
};

// 工具函数：获取数据集的URL
const getDatasetUrl = (dataset) => {
  return datasetMappings[dataset] || dataset;
};



export default function Page() {
  const [selectedAlgo, setSelectedAlgo] = useState(algorithms[0]);
  // 示例类型映射
  const EXAMPLE_TYPES = useMemo(() => {
    const isPPR = selectedAlgo === 'ppr'; // 或者 selectedAlgo.id === 'ppr' 取决于你的数据结构
    
    return {
      cgafile: { label: '基于CGA编程模型的代码展示' },
      graphIR: { label: 'GraphIR展示' },
      gcbefore: { label: isPPR ? '后端算子接口展示2' : '后端算子接口展示' },
      gcafter: { label: isPPR ? '算子汇编生成展示2' : '算子汇编生成展示' },
      outdegbefore: { label: '后端算子接口展示1' },
      outdegafter: { label:  '算子汇编生成展示1' },
      matrixIR: { label: 'MatrixIR展示' },
      asmfile: { label: '硬件指令展示' }
    };
  }, [selectedAlgo]); // 当 selectedAlgo 变化时重新计算

  const [selectedDataset, setSelectedDataset] = useState(algorithmMappings[algorithms[0]].datasets[0]);
  const [results, setResults] = useState({
    cgafile: CGA_CODE_MAP[algorithms[0]]
  });
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showButtons, setShowButtons] = useState({
    cgafile: false,
    graphIR: false,
    gcbefore: false,
    gcafter: false,
    outdegbefore: false,
    outdegafter: false,
    matrixIR: false,
    asmfile: false,
  });
  const [simulatorResults, setSimulatorResults] = useState('');
  const [isSimulatorRunning, setIsSimulatorRunning] = useState(false);
  const [simulatorProgress, setSimulatorProgress] = useState(0);

  const resultsBoxRef = React.useRef(null);
  const simulatorBoxRef = React.useRef(null);

  // 自动滚动到底部
  const scrollToBottom = () => {
    if (resultsBoxRef.current) {
      resultsBoxRef.current.scrollTop = resultsBoxRef.current.scrollHeight;
    }
    if (simulatorBoxRef.current) {
      simulatorBoxRef.current.scrollTop = simulatorBoxRef.current.scrollHeight;
    }
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [results, simulatorResults]);

  // 根据算法类型获取可见示例
  const getVisibleExamples = (algorithm) => {
    const baseExamples = ['cgafile', 'graphIR', 'matrixIR', 'asmfile'];
    
    if (['ppr'].includes(algorithm)) {
      return ['cgafile', 'graphIR', 'outdegbefore', 'outdegafter', 'gcbefore', 'gcafter', 'matrixIR', 'asmfile', ];
    } else if (['wcc', 'bfs', 'kcore', 'sssp'].includes(algorithm)) {
      return ['cgafile', 'graphIR', 'gcbefore', 'gcafter', 'matrixIR', 'asmfile', ];
    } else {
      return ['cgafile', 'graphIR', 'matrixIR', 'asmfile'];
    }
  };

  // 当算法改变时
  const handleAlgoChange = (event) => {
    console.log('handlealgochange')
    const newAlgo = event.target.value;
    console.log(newAlgo)
    setSelectedAlgo(newAlgo);
    setSelectedDataset(algorithmMappings[newAlgo].datasets[0]);
    setResults({ cgafile: CGA_CODE_MAP[getAlgorithmUrl(newAlgo)] });
    setProgress(0);
    
    // 重置按钮显示状态
    const initialButtons = {
      cgafile: false,
      graphIR: false,
      gcbefore: false,
      gcafter: false,
      outdegbefore: false,
      outdegafter: false,
      matrixIR: false,
      asmfile: false,
    };
    setShowButtons(initialButtons);

  };

  // 加载CGA编程模型代码（弃用）
  // const loadCGAExample = async (algorithm) => {
  //   try {
  //     const urlAlgo = getAlgorithmUrl(algorithm);
  //     const res = await request({
  //       url: `/part3/cgafile/1/${urlAlgo}/r/`,
  //       method: 'GET',
  //     });

  //     if (res && res.content) {
  //       setResults(prev => ({
  //         ...prev,
  //         cgafile: res.content.join('\n')
  //       }));
  //     }
  //   } catch (error) {
  //     console.error('获取CGA示例失败:', error);
  //     setResults(prev => ({
  //       ...prev,
  //       cgafile: `获取示例失败: ${error.message}`
  //     }));
  //   }
  // };


  const handleRun = async () => {
    if (isRunning) return;

    setIsRunning(true);
    setProgress(0);
    setResults(prev => ({ ...prev, terminal: '正在与服务器建立连接...\n' }));
    
    try {
      const urlAlgo = getAlgorithmUrl(selectedAlgo);
      const urlDataset = getDatasetUrl(selectedDataset);
      const eventSource = new EventSource(`${request.BASE_URL}/part3/execute/1/${urlAlgo}/${urlDataset}/`);

      eventSource.onmessage = async (event) => {
        if (event.data === '[done]') {
          eventSource.close();
          setResults(prev => ({
            ...prev,
            terminal: prev.terminal + '正在拷贝result\n'
          }));
          
          try {
            const res = await fetch(`${request.BASE_URL}/part3/result/1/${urlAlgo}/`);
            const jsonData = await res.json();
            setResults(prev => ({
              ...prev,
              terminal: prev.terminal + '完成\n'
            }));
            setProgress(100);

            // 运行完成后自动加载GraphIR
            await handleShowExample('graphIR');

          } catch (error) {
            setResults(prev => ({
              ...prev,
              terminal: prev.terminal + `获取结果失败: ${error.message}\n`
            }));
          } finally {
            setIsRunning(false);
          }
          
        } else if (event.data === '[error]') {
          eventSource.close();
          setResults(prev => ({
            ...prev,
            terminal: prev.terminal + '\n执行出错\n'
          }));
          setIsRunning(false);
        } else {
          setResults(prev => ({
            ...prev,
            terminal: prev.terminal + event.data + '\n'
          }));
        }
      };
      
      eventSource.onerror = () => {
        eventSource.close();
        setResults(prev => ({
          terminal: prev.terminal + '\n连接错误\n'
        }));
        setIsRunning(false);
      };

    } catch (error) {
      console.error('执行失败:', error);
      setResults(prev => ({
        ...prev,
        terminal: `执行失败: ${error.message}`
      }));
    }
  };

  const handleSimulatorRun = async () => {
    if (isSimulatorRunning) return;

    setIsSimulatorRunning(true);
    setSimulatorProgress(0);
    setSimulatorResults('正在与服务器建立连接...\n');

    try {
      const urlAlgo = getAlgorithmUrl(selectedAlgo);
      const urlDataset = getDatasetUrl(selectedDataset);


      const eventSource = new EventSource(`${request.BASE_URL}/part3/moni/1/${urlAlgo}/${urlDataset}/`);

      eventSource.onmessage = (event) => {
        if (event.data === '[done]') {
          eventSource.close();
          setSimulatorResults(prev => prev + '模拟器执行完成\n');
          setSimulatorProgress(100);
          setIsSimulatorRunning(false);
        } else if (event.data === '[error]') {
          eventSource.close();
          setSimulatorResults(prev => prev + '\n执行出错\n');
          setIsSimulatorRunning(false);
        } else {
          setSimulatorResults(prev => prev + event.data + '\n');
          setSimulatorProgress(prev => Math.min(prev + 5, 95));
        }
      };

      eventSource.onerror = () => {
        eventSource.close();
        setSimulatorResults(prev => prev + '\n连接错误\n');
        setIsSimulatorRunning(false);
      };

    } catch (error) {
      console.error('模拟器执行失败:', error);
      setSimulatorResults(`执行失败: ${error.message}`);
      setIsSimulatorRunning(false);
    }
  };

  // 阶段流转映射表
  const NEXT_STAGE_MAP = {
    // 通用流程
    '*': {
      'graphIR': 'gcbefore',
      'gcbefore': 'gcafter',
      'gcafter': 'matrixIR',
      'matrixIR': 'asmfile',
      'asmfile': null
    },
    // PPR特殊流程
    'ppr': {
      'graphIR': 'outdegbefore',
      'outdegbefore': 'outdegafter',
      'outdegafter': 'gcbefore',
      'gcbefore': 'gcafter',
      'gcafter': 'matrixIR',
      'matrixIR': 'asmfile',
      'asmfile': null
    },
    // 不需要GC流程的算法
    'gcn': {
      'graphIR': 'matrixIR',
      'matrixIR': 'asmfile',
      'asmfile': null
    },
    'k-Clique': {
      'graphIR': 'matrixIR',
      'matrixIR': 'asmfile',
      'asmfile': null
    },
    
    // 其他算法可以在这里添加特殊流程
  };


  const handleShowExample = async (exampleKey) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      const urlAlgo = getAlgorithmUrl(selectedAlgo);
      console.log('selectedAlgo', selectedAlgo)
      
      // 获取当前算法的阶段映射，如果没有则使用通用映射；确定下一个阶段
      const stageMap = NEXT_STAGE_MAP[selectedAlgo] || NEXT_STAGE_MAP['*'];
      const nextExampleKey = stageMap[exampleKey];
      
      // API路径映射
      const apiPathMap = {
        'graphIR': 'GraphIR',
        'gcbefore': 'GCBefore',
        'gcafter': 'GCAfter',
        'outdegbefore': 'OUTDEGBefore',
        'outdegafter': 'OUTDEGAfter',
        'matrixIR': 'MatrixIR',
        'asmfile': 'asm'
      };
      
      const apiPath = apiPathMap[exampleKey];
      if (!apiPath) {
        throw new Error(`未知的阶段: ${exampleKey}`);
      }
      
      const res = await request({
        url: `/part3data/1/${urlAlgo}/${apiPath}/`,
        method: 'GET',
      });
      
      if (res && res.data) {
        setResults(prev => ({
          ...prev,
          [exampleKey]: res.data.join('\n')
        }));
        
        setShowButtons(prev => ({ // todo 修改
          ...prev,
          [exampleKey]: true
        }));
      }
      
    } catch (error) {
      console.error(`获取${exampleKey}示例失败:`, error);
      setResults(prev => ({
        ...prev,
        [exampleKey]: `获取示例失败: ${error.message}`
      }));
    }
  };


  return (
    <Box sx={{ p: 3, backgroundColor: '#f5f6fa' }}>
      {/* 文字说明模块 */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2, backgroundColor: '#f0f4f8', border: '1px solid #e0e0e0' }}>
        <Typography variant="body1" component="div" sx={{ lineHeight: 1.6, color: '#2d3436', fontSize: '0.95rem' }}>
          <strong>考核指标：</strong>
          <Box component="span" display="block">建立统一图计算编程模型和编译工具</Box>
          <Box component="span" display="block">动态图更新性能达到每秒百万条边</Box>
          <strong>中期指标：</strong>
          <Box component="span" display="block">指标3.1：抽象出图遍历、图挖掘、图学习所具有的共性计算特征</Box>
          <Box component="span" display="block">指标3.2：使用SNAP标准动态图数据集进行评测，动态图更新速率达到每秒五十万条边</Box>
          <strong>完成时指标：</strong>
          <Box component="span" display="block">指标3.1：提出对图遍历、图挖掘、图学习算法统一化表达的编程模型和编译工具</Box>
          <Box component="span" display="block">指标3.2：使用SNAP标准动态图数据集进行评测，动态图更新速率达到每秒百万条边</Box>
          <strong>考核方式：</strong>
          <Box component="span" display="block">首先，将图遍历、图学习、图挖掘应用采用CGA编程模型统一化表达</Box>
          <Box component="span" display="block">然后，将CGA编程模型经过多层编译，转换成图计算加速卡（模拟器）上运行的代码</Box>
          <Box component="span" display="block">最后，支持GraphScope和DGL框架向CGA编程模型的转换</Box>
          <Box component="span" display="block">使用SNAP标准动态图数据集进行评测，性能指标计算方法是：动态图更新速率=总更新边数/总更新时间</Box>
          <strong>数据集来源：</strong>
          <Box component="span" display="block">采用选自斯坦福网络分析平台（SNAP）的自然图数据集ego-Facebook，大型网络数据集KONECT的自然图数据集Euroroads、PDZBase、Physicians，和图卷积网络自然图数据集Cora</Box>
        </Typography>
      </Paper>

      {/* 运行控制模块和Terminal执行结果并排 */}
      <Grid container spacing={3} mb={2} alignItems="stretch">
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 2, borderRadius: 3, height: 250, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'secondary.main', borderBottom: '2px solid', borderColor: 'secondary.main', pb: 1 }}>
              运行控制
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 550, fontSize: '16px', mb: 1 }}>
                选择算法
              </Typography>
              <Select
                fullWidth
                value={selectedAlgo}
                onChange={handleAlgoChange}
                disabled={isRunning}
              >
                {algorithms.map((algo) => (
                  <MenuItem key={algo} value={algo}>
                    {algo}
                  </MenuItem>
                ))}
              </Select>
            </Box>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleRun} 
              disabled={isRunning} 
              sx={{ marginBottom: 2 }}
            >
              {isRunning ? '运行中...' : '运行'}
            </Button>
            {isRunning && <LinearProgress value={progress} />}
          </Paper>
        </Grid>
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 2, borderRadius: 3, height: 350, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'secondary.main' }}>
              Terminal执行结果
            </Typography>
            <Box sx={{
              backgroundColor: '#1e1e1e',
              color: '#4caf50',
              fontFamily: 'Menlo, Monaco, Consolas, "Courier New", monospace',
              fontSize: '0.875rem',
              lineHeight: 1.5,
              overflow: 'auto',
              padding: '16px',
              borderRadius: '4px',
              flex: 1,
              whiteSpace: 'pre',
              p: 1.5,
            }} ref={resultsBoxRef}>
              <div>{results.terminal || ''}</div>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* 示例展示区域 */}
      <Grid container spacing={3}>
      {getVisibleExamples(selectedAlgo).map((exampleKey) => {
          // 获取当前算法的阶段映射
          const stageMap = NEXT_STAGE_MAP[selectedAlgo] || NEXT_STAGE_MAP['*'];
          // 判断是否是最后一个阶段
          const isLastStage = stageMap[exampleKey] === null;
          
          return (
            <Grid item xs={12} md={6} key={exampleKey}>
              <Paper elevation={3} sx={{ p: 2, borderRadius: 3, height: 500 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: 'secondary.main' }}>
                    {EXAMPLE_TYPES[exampleKey].label}
                  </Typography>
                  {/* 不显示cgafile的按钮，且不是最后一个阶段 */}
                  {exampleKey !== 'cgafile' && !isLastStage && showButtons[exampleKey] && (
                    <Button 
                      variant="contained" 
                      color="primary" 
                      onClick={async () => {
                        // 点击按钮后，先隐藏当前按钮
                        setShowButtons(prev => ({
                          ...prev,
                          [exampleKey]: false
                        }));
                        
                        // 获取下一个阶段
                        const nextExampleKey = stageMap[exampleKey];
                        
                        if (nextExampleKey) {
                          // 加载下一个阶段的代码
                          await handleShowExample(nextExampleKey);
                        }
                      }}
                    >
                      运行
                    </Button>
                  )}
                </Box>
                <ReadOnlyCodeBox content={results[exampleKey] || ''} height={400} />
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      {/* 模拟器执行区域 */}
      <Grid container spacing={3} mt={2}>
        {/* 模拟器控制模块 */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 2, borderRadius: 3, height: 250, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'secondary.main', borderBottom: '2px solid', borderColor: 'secondary.main', pb: 1 }}>
              模拟器控制
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 550, fontSize: '16px', mb: 1 }}>
                选择数据集
              </Typography>
              <Select
                fullWidth
                value={selectedDataset}
                onChange={(e) => setSelectedDataset(e.target.value)}
                disabled={isSimulatorRunning}
              >
                {algorithmMappings[selectedAlgo].datasets.map((dataset) => (
                  <MenuItem key={dataset} value={dataset}>
                    {dataset}
                  </MenuItem>
                ))}
              </Select>
            </Box>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleSimulatorRun} 
              disabled={isSimulatorRunning} 
              sx={{ marginBottom: 2 }}
            >
              {isSimulatorRunning ? '运行中...' : '运行模拟器'}
            </Button>
            {isSimulatorRunning && <LinearProgress value={simulatorProgress} />}
          </Paper>
        </Grid>

        {/*模拟器执行结果显示*/}
        <Grid item xs={8}>
          <Paper elevation={3} sx={{ p: 2, borderRadius: 3, height: 450, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'secondary.main' }}>
                在模拟器上执行硬件指令
              </Typography>
            </Box>
            <Box sx={{
              backgroundColor: '#1e1e1e',
              color: '#d4d4d4',
              fontFamily: 'Menlo, Monaco, Consolas, "Courier New", monospace',
              fontSize: '0.875rem',
              lineHeight: 1.5,
              overflow: 'auto',
              padding: '16px',
              borderRadius: '4px',
              flex: 1,
              whiteSpace: 'pre',
            }} ref={simulatorBoxRef}>
              {simulatorResults}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}