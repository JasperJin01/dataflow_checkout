"use client";
import React, { useState, useEffect } from 'react';
import { Box, Grid, Paper, Typography, Select, MenuItem, Button, Tabs, Tab, Table, 
  TableBody, TableCell, TableContainer, TableHead, TableRow, LinearProgress } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, ResponsiveContainer } from 'recharts';
import request from '@/lib/request/request';
import { PERFORMANCE_DATA, getRunMode, URL_MAPS, midtermMetrics, CARD_OPTIONS, DEFAULT_CARD_COUNT } from './constData';
import { AssessmentCriteria, AlgorithmDetails, DatasetInfo, getThroughputUnit } from './info';

const algorithms = ['PageRank', 'ViT'];
const platforms = ['CPU-GPU', 'CPU-FPGA', 'CPU-DSA'];
const allDatasetsOption = 'all-datasets';

// 算法-平台组合对应的数据集映射
const datasetsByAlgorithmAndPlatform = {
  'PageRank': {
    'CPU-GPU': ['Rmat-18', 'Rmat-19', 'Rmat-20'],
    'CPU-FPGA': ['Rmat-16', 'Rmat-18', 'Rmat-20'],
    'CPU-DSA': ['Rmat-18', 'Rmat-19', 'Rmat-20']
  },
  'ViT': {
    'CPU-GPU': ['ImageNet', 'DriveSeg'],
    'CPU-FPGA': ['ImageNet', 'DriveSeg'],
    'CPU-DSA': ['ImageNet', 'DriveSeg']
  }
};

// 获取指定算法和平台组合的可用数据集
const getAvailableDatasets = (algorithm, platform) => {
  return datasetsByAlgorithmAndPlatform[algorithm]?.[platform] || [];
};

// 保留原有结构用于兼容性（如排序等功能）
const datasetsByAlgorithm = {
  'PageRank': ['Rmat-16', 'Rmat-18', 'Rmat-20'],
  'ViT': ['ImageNet', 'DriveSeg']
};

// 算法详情、数据集信息和工具函数已从 ./info 导入


