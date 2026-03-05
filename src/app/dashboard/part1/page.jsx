"use client";
import React, { useState, useEffect } from 'react';
import { Box, Grid, Paper, Typography, Select, MenuItem, Button, Tabs, Tab, Table, 
  TableBody, TableCell, TableContainer, TableHead, TableRow, LinearProgress } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import request from '@/lib/request/request';
import { URL_MAPS, getRunMode, PERFORMANCE_DATA } from './constData';
import { AssessmentCriteria, AlgorithmDetails, DatasetInfo, getThroughputUnit } from './info';

// 定义可选项
const algorithms = ['PageRank', 'ViT'];
const platforms = ['CPU', 'GPU', 'FPGA'];
const allDatasetsOption = 'all-datasets';

// 不同算法对应的数据集（保留兼容性）
const datasetsByAlgorithm = {
  'PageRank': ['Rmat-16', 'Rmat-18', 'Rmat-20'],
  'ViT': ['ImageNet', 'DriveSeg']
};

// 不同算法-平台组合对应的数据集
const datasetsByAlgorithmAndPlatform = {
  'PageRank': {
    'CPU': ['Rmat-18', 'Rmat-19', 'Rmat-20'],
    'GPU': ['Rmat-18', 'Rmat-19', 'Rmat-20'],
    'FPGA': ['Rmat-18', 'Rmat-19', 'Rmat-20']
  },
  'ViT': {
    'CPU': ['ImageNet', 'DriveSeg'],
    'GPU': ['ImageNet', 'DriveSeg'],
    'FPGA': ['ImageNet', 'DriveSeg']
  }
};

// 获取当前算法-平台组合的可用数据集
const getAvailableDatasets = (algorithm, platform) => {
  return datasetsByAlgorithmAndPlatform[algorithm]?.[platform] || [];
};

// 算法详情、数据集信息和工具函数已从 ./info 导入