export default function Page() {
  // 算法选择
  const [selectedAlgo, setSelectedAlgo] = useState(algorithms[0]);
  const [selectedPlatform, setSelectedPlatform] = useState(platforms[0]);
  const [selectedDataset, setSelectedDataset] = useState(getAvailableDatasets(algorithms[0], platforms[0])[0]);
  const [selectedCardCount, setSelectedCardCount] = useState(DEFAULT_CARD_COUNT[platforms[0]]);
  // 控制标签页切换
  const [prTabValue, setPrTabValue] = useState(0);
  const [vitTabValue, setVitTabValue] = useState(0);
  const [prChartPlatform, setPrChartPlatform] = useState(platforms[0]);
  const [vitChartPlatform, setVitChartPlatform] = useState(platforms[0]);
  const [logs, setLogs] = useState([]);
  const [running, setRunning] = useState(false);
  const [performanceData, setPerformanceData] = useState([]);
  // 为PageRank和ViT分别设置硬件平台选择
  // const [prChartMetric, setPrChartMetric] = useState(platforms[0]);
  // const [vitChartMetric, setVitChartMetric] = useState(platforms[0]);
  // const [chartMetric, setChartMetric] = useState(platforms[0]); // 添加统一的图表指标状态
  
  // 参考线（中期指标）状态
  const [showReferenceLine, setShowReferenceLine] = useState(false);
  const logBoxRef = React.useRef(null);
  const performanceRef = React.useRef(null); // 添加性能对比区域的ref

  // 自动滚动到底部
  const scrollToBottom = () => {
    if (logBoxRef.current) {
      logBoxRef.current.scrollTop = logBoxRef.current.scrollHeight;
    }
  };

  // 监听日志变化，自动滚动
  React.useEffect(() => {
    scrollToBottom();
  }, [logs]);

  // 监听平台选择变化，同步更新chartMetric和卡数
  useEffect(() => {
    // setPrChartMetric(selectedPlatform);
    // setVitChartMetric(selectedPlatform);
    setPrChartPlatform(selectedPlatform);
    setVitChartPlatform(selectedPlatform);
    // setChartMetric(selectedPlatform); // 更新统一的图表指标状态
    setSelectedCardCount(DEFAULT_CARD_COUNT[selectedPlatform]); // 更新默认卡数
  }, [selectedPlatform]);

  // 判断按钮是否不可用
  const isButtonDisabled = () => running;

  // 生成性能数据
  const generatePerformanceData = (algorithm, dataset, platform, cardCount = selectedCardCount) => {
    // 从预定义的性能数据中获取
    if (!PERFORMANCE_DATA[algorithm]) {
      console.error(`未找到 ${algorithm} 的性能数据`);
      return null;
    }
    
    // 获取特定平台的数据
    const platformKey = platform.split('-')[1] || platform;
    if (!PERFORMANCE_DATA[algorithm][platformKey]) {
      console.error(`未找到 ${algorithm} 在平台 ${platformKey} 上的性能数据`);
      return null;
    }
    
    // 获取特定卡数的数据
    const platformData = PERFORMANCE_DATA[algorithm][platformKey];
    let cardData;
    
    if (typeof platformData === 'object' && !Array.isArray(platformData)) {
      // 新的数据结构：按卡数分组
      cardData = platformData[cardCount];
      if (!cardData) {
        console.error(`未找到 ${algorithm} 在平台 ${platformKey} 上 ${cardCount}卡 的性能数据`);
        return null;
      }
    } else {
      // 旧的数据结构：直接是数组
      cardData = platformData;
    }
    
    // 查找匹配的数据集
    const datasetEntry = cardData.find(item => item.Dataset === dataset);
    
    if (!datasetEntry) {
      console.error(`未找到 ${algorithm}-${dataset}-${platformKey}-${cardCount}卡 的性能数据`);
      return null;
    }
    
    return {
      algorithm,
      dataset,
      platform,
      cardCount,
      baselineTime: datasetEntry["Baseline-Time(s)"],
      optimizedTime: datasetEntry["Dataflow-Time(s)"],
      speedUp: datasetEntry["Baseline-Time(s)"] / datasetEntry["Dataflow-Time(s)"],
      baselineThroughput: datasetEntry["Baseline-Throughput"],
      optimizedThroughput: datasetEntry["Dataflow-Throughput"],
      throughputSpeedup: datasetEntry["Dataflow-Throughput"] / datasetEntry["Baseline-Throughput"]
    };
  };

  // 获取有效数据（已执行的数据集）
  const getValidData = () => {
    return performanceData;
  };

  // 生成图表数据
  const getChartData = (platform) => {
    // 只过滤选定平台的数据，不过滤卡数，显示所有已执行的数据
    const filteredData = getValidData().filter(item => 
      item.platform === platform
    );
    
    // 转换为图表所需格式，在名称中包含卡数信息以区分不同卡数的数据
    return filteredData.map(item => ({
      name: `${item.dataset}(${item.cardCount}卡)`,
      algorithm: item.algorithm,
      speedUp: item.speedUp,
      throughputSpeedup: item.throughputSpeedup,
      baselineTime: item.baselineTime,
      optimizedTime: item.optimizedTime,
      baselineThroughput: item.baselineThroughput,
      optimizedThroughput: item.optimizedThroughput
    }));
  };

  // 添加滚动到性能对比区域的函数
  const scrollToPerformance = () => {
    performanceRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 从日志文件读取内容
  const readLogFile = async (algorithm, dataset, platform) => {
    try {
      // 将算法、数据集、平台名称转换为URL格式
      const algoUrl = URL_MAPS.algorithm[algorithm];
      const datasetUrl = URL_MAPS.dataset[dataset];
      const platformUrl = URL_MAPS.platform[platform];
      
      // 构建日志文件路径: algoUrl_platformUrl_num_datasetUrl.log
      const logFilePath = `/log/distrib/${algoUrl}_${platformUrl}_${selectedCardCount}_${datasetUrl}.log`;
      console.log(logFilePath);
      
      // 读取日志文件
      const response = await fetch(logFilePath);
      if (!response.ok) {
        throw new Error(`无法读取日志文件: ${response.status}`);
      }
      
      const logContent = await response.text();
      
      // 将日志内容按行分割并逐行显示
      const logLines = logContent.split('\n');
      
      // 清空之前的日志
      setLogs([`开始执行图算法 ${algorithm}，数据集 ${dataset}，平台 ${platform}：`]);
      
      // 模拟逐行输出日志
      for (let i = 0; i < logLines.length; i++) {
        if (logLines[i].trim() !== '') {
          // 使用闭包保存当前索引
          ((index) => {
            setTimeout(() => {
              setLogs(prev => [...prev, logLines[index]]);
            }, index * 100); // 每行之间间隔100ms
          })(i);
        }
      }
      
      // 最后添加完成信息
      setTimeout(() => {
        setLogs(prev => [...prev, `✅ ${algorithm}-${dataset}-${platform} 执行完成`]);
        setRunning(false);
        
        // 生成性能数据并更新
        const performanceEntry = generatePerformanceData(algorithm, dataset, platform, selectedCardCount);
        updatePerformanceData(performanceEntry);
      }, logLines.length * 100 + 500);
      
    } catch (error) {
      setLogs(prev => [...prev, `❌ 读取日志文件失败: ${error.message}`]);
      setRunning(false);
    }
  };

  // 更新性能数据
  const updatePerformanceData = (newEntry) => {
    if (!newEntry) return;
    
    console.log('更新性能数据:', newEntry);
    
    setPerformanceData(prev => {
      // 过滤掉相同算法、数据集、平台、卡数的旧数据
      const filtered = prev.filter(item => 
        !(item.algorithm === newEntry.algorithm && 
          item.dataset === newEntry.dataset && 
          item.platform === newEntry.platform &&
          item.cardCount === newEntry.cardCount)
      );
      
      // 添加新数据并排序
      const newData = [...filtered, newEntry].sort((a, b) => {
        // 首先按算法排序
        if (a.algorithm !== b.algorithm) {
          return algorithms.indexOf(a.algorithm) - algorithms.indexOf(b.algorithm);
        }
        // 然后按数据集排序
        if (a.dataset !== b.dataset) {
          return datasetsByAlgorithm[a.algorithm].indexOf(a.dataset) - 
                 datasetsByAlgorithm[b.algorithm].indexOf(b.dataset);
        }
        // 如果有平台信息，按平台排序
        if (a.platform && b.platform) {
          return platforms.indexOf(a.platform) - platforms.indexOf(b.platform);
        }
        return 0;
      });
      
      console.log('更新后的性能数据:', newData);
      return newData;
    });
  };

  const handleRun = async () => {
    if (running) return;

    setRunning(true);

    try {
      // 不再清空不同算法的数据，允许多算法数据共存
      
      // 处理"全部数据集"选项
      if (selectedDataset === allDatasetsOption) {
        setLogs(['正在加载全部数据集...']);
        
        // 获取当前选中算法-平台组合的所有数据集
        const datasetsToProcess = getAvailableDatasets(selectedAlgo, selectedPlatform);
        
        // 依次处理每个数据集
        for (const dataset of datasetsToProcess) {
          const runMode = getRunMode(selectedPlatform, selectedAlgo, dataset);
          
          if (runMode === 'log') {
            await readLogFile(selectedAlgo, dataset, selectedPlatform);
          } else {
            // 实现run模式的逻辑
            setLogs(prev => [...prev, `暂不支持 ${selectedAlgo}-${dataset}-${selectedPlatform} 的run模式`]);
          }
        }
        
        setLogs(prev => [...prev, '全部数据集加载完成']);
        setRunning(false);
        return;
      }

      // 处理单个数据集
      const runMode = getRunMode(selectedPlatform, selectedAlgo, selectedDataset);
      
      if (runMode === 'log') {
        await readLogFile(selectedAlgo, selectedDataset, selectedPlatform);
      } else {
        // 实现run模式的逻辑
        setLogs([`开始执行图算法 ${selectedAlgo}，数据集 ${selectedDataset}，平台 ${selectedPlatform}：`]);
        setLogs(prev => [...prev, '正在与服务器建立连接...']);
        
        // 不再清空不同算法的数据，允许多算法数据共存
        
        // 获取URL映射
        const urlAlgo = URL_MAPS.algorithm[selectedAlgo];
        const urlData = URL_MAPS.dataset[selectedDataset];
        
        // 执行流式命令
        //const eventSource = new EventSource(`${request.BASE_URL}/part2/execute/${urlAlgo}/${urlData}/`);
        const eventSource = new EventSource(`${request.BASE_URL}/dist_vit_test/`);
        
        eventSource.onmessage = async (event) => {
          if (event.data === '[done]') {
            eventSource.close();
            setRunning(false);
            
            const performanceEntry = generatePerformanceData(selectedAlgo, selectedDataset, selectedPlatform, selectedCardCount);
            updatePerformanceData(performanceEntry);
            
            // setLogs(prev => [...prev, `正在拷贝 ${selectedDataset} 的result...`]);
            
            // try {
            //   const res = await fetch(`${request.BASE_URL}/part2/result/${urlAlgo}/${urlData}/`);
            //   const jsonData = await res.json();
              
            //   setLogs(prev => [...prev, `✅ ${selectedAlgo}-${selectedDataset}-${selectedPlatform} 执行完成`]);
            //   setRunning(false);
              
            //   // 生成性能数据并更新
            //   const performanceEntry = generatePerformanceData(selectedAlgo, selectedDataset, selectedPlatform);
            //   updatePerformanceData(performanceEntry);
              
            // } catch (error) {
            //   setLogs(prev => [...prev, `❌ 获取结果失败: ${error.message}`]);
            //   setRunning(false);
            // }
          } else if (event.data === '[error]') {
            eventSource.close();
            setLogs(prev => [...prev, `❌ 服务器执行出错：${selectedAlgo}-${selectedDataset}-${selectedPlatform}`]);
            setRunning(false);
          } else {
            setLogs(prev => [...prev, `${event.data}`]);
          }
        };
        
        eventSource.onerror = () => {
          eventSource.close();
          setLogs(prev => [...prev, `❌ ${selectedAlgo}-${selectedDataset}-${selectedPlatform} 连接错误`]);
          setRunning(false);
        };
      }
    } catch (error) {
      setLogs(prev => [...prev, `❌ 执行失败: ${error.message}`]);
      setRunning(false);
    }
  };

  return (
    <Box sx={{ p: 2, backgroundColor: '#f5f6fa' }}>
      <Grid item xs={12} sx={{ mb: 3 }}>
        <AssessmentCriteria />
    </Grid>
      <Grid container spacing={3}>
        {/* 左侧列 - 算法选择卡片 */}
        <Grid item xs={12} md={4}>
          {/* 算法选择卡片 */}
          <Paper elevation={3} sx={{ p: 2, borderRadius: 3 }}>
            <Typography variant="h6" sx={{
              fontWeight: 700,
              mb: 2,
              color: 'secondary.main',
              borderBottom: '2px solid',
              borderColor: 'secondary.main',
              pb: 1
            }}>
              算法选择
            </Typography>

            <Typography variant="subtitle1" sx={{ fontWeight: 550, mb: 1 }}>
              选择硬件平台
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Select
                value={selectedPlatform}
                onChange={(e) => {
                  const newPlatform = e.target.value;
                  setSelectedPlatform(newPlatform);
                  // 重置数据集选择为新平台组合的第一个可用数据集
                  const availableDatasets = getAvailableDatasets(selectedAlgo, newPlatform);
                  if (availableDatasets.length > 0) {
                    setSelectedDataset(availableDatasets[0]);
                  }
                }}
                sx={{ flex: 1 }}
              >
                {platforms.map(platform => (
                  <MenuItem key={platform} value={platform}>{platform}</MenuItem>
                ))}
              </Select>
              <Select
                value={selectedCardCount}
                onChange={(e) => setSelectedCardCount(e.target.value)}
                sx={{ minWidth: 80 }}
              >
                {CARD_OPTIONS[selectedPlatform]?.map(count => (
                  <MenuItem key={count} value={count}>{count}卡</MenuItem>
                ))}
              </Select>
            </Box>

            <Typography variant="subtitle1" sx={{ fontWeight: 550, mb: 1 }}>
              选择算法
            </Typography>
            <Select
              fullWidth
              value={selectedAlgo}
              onChange={(e) => {
                const newAlgo = e.target.value;
                setSelectedAlgo(newAlgo);
                // 重置数据集选择为新算法-平台组合的第一个可用数据集
                const availableDatasets = getAvailableDatasets(newAlgo, selectedPlatform);
                if (availableDatasets.length > 0) {
                  setSelectedDataset(availableDatasets[0]);
                }
              }}
              sx={{ mb: 2 }}
            >
              {algorithms.map(algo => (
                <MenuItem key={algo} value={algo}>{algo}</MenuItem>
              ))}
            </Select>

            <Typography variant="subtitle1" sx={{ fontWeight: 550, mb: 1 }}>
              选择数据集
            </Typography>
            <Select
              fullWidth
              value={selectedDataset}
              onChange={(e) => setSelectedDataset(e.target.value)}
              sx={{ mb: 2 }}
            >
              {getAvailableDatasets(selectedAlgo, selectedPlatform).map(ds => (
                <MenuItem key={ds} value={ds}>{ds}</MenuItem>
              ))}
              <MenuItem value={allDatasetsOption}>全部数据集</MenuItem>
            </Select>

            <Button
              variant="contained"
              fullWidth
              onClick={handleRun}
              disabled={isButtonDisabled()}
              color="success"
              sx={{ py: 1.5 }}
            >
              {running ? '执行中...' : '开始执行'}
            </Button>
            {running && <LinearProgress sx={{ mt: 1 }} />}
          </Paper>
        </Grid>

        {/* 右侧列 - 控制台输出 */}
        <Grid item xs={12} md={8}>
          {/* 控制台输出 */}
          <Paper elevation={3} sx={{
            p: 2,
            height: 470,
            borderRadius: 3,
            overflow: 'hidden'
          }}>
            <Typography variant="h6" sx={{
              fontWeight: 700,
              mb: 2,
              color: 'secondary.main',
              borderBottom: '2px solid',
              borderColor: 'secondary.main',
              pb: 1
            }}>
              执行日志
            </Typography>
            <Box sx={{
              height: 400,
              overflow: 'auto',
              fontFamily: 'monospace',
              fontSize: '0.8rem',
              backgroundColor: '#1a1a1a',
              borderRadius: 2,
              p: 1.5,
              '& > div': {
                color: '#4caf50',
                lineHeight: 1.6,
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                py: 0.5
              }
            }} ref={logBoxRef}>
              {logs.map((log, index) => (
                <div key={index}>{`> ${log}`}</div>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* 算法详情和数据集信息横向排布 - 占满整个屏幕宽度 */}
        <Grid container item xs={12} spacing={3}>
          {/* 算法详情卡片 */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 2, borderRadius: 3 }}>
              <Typography variant="h6" sx={{
                fontWeight: 700,
                mb: 2,
                color: 'secondary.main',
                borderBottom: '2px solid',
                borderColor: 'secondary.main',
                pb: 1
              }}>
                算法详情
              </Typography>
              <AlgorithmDetails algorithm={selectedAlgo} />
            </Paper>
          </Grid>

          {/* 数据集信息卡片 */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 2, borderRadius: 3 }}>
              <Typography variant="h6" sx={{
                fontWeight: 700,
                mb: 2,
                color: 'secondary.main',
                borderBottom: '2px solid',
                borderColor: 'secondary.main',
                pb: 1
              }}>
                {selectedDataset === allDatasetsOption ? '数据集概览' : '数据集信息'}
              </Typography>
              {selectedDataset === allDatasetsOption ? (
                <Box>
                  {getAvailableDatasets(selectedAlgo, selectedPlatform).map(ds => (
                    <Box key={ds} sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        <strong>{ds}:</strong>
                      </Typography>
                      <DatasetInfo dataset={ds} />
                    </Box>
                  ))}
                </Box>
              ) : (
                <DatasetInfo dataset={selectedDataset} />
              )}
            </Paper>
          </Grid>
        </Grid>

        {/* 性能对比详情 - 左右分布 */}
        <Grid item xs={12} ref={performanceRef}>
          <Grid container spacing={2}>
            {/* 左侧窗口 - PageRank性能对比 */}
            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ p: 2, borderRadius: 3, height: 'fit-content' }}>
                <Typography variant="h6" sx={{
                  fontWeight: 700,
                  mb: 2,
                  color: 'secondary.main',
                  borderBottom: '2px solid',
                  borderColor: 'secondary.main',
                  pb: 1
                }}>
                  PageRank性能对比详情
                </Typography>

                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                  <Tabs value={prTabValue} onChange={(e, v) => setPrTabValue(v)}>
                    <Tab label="图表视图" />
                    <Tab label="表格视图" />
                  </Tabs>
                </Box>

                {prTabValue === 0 ? (
                  <Box>
                    <Tabs
                      value={prChartPlatform}
                      onChange={(e, v) => setPrChartPlatform(v)}
                      sx={{ mb: 2 }}
                      variant="scrollable"
                      scrollButtons="auto"
                    >
                      {platforms.map(platform => (
                        <Tab key={platform} label={platform} value={platform} />
                      ))}
                    </Tabs>

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle1" align="center" sx={{ fontWeight: 550, mb: 1 }}>
                        PageRank - 执行时间对比 (秒)
                      </Typography>
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart
                          data={getChartData(prChartPlatform).filter(item => item.algorithm === 'PageRank')}
                          margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                          barSize={35}
                          barGap={5}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis label={{ value: '时间 (秒)', angle: -90, position: 'insideLeft' }} />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="baselineTime" fill="#7f58af" name="TensorFlow执行时间" />
                          <Bar dataKey="optimizedTime" fill="#64b5f6" name="优化执行时间" />
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>

                    <Box>
                      <Typography variant="subtitle1" align="center" sx={{ fontWeight: 550, mb: 1 }}>
                        PageRank - 吞吐量对比 (GTEPS)
                      </Typography>
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart
                          data={getChartData(prChartPlatform).filter(item => item.algorithm === 'PageRank')}
                          margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                          barSize={35}
                          barGap={5}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis label={{ value: 'GTEPS', angle: -90, position: 'insideLeft' }} />
                          <Tooltip 
                            formatter={(value, name) => {
                              return [`${value.toFixed(3)} GTEPS`, name];
                            }}
                          />
                          <Legend />
                          <Bar dataKey="baselineThroughput" fill="#26a69a" name="TensorFlow吞吐量" />
                          <Bar dataKey="optimizedThroughput" fill="#ef5350" name="优化吞吐量" />
                          <ReferenceLine
                            y={midtermMetrics['PageRank']}
                            stroke="red"
                            strokeDasharray="3 3"
                            strokeOpacity={showReferenceLine ? 1 : 0}
                            style={{
                              opacity: showReferenceLine ? 1 : 0,
                              transition: 'opacity 0.3s ease-in-out'
                            }}
                            label={{
                              value: `中期指标\n(${midtermMetrics['PageRank']} GTEPS)`,
                              position: 'insideRight',
                              fill: 'red',
                              fontSize: 14,
                              fontWeight: 'bold', 
                              dy: -10,
                              opacity: showReferenceLine ? 1 : 0,
                              transition: 'opacity 0.3s'
                            }}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                  </Box>
                ) : (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>数据集</TableCell>
                          <TableCell>硬件平台</TableCell>
                          <TableCell>卡数</TableCell>
                          <TableCell>TensorFlow时间(s)</TableCell>
                          <TableCell>优化时间(s)</TableCell>
                          <TableCell>加速比</TableCell>
                          <TableCell>TensorFlow吞吐量</TableCell>
                          <TableCell>优化吞吐量</TableCell>
                          <TableCell>吞吐量提升</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {getValidData().filter(row => row.algorithm === 'PageRank').map((row, index) => (
                          <TableRow key={index}>
                            <TableCell>{row.dataset}</TableCell>
                            <TableCell>{row.platform}</TableCell>
                            <TableCell>{row.cardCount}</TableCell>
                            <TableCell>{row.baselineTime.toFixed(3)}</TableCell>
                            <TableCell>{row.optimizedTime.toFixed(3)}</TableCell>
                            <TableCell>{row.speedUp.toFixed(3)}</TableCell>
                            <TableCell>{`${row.baselineThroughput.toFixed(3)} ${getThroughputUnit(row.algorithm)}`}</TableCell>
                            <TableCell>{`${row.optimizedThroughput.toFixed(3)} ${getThroughputUnit(row.algorithm)}`}</TableCell>
                            <TableCell>{row.throughputSpeedup.toFixed(3)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Paper>
            </Grid>

            {/* 右侧窗口 - ViT性能对比 */}
            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ p: 2, borderRadius: 3, height: 'fit-content' }}>
                <Typography variant="h6" sx={{
                  fontWeight: 700,
                  mb: 2,
                  color: 'secondary.main',
                  borderBottom: '2px solid',
                  borderColor: 'secondary.main',
                  pb: 1
                }}>
                  ViT性能对比详情
                </Typography>

                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                  <Tabs value={vitTabValue} onChange={(e, v) => setVitTabValue(v)}>
                    <Tab label="图表视图" />
                    <Tab label="表格视图" />
                  </Tabs>
                </Box>

                {vitTabValue === 0 ? (
                  <Box>
                    <Tabs
                      value={vitChartPlatform}
                      onChange={(e, v) => setVitChartPlatform(v)}
                      sx={{ mb: 2 }}
                      variant="scrollable"
                      scrollButtons="auto"
                    >
                      {platforms.map(platform => (
                        <Tab key={platform} label={platform} value={platform} />
                      ))}
                    </Tabs>

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle1" align="center" sx={{ fontWeight: 550, mb: 1 }}>
                        ViT - 执行时间对比 (秒)
                      </Typography>
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart
                          data={getChartData(vitChartPlatform).filter(item => item.algorithm === 'ViT')}
                          margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                          barSize={35}
                          barGap={5}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis label={{ value: '时间 (秒)', angle: -90, position: 'insideLeft' }} />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="baselineTime" fill="#7f58af" name="TensorFlow执行时间" />
                          <Bar dataKey="optimizedTime" fill="#64b5f6" name="优化执行时间" />
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>

                    <Box>
                      <Typography variant="subtitle1" align="center" sx={{ fontWeight: 550, mb: 1 }}>
                        ViT - 吞吐量对比 (GFLOPS)
                      </Typography>
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart
                          data={getChartData(vitChartPlatform).filter(item => item.algorithm === 'ViT')}
                          margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                          barSize={35}
                          barGap={5}
                          onMouseEnter={() => setShowReferenceLine(true)}
                          onMouseLeave={() => setShowReferenceLine(false)}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis label={{ value: 'GFLOPS', angle: -90, position: 'insideLeft' }} />
                          <Tooltip 
                            formatter={(value, name) => {
                              return [`${value.toFixed(3)} GFLOPS`, name];
                            }}
                          />
                          <Legend />
                          <Bar dataKey="baselineThroughput" fill="#26a69a" name="TensorFlow吞吐量" />
                          <Bar dataKey="optimizedThroughput" fill="#ef5350" name="优化吞吐量" />
                          <ReferenceLine
                            y={midtermMetrics['ViT']}
                            stroke="red"
                            strokeDasharray="3 3"
                            strokeOpacity={showReferenceLine ? 1 : 0}
                            style={{
                              opacity: showReferenceLine ? 1 : 0,
                              transition: 'opacity 0.3s ease-in-out'
                            }}
                            label={{
                              value: `中期指标\n(${midtermMetrics['ViT']} GFLOPS)`,
                              position: 'insideRight',
                              fill: 'red',
                              fontSize: 14,
                              fontWeight: 'bold', 
                              dy: -10,
                              opacity: showReferenceLine ? 1 : 0,
                              transition: 'opacity 0.3s'
                            }}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                  </Box>
                ) : (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>数据集</TableCell>
                          <TableCell>硬件平台</TableCell>
                          <TableCell>卡数</TableCell>
                          <TableCell>TensorFlow时间(s)</TableCell>
                          <TableCell>优化时间(s)</TableCell>
                          <TableCell>加速比</TableCell>
                          <TableCell>TensorFlow吞吐量</TableCell>
                          <TableCell>优化吞吐量</TableCell>
                          <TableCell>吞吐量提升</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {getValidData().filter(item => item.algorithm === 'ViT').map((row, index) => (
                          <TableRow key={index}>
                            <TableCell>{row.dataset}</TableCell>
                            <TableCell>{row.platform}</TableCell>
                            <TableCell>{row.cardCount}</TableCell>
                            <TableCell>{row.baselineTime.toFixed(2)}</TableCell>
                            <TableCell>{row.optimizedTime.toFixed(2)}</TableCell>
                            <TableCell>{row.speedup.toFixed(2)}x</TableCell>
                            <TableCell>{row.baselineThroughput.toFixed(2)} {getThroughputUnit('ViT')}</TableCell>
                            <TableCell>{row.optimizedThroughput.toFixed(2)} {getThroughputUnit('ViT')}</TableCell>
                            <TableCell>{row.throughputImprovement.toFixed(2)}x</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}