export default function Page() {
  const [selectedAlgo, setSelectedAlgo] = useState(algorithms[0]);
  const [selectedPlatform, setSelectedPlatform] = useState(platforms[0]);
  const [selectedDataset, setSelectedDataset] = useState(getAvailableDatasets(algorithms[0], platforms[0])[0]);
  // 控制标签页切换
  const [prTabValue, setPrTabValue] = useState(0);
  const [vitTabValue, setVitTabValue] = useState(0);
  const [prChartPlatform, setPrChartPlatform] = useState(platforms[0]);
  const [vitChartPlatform, setVitChartPlatform] = useState(platforms[0]);
  const [logs, setLogs] = useState([]);
  const [running, setRunning] = useState(false);
  const [performanceData, setPerformanceData] = useState([]);
  const [chartMetric, setChartMetric] = useState(platforms[0]);
  const logBoxRef = React.useRef(null);
  const performanceRef = React.useRef(null);

  // 自动滚动到底部
  const scrollToBottom = () => {
    if (logBoxRef.current) {
      logBoxRef.current.scrollTop = logBoxRef.current.scrollHeight;
    }
  };

  // 滚动到性能对比区域
  const scrollToPerformance = () => {
    if (performanceRef.current) {
      performanceRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // 监听平台选择变化，同步更新chartMetric
  useEffect(() => {
    setPrChartPlatform(selectedPlatform);
    setVitChartPlatform(selectedPlatform);
    setChartMetric(selectedPlatform);
  }, [selectedPlatform]);

  // 监听日志变化，自动滚动
  React.useEffect(() => {
    scrollToBottom();
  }, [logs]);

  // 判断按钮是否不可用
  const isButtonDisabled = () => running;

  // 从日志文件读取内容
  const readLogFile = async (algorithm, dataset, platform) => {
    try {
      // 将算法、数据集、平台名称转换为URL格式
      const algoUrl = URL_MAPS.algorithm[algorithm];
      const datasetUrl = URL_MAPS.dataset[dataset];
      const platformUrl = URL_MAPS.platform[platform];
      
      // 构建日志文件路径
      const logFilePath = `/log/single/${algoUrl}_${platformUrl}_${datasetUrl}.log`;
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
        const performanceEntry = generatePerformanceData(algorithm, dataset, platform);
        updatePerformanceData(performanceEntry);
        
        // 执行完成后滚动到性能对比区域
        setTimeout(() => scrollToPerformance(), 500);
      }, logLines.length * 100 + 500);
      
    } catch (error) {
      setLogs(prev => [...prev, `❌ 读取日志文件失败: ${error.message}`]);
      setRunning(false);
    }
  };

  // 生成性能数据
  const generatePerformanceData = (algorithm, dataset, platform, realTimeMetrics = null) => {
    // 如果有实时指标，无论平台如何，都使用实时数据
    if ((algorithm === 'PageRank' || algorithm === 'ViT') && realTimeMetrics) {
      console.log('Using real-time metrics:', realTimeMetrics);
      const { gteps, totalCost, executionTime } = realTimeMetrics;
      
      // 使用预设的baseline数据进行对比
      let baselineData = null;
      if (PERFORMANCE_DATA[algorithm] && PERFORMANCE_DATA[algorithm][platform]) {
        const platformData = PERFORMANCE_DATA[algorithm][platform];
        baselineData = platformData.find(item => item.Dataset === dataset);
      }
      
      // 确定实际执行时间
      // DSA/CPU使用totalCost，FPGA使用executionTime
      const actualTime = totalCost || executionTime;
      
      // 如果没有baseline数据，使用默认值
      const baselineTime = baselineData ? baselineData['Baseline-Time(s)'] : actualTime * 2;
      const baselineThroughput = baselineData ? baselineData['Baseline-Throughput'] : gteps * 0.5;
      
      return {
        algorithm,
        dataset,
        platform,
        baselineTime: baselineTime,
        optimizedTime: actualTime,
        speedUp: baselineTime / actualTime,
        efficiencyImprovement: ((baselineTime - actualTime) / baselineTime * 100),
        baselineThroughput: baselineThroughput,
        optimizedThroughput: gteps,
        throughputSpeedup: gteps / baselineThroughput
      };
    }
    
    // 其他情况使用预定义的性能数据
    if (!PERFORMANCE_DATA[algorithm]) {
      console.error(`未找到 ${algorithm} 的性能数据`);
      return null;
    }
    
    // 检查平台数据是否存在
    if (!PERFORMANCE_DATA[algorithm][platform]) {
      console.error(`未找到 ${algorithm}-${platform} 的性能数据`);
      return null;
    }
    
    const platformData = PERFORMANCE_DATA[algorithm][platform];
    const datasetEntry = platformData.find(item => item.Dataset === dataset);
    
    if (!datasetEntry) {
      console.error(`未找到 ${algorithm}-${dataset}-${platform} 的性能数据`);
      return null;
    }
    
    return {
      algorithm,
      dataset,
      platform,
      baselineTime: datasetEntry['Baseline-Time(s)'],
      optimizedTime: datasetEntry['Dataflow-Time(s)'],
      speedUp: datasetEntry['Baseline-Time(s)'] / datasetEntry['Dataflow-Time(s)'],
      // 执行效率提升
      efficiencyImprovement: ((datasetEntry['Baseline-Time(s)'] - datasetEntry['Dataflow-Time(s)']) / datasetEntry['Baseline-Time(s)'] * 100),
      baselineThroughput: datasetEntry['Baseline-Throughput'],
      optimizedThroughput: datasetEntry['Dataflow-Throughput'],
      throughputSpeedup: datasetEntry['Dataflow-Throughput'] / datasetEntry['Baseline-Throughput']
    };
  };

  // 更新性能数据
  const updatePerformanceData = (newEntry) => {
    if (!newEntry) return;
    
    console.log('更新性能数据:', newEntry);
    
    setPerformanceData(prev => {
      // 过滤掉相同算法、数据集、平台的旧数据
      const filtered = prev.filter(item => 
        !(item.algorithm === newEntry.algorithm && 
          item.dataset === newEntry.dataset && 
          item.platform === newEntry.platform)
      );
      
      // 添加新数据并排序
      const newData = [...filtered, newEntry].sort((a, b) => {
        // 首先按算法排序
        if (a.algorithm !== b.algorithm) {
          return algorithms.indexOf(a.algorithm) - algorithms.indexOf(b.algorithm);
        }
        // 然后按数据集排序
        if (a.dataset !== b.dataset) {
          // 获取所有可能的数据集列表（合并所有平台的数据集）
          const allDatasets = a.algorithm === 'PageRank' 
            ? ['Rmat-16', 'Rmat-18', 'Rmat-19', 'Rmat-20']
            : ['ImageNet', 'DriveSeg'];
          const aIndex = allDatasets.indexOf(a.dataset);
          const bIndex = allDatasets.indexOf(b.dataset);
          return aIndex - bIndex;
        }
        // 最后按平台排序
        return platforms.indexOf(a.platform) - platforms.indexOf(b.platform);
      });
      
      console.log('更新后的性能数据:', newData);
      return newData;
    });
  };

  // 获取有效数据（已执行的数据集）
  const getValidData = () => {
    return performanceData;
  };

  // 生成图表数据
  const getChartData = (platform) => {
    // 过滤选定平台的数据
    const filteredData = getValidData().filter(item => item.platform === platform);
    
    // 转换为图表所需格式
    return filteredData.map(item => ({
      name: `${item.dataset}`,
      algorithm: item.algorithm,
      speedUp: item.speedUp,
      efficiencyImprovement: item.efficiencyImprovement,
      throughputSpeedup: item.throughputSpeedup,
      baselineTime: item.baselineTime,
      optimizedTime: item.optimizedTime,
      baselineThroughput: item.baselineThroughput,
      optimizedThroughput: item.optimizedThroughput
    }));
  };

  const handleRun = async () => {
    if (running) return;

    setRunning(true);

    try {
      // 不再清空之前的数据，允许同时显示不同算法的结果
      // if (performanceData.length > 0 && performanceData[0].algorithm !== selectedAlgo) {
      //   console.log('算法已更改，清空之前的性能数据');
      //   setPerformanceData([]);
      // }
      
      // 处理"全部数据集"选项
      if (selectedDataset === allDatasetsOption) {
        setLogs(['正在加载全部数据集...']);
        
        // 获取当前选中算法-平台组合的所有数据集
        const datasetsToProcess = getAvailableDatasets(selectedAlgo, selectedPlatform);
        
        // 等待
        await new Promise(resolve => setTimeout(resolve, 600));
        setLogs(['...']);
        await new Promise(resolve => setTimeout(resolve, 600));


        // 批量生成性能数据
        const newEntries = [];
        for (const dataset of datasetsToProcess) {
          const entry = generatePerformanceData(selectedAlgo, dataset, selectedPlatform);
          if (entry) {
            newEntries.push(entry);
          }
        }

        // 批量更新性能数据
        setPerformanceData(prev => {
          // 过滤掉即将更新的条目
          const filtered = prev.filter(item => 
            !newEntries.some(entry => 
              entry.algorithm === item.algorithm && 
              entry.dataset === item.dataset && 
              entry.platform === item.platform
            )
          );

          // 合并并排序
          const newData = [...filtered, ...newEntries].sort((a, b) => {
            // 首先按算法排序
            if (a.algorithm !== b.algorithm) {
              return algorithms.indexOf(a.algorithm) - algorithms.indexOf(b.algorithm);
            }
            // 然后按数据集排序
            if (a.dataset !== b.dataset) {
              const allDatasets = a.algorithm === 'PageRank' 
                ? ['Rmat-16', 'Rmat-18', 'Rmat-19', 'Rmat-20']
                : ['ImageNet', 'DriveSeg'];
              const aIndex = allDatasets.indexOf(a.dataset);
              const bIndex = allDatasets.indexOf(b.dataset);
              return aIndex - bIndex;
            }
            // 最后按平台排序
            return platforms.indexOf(a.platform) - platforms.indexOf(b.platform);
          });
          
          return newData;
        });
        
        setLogs(prev => [...prev, '全部数据集加载完成']);
        setRunning(false);
        
        // 执行完成后滚动到性能对比区域
        setTimeout(() => scrollToPerformance(), 500);
        return;
      }

      // 处理单个数据集
      const runMode = getRunMode(selectedPlatform, selectedAlgo, selectedDataset);
      console.log(runMode);
      
      if (runMode === 'log') {
        await readLogFile(selectedAlgo, selectedDataset, selectedPlatform);
      } else {
        // 实现run模式的逻辑
        setLogs([`开始执行图算法 ${selectedAlgo}，数据集 ${selectedDataset}，平台 ${selectedPlatform}：`]);
        setLogs(prev => [...prev, '正在与服务器建立连接...']);
        
        // 检查是否需要清空之前的数据
        const shouldClearData = performanceData.length > 0 && 
          performanceData[0].algorithm !== selectedAlgo;
        
        if (shouldClearData) {
          setPerformanceData([]);
        }
        
        
        let eventSource;
        let extractedMetrics = { gteps: null, totalCost: null };
        
        
        const urlPlatform = URL_MAPS.platform[selectedPlatform];
        const urlAlgo = URL_MAPS.algorithm[selectedAlgo];
        const urlData = URL_MAPS.dataset[selectedDataset];
        
        eventSource = new EventSource(`${request.BASE_URL}/api/single/${urlPlatform}/${urlAlgo}/${urlData}/`);

        
        eventSource.onmessage = async (event) => {
          if (event.data === '[done]') {
            eventSource.close();
            
            // 无论是DSA/FPGA/CPU，如果走的是后端模式且成功完成，尝试使用提取的指标
            // 如果提取失败（比如CPU脚本没输出指标），则回退到静态数据（因为extractedMetrics初始为null）
            setLogs(prev => [...prev, `✅ ${selectedAlgo}-${selectedDataset}-${selectedPlatform} 执行完成`]);
            
            setRunning(false);
            
            // 生成性能数据并更新，传入实时提取的性能指标
            const performanceEntry = generatePerformanceData(
              selectedAlgo, 
              selectedDataset, 
              selectedPlatform, 
              extractedMetrics.gteps && (extractedMetrics.totalCost || extractedMetrics.executionTime) ? extractedMetrics : null
            );
            updatePerformanceData(performanceEntry);
            
            // 执行完成后滚动到性能对比区域
            setTimeout(() => scrollToPerformance(), 500);

          } else if (event.data === '[error]') {
            eventSource.close();
            setLogs(prev => [...prev, `❌ 服务器执行出错：${selectedAlgo}-${selectedDataset}-${selectedPlatform}`]);
            setRunning(false);
          } else {
            // 显示日志并解析性能指标
            setLogs(prev => [...prev, `${event.data}`]);
            
            if (selectedAlgo === 'PageRank') {
              if (selectedPlatform === 'DSA') {
                // 解析DSA的GTEPS
                const gtepsMatch = event.data.match(/GTEPS:\s*([0-9.]+)/);
                if (gtepsMatch) {
                  extractedMetrics.gteps = parseFloat(gtepsMatch[1]);
                }
                
                // 解析DSA的Total Cost
                const costMatch = event.data.match(/Total Cost:\s*([0-9.]+)\s*seconds/);
                if (costMatch) {
                  extractedMetrics.totalCost = parseFloat(costMatch[1]);
                }
              } else if (selectedPlatform === 'FPGA') {
                // 解析FPGA的GTEPS
                const gtepsMatch = event.data.match(/GTEPS:\s*([0-9.]+)/);
                if (gtepsMatch) {
                  extractedMetrics.gteps = parseFloat(gtepsMatch[1]);
                }
                
                // 解析FPGA的执行时间（微秒转换为秒）
                const timeMatch = event.data.match(/执行时间:\s*([0-9.]+)\s*微秒/);
                if (timeMatch) {
                  extractedMetrics.executionTime = parseFloat(timeMatch[1]) / 1000000; // 微秒转秒
                }
              } else if (selectedPlatform === 'CPU') {
                // 解析CPU的GTEPS和时间
                // 日志格式：GTEPS: 0.014953
                const gtepsMatch = event.data.match(/GTEPS:\s*([0-9.]+)/i);
                if (gtepsMatch) {
                  extractedMetrics.gteps = parseFloat(gtepsMatch[1]);
                  console.log('CPU GTEPS extracted:', extractedMetrics.gteps);
                }
                
                // 日志格式：Total Cost: 18.61 seconds
                const costMatch = event.data.match(/Total Cost:\s*([0-9.]+)\s*seconds/i);
                if (costMatch) {
                   extractedMetrics.totalCost = parseFloat(costMatch[1]);
                   console.log('CPU Total Cost extracted:', extractedMetrics.totalCost);
                 }
               }
            } else if (selectedAlgo === 'ViT') {
              if (selectedPlatform === 'FPGA') {
                // 解析FPGA ViT的指标
                // 日志格式：Total inference time = 60.89 s
                const timeMatch = event.data.match(/Total inference time\s*=\s*([0-9.]+)\s*s/i);
                if (timeMatch) {
                  extractedMetrics.totalCost = parseFloat(timeMatch[1]);
                  console.log('ViT Total Cost extracted:', extractedMetrics.totalCost);
                }

                // 日志格式：Avg GFLOPS = 137.21
                const gflopsMatch = event.data.match(/Avg GFLOPS\s*=\s*([0-9.]+)/i);
                if (gflopsMatch) {
                  extractedMetrics.gteps = parseFloat(gflopsMatch[1]); // 复用gteps字段存储吞吐量
                  console.log('ViT GFLOPS extracted:', extractedMetrics.gteps);
                }
              }
            }
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
              pb: 1,
              fontSize: '1.3rem'
            }}>
              算法选择
            </Typography>

            <Typography variant="subtitle1" sx={{ fontWeight: 550, mb: 1 }}>
              选择硬件平台
            </Typography>
            <Select
              fullWidth
              value={selectedPlatform}
              onChange={(e) => {
                const newPlatform = e.target.value;
                setSelectedPlatform(newPlatform);
                // 重置数据集选择为新平台-算法组合的第一个可用数据集
                const availableDatasets = getAvailableDatasets(selectedAlgo, newPlatform);
                if (availableDatasets.length > 0) {
                  setSelectedDataset(availableDatasets[0]);
                }
              }}
              sx={{ mb: 1, fontSize: '1.2rem' }}
            >
              {platforms.map(platform => (
                <MenuItem key={platform} value={platform}>{platform}</MenuItem>
              ))}
            </Select>

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
              sx={{ mb: 1, fontSize: '1.2rem' }}
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
              sx={{ mb: 2, fontSize: '1.2rem' }}
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
              pb: 1,
              fontSize: '1.3rem'
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
                pb: 1,
                fontSize: '1.3rem'
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
                pb: 1,
                fontSize: '1.3rem'
              }}>
                {selectedDataset === allDatasetsOption ? '数据集概览' : '数据集信息'}
              </Typography>
              {selectedDataset === allDatasetsOption ? (
                <DatasetInfo 
                  dataset={getAvailableDatasets(selectedAlgo, selectedPlatform)} 
                />
              ) : (
                <DatasetInfo dataset={selectedDataset} />
              )}
            </Paper>
          </Grid>
        </Grid>

        {/* 性能对比卡片 - 左右分布 */}
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
                  pb: 1,
                  fontSize: '1.3rem'
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
                      <Typography variant="subtitle1" align="center" 
                      sx={{ fontWeight: 550, mb: 1, fontSize: '1.2rem' }}>
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
                          <Tooltip 
                            content={({ active, payload, label }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                  <div className="custom-tooltip" style={{
                                    backgroundColor: 'white',
                                    padding: '10px',
                                    border: '1px solid #ccc',
                                    borderRadius: '4px',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                  }}>
                                    <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>{label}</p>
                                    {payload.map((entry, index) => (
                                      <p key={index} style={{ margin: '2px 0', color: entry.color }}>
                                        {entry.name}: {entry.value.toFixed(3)}s
                                      </p>
                                    ))}
                                    <p style={{ margin: '5px 0 0 0', fontWeight: 'bold', color: '#666' }}>
                                       执行效率提升: {data.efficiencyImprovement ? data.efficiencyImprovement.toFixed(2) + '%' : 'N/A'}
                                     </p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Legend />
                          <Bar dataKey="baselineTime" fill="#7f58af" name="TensorFlow执行时间" />
                          <Bar dataKey="optimizedTime" fill="#64b5f6" name="优化执行时间" />
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>

                    <Box>
                      <Typography variant="subtitle1" align="center" 
                      sx={{ fontWeight: 550, mb: 1, fontSize: '1.2rem' }}>
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
                            content={({ active, payload, label }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                  <div className="custom-tooltip" style={{
                                    backgroundColor: 'white',
                                    padding: '10px',
                                    border: '1px solid #ccc',
                                    borderRadius: '4px',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                  }}>
                                    <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>{label}</p>
                                    {payload.map((entry, index) => (
                                      <p key={index} style={{ margin: '2px 0', color: entry.color }}>
                                        {entry.name}: {entry.value.toFixed(3)} GTEPS
                                      </p>
                                    ))}
                                    <p style={{ margin: '5px 0 0 0', fontWeight: 'bold', color: '#666' }}>
                                       吞吐量提升: {data.throughputSpeedup ? data.throughputSpeedup.toFixed(3) + ' x' : 'N/A'}
                                     </p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Legend />
                          <Bar dataKey="baselineThroughput" fill="#26a69a" name="TensorFlow吞吐量" />
                          <Bar dataKey="optimizedThroughput" fill="#ef5350" name="优化吞吐量" />
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
                          <TableCell>TensorFlow时间(s)</TableCell>
                          <TableCell>优化时间(s)</TableCell>
                          <TableCell>执行效率提升</TableCell>
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
                            <TableCell>{row.baselineTime.toFixed(3)}</TableCell>
                            <TableCell>{row.optimizedTime.toFixed(3)}</TableCell>
                            <TableCell>{row.efficiencyImprovement.toFixed(2)}%</TableCell>
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
                  pb: 1,
                  fontSize: '1.3rem'
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
                      <Typography variant="subtitle1" align="center" 
                      sx={{ fontWeight: 550, mb: 1, fontSize: '1.2rem' }}>
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
                          <Tooltip 
                            content={({ active, payload, label }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                  <div className="custom-tooltip" style={{
                                    backgroundColor: 'white',
                                    padding: '10px',
                                    border: '1px solid #ccc',
                                    borderRadius: '4px',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                  }}>
                                    <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>{label}</p>
                                    {payload.map((entry, index) => (
                                      <p key={index} style={{ margin: '2px 0', color: entry.color }}>
                                        {entry.name}: {entry.value.toFixed(3)}s
                                      </p>
                                    ))}
                                    <p style={{ margin: '5px 0 0 0', fontWeight: 'bold', color: '#666' }}>
                                       执行效率提升: {data.efficiencyImprovement ? data.efficiencyImprovement.toFixed(2) + '%' : 'N/A'}
                                     </p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Legend />
                          <Bar dataKey="baselineTime" fill="#7f58af" name="TensorFlow执行时间" />
                          <Bar dataKey="optimizedTime" fill="#64b5f6" name="优化执行时间" />
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>

                    <Box>
                      <Typography variant="subtitle1" align="center" 
                      sx={{ fontWeight: 550, mb: 1, fontSize: '1.2rem' }}>
                        ViT - 吞吐量对比 (GFLOPS)
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
                          <YAxis label={{ value: 'GFLOPS', angle: -90, position: 'insideLeft' }} />
                          <Tooltip 
                            content={({ active, payload, label }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                  <div className="custom-tooltip" style={{
                                    backgroundColor: 'white',
                                    padding: '10px',
                                    border: '1px solid #ccc',
                                    borderRadius: '4px',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                  }}>
                                    <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>{label}</p>
                                    {payload.map((entry, index) => (
                                      <p key={index} style={{ margin: '2px 0', color: entry.color }}>
                                        {entry.name}: {entry.value.toFixed(3)} GFLOPS
                                      </p>
                                    ))}
                                    <p style={{ margin: '5px 0 0 0', fontWeight: 'bold', color: '#666' }}>
                                       吞吐量提升: {data.throughputSpeedup ? data.throughputSpeedup.toFixed(3) + ' x' : 'N/A'}
                                     </p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Legend />
                          <Bar dataKey="baselineThroughput" fill="#26a69a" name="TensorFlow吞吐量" />
                          <Bar dataKey="optimizedThroughput" fill="#ef5350" name="优化吞吐量" />
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
                          <TableCell>TensorFlow时间(s)</TableCell>
                          <TableCell>优化时间(s)</TableCell>
                          <TableCell>执行效率提升</TableCell>
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
                            <TableCell>{row.baselineTime.toFixed(3)}</TableCell>
                            <TableCell>{row.optimizedTime.toFixed(3)}</TableCell>
                            <TableCell>{row.efficiencyImprovement.toFixed(2)}%</TableCell>
                            <TableCell>{row.baselineThroughput.toFixed(3)} {getThroughputUnit('ViT')}</TableCell>
                            <TableCell>{row.optimizedThroughput.toFixed(3)} {getThroughputUnit('ViT')}</TableCell>
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
