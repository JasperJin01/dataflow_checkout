"use client";
import React, { useState, useEffect } from 'react';
import { Box, Grid, Paper, Typography, Select, MenuItem, Button, Tabs, Tab, Table, 
  TableBody, TableCell, TableContainer, TableHead, TableRow, LinearProgress } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, ResponsiveContainer } from 'recharts';
import request from '@/lib/request/request';
import { PERFORMANCE_DATA, getRunMode, URL_MAPS, midtermMetrics } from './constData'

const algorithms = ['PageRank', 'ViT'];
const platforms = ['CPU-GPU', 'CPU-FPGA', 'CPU-DSA', 'CPU分布式'];
const allDatasetsOption = 'all-datasets';

const datasetsByAlgorithm = {
  'PageRank': ['Rmat-16', 'Rmat-18', 'Rmat-20'],
  'ViT': ['ImageNet', 'DriveSeg']
};

const algorithmDetails = {
  PageRank: { description: '标准图遍历算法', },
  ViT: { description: '视觉Transformer算法', },
};

const datasetInfo = {
  'Rmat-16': { nodes: '174147', edges: '7600696' },
  'Rmat-18': { nodes: '335318', edges: '15459350' },
  'Rmat-20': { nodes: '645820', edges: '31361722' },
  'ImageNet': { description: '1000类图像分类数据集，包含120万张训练图像和5万张验证图像' },
  'DriveSeg': { description: '自动驾驶场景分割数据集，包含5000张训练图像和1000张验证图像' }
};

// 获取吞吐量单位
const getThroughputUnit = (algorithm) => {
  switch(algorithm) {
    case 'PageRank': return 'GTEPS';
    case 'ViT': return 'GFLOPS';
    default: return '';
  };
};


export default function Page() {
  const [selectedAlgo, setSelectedAlgo] = useState(algorithms[0]);
  const [selectedPlatform, setSelectedPlatform] = useState(platforms[0]);
  const [selectedDataset, setSelectedDataset] = useState(datasetsByAlgorithm[algorithms[0]][0]);
  // 控制标签页切换
  const [tabValue, setTabValue] = useState(0);
  const [logs, setLogs] = useState([]);
  const [running, setRunning] = useState(false);
  const [performanceData, setPerformanceData] = useState([]);
  // 确保chartMetric与selectedPlatform保持一致
  const [chartMetric, setChartMetric] = useState(platforms[0]);
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

  // 监听平台选择变化，同步更新chartMetric
  useEffect(() => {
    setChartMetric(selectedPlatform);
  }, [selectedPlatform]);

  // 判断按钮是否不可用
  const isButtonDisabled = () => running;

  // 生成性能数据
  const generatePerformanceData = (algorithm, dataset, platform) => {
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
    
    // 查找匹配的数据集
    const platformData = PERFORMANCE_DATA[algorithm][platformKey];
    const datasetEntry = platformData.find(item => item.Dataset === dataset);
    
    if (!datasetEntry) {
      console.error(`未找到 ${algorithm}-${dataset}-${platformKey} 的性能数据`);
      return null;
    }
    
    return {
      algorithm,
      dataset,
      platform,
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
    // 过滤选定平台的数据
    const filteredData = getValidData().filter(item => item.platform === platform);
    
    // 转换为图表所需格式
    return filteredData.map(item => ({
      name: `${item.dataset}`,
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
      
      // 构建日志文件路径
      const logFilePath = `/log/distrib/${algoUrl}_${datasetUrl}_${platformUrl}.log`;
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
      // 过滤掉相同算法、数据集、平台的旧数据
      const filtered = prev.filter(item => 
        !(item.algorithm === newEntry.algorithm && 
          item.dataset === newEntry.dataset && 
          (newEntry.platform ? item.platform === newEntry.platform : true))
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
    
    // 直接在这里执行滚动
    setTimeout(() => {
      performanceRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 50); // 延时50ms，等待react状态更新
    await new Promise(resolve => setTimeout(resolve, 500)); // 等待滚动完成

    try {
      // 检查是否需要清空之前的数据
      // 如果有性能数据，且当前选择的算法与已有数据的算法不一致，则清空数据
      if (performanceData.length > 0 && performanceData[0].algorithm !== selectedAlgo) {
        console.log('算法已更改，清空之前的性能数据');
        setPerformanceData([]);
      }
      
      // 处理"全部数据集"选项
      if (selectedDataset === allDatasetsOption) {
        setLogs(['正在加载全部数据集...']);
        
        // 获取当前选中算法的所有数据集
        const datasetsToProcess = datasetsByAlgorithm[selectedAlgo];
        
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
        
        // 检查是否需要清空之前的数据
        const shouldClearData = performanceData.length > 0 && 
          performanceData[0].algorithm !== selectedAlgo;
        
        if (shouldClearData) {
          setPerformanceData([]);
        }
        
        // 获取URL映射
        const urlAlgo = URL_MAPS.algorithm[selectedAlgo];
        const urlData = URL_MAPS.dataset[selectedDataset];
        
        // 执行流式命令
        const eventSource = new EventSource(`${request.BASE_URL}/part2/execute/${urlAlgo}/${urlData}/`);
        
        eventSource.onmessage = async (event) => {
          if (event.data === '[done]') {
            eventSource.close();
            
            setLogs(prev => [...prev, `正在拷贝 ${selectedDataset} 的result...`]);
            
            try {
              const res = await fetch(`${request.BASE_URL}/part2/result/${urlAlgo}/${urlData}/`);
              const jsonData = await res.json();
              
              setLogs(prev => [...prev, `✅ ${selectedAlgo}-${selectedDataset}-${selectedPlatform} 执行完成`]);
              setRunning(false);
              
              // 生成性能数据并更新
              const performanceEntry = generatePerformanceData(selectedAlgo, selectedDataset, selectedPlatform);
              updatePerformanceData(performanceEntry);
              
            } catch (error) {
              setLogs(prev => [...prev, `❌ 获取结果失败: ${error.message}`]);
              setRunning(false);
            }
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
    <Box sx={{ p: 3, backgroundColor: '#f5f6fa' }}>
      <Grid item xs={12} sx={{ mb: 3 }}>
        <Paper elevation={0} sx={{
          p: 3,
          borderRadius: 2,
          backgroundColor: '#f0f4f8',
          border: '1px solid #e0e0e0'
        }}>
          <Typography variant="body1" component="div" sx={{
            lineHeight: 1.6,
            color: '#2d3436',
            fontSize: '0.95rem',
            '& .red-bold': {
              fontWeight: 600,
              color: '#ff4444',
              display: 'inline',
              padding: '0 2px'
            },
            '& strong': {
              fontWeight: 600
            }
          }}>
            <strong style={{ fontSize: '16px' }}>考核指标</strong>

            <Box component="span" display="block">
              分布式框架兼容至少3类异构分布式环境（CPU-GPU、CPU-FPGA、CPU-DSA），
            </Box>
            <Box component="span" display="block">
              相较于传统数据流TensorFlow（分布式模式），<span className='red-bold'>大规模数据测试条件下典型图算法和机器学习模型取得1.5倍以上的性能提升</span>。
            </Box>
            <Box component="span" display="block">
              <strong>典型图算法测试：</strong>
            </Box>
            <Box component="span" display="block">
              采用Graph500标准数据集运行标准图遍历算法PageRank进行实际测试，
              性能度量依据为算法端到端的总体执行时间。
            </Box>
            <Box component="span" display="block">
              <strong>典型机器学习算法测试：</strong>
            </Box>
            <Box component="span" display="block">
              采用ImageNet、DriveSeg等智能驾驶数据集运行标准ViT模型进行实际测试，
              性能度量依据为算法端到端的总体执行时间。
            </Box>
          </Typography>
        </Paper>
    </Grid>
      <Grid container spacing={3}>
        {/* 左侧列 */}
        <Grid container item xs={12} md={4} spacing={3}>
          {/* 算法选择卡片 */}
          <Grid item xs={12}>
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
              <Select
                fullWidth
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value)}
                sx={{ mb: 2 }}
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
                  // 重置数据集选择为新算法的第一个可用数据集
                  setSelectedDataset(datasetsByAlgorithm[newAlgo][0]);
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
                {datasetsByAlgorithm[selectedAlgo].map(ds => (
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

          {/* 算法详情卡片 */}
          <Grid item xs={12}>
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
              <Typography variant="body2" color="text.secondary" paragraph>
                <strong>算法说明:</strong> {algorithmDetails[selectedAlgo].description}
              </Typography>
            </Paper>
          </Grid>

          {/* 数据集信息卡片 */}
          <Grid item xs={12}>
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
                  {datasetsByAlgorithm[selectedAlgo].map(ds => (
                    <Box key={ds} sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        <strong>{ds}:</strong>
                        {datasetInfo[ds].nodes ? (
                          <>
                            节点规模： {datasetInfo[ds].nodes.toLocaleString()},
                            边规模： {datasetInfo[ds].edges.toLocaleString()}
                          </>
                        ) : (
                          datasetInfo[ds].description
                        )}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Box>
                  {datasetInfo[selectedDataset].nodes ? (
                    <>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        <strong>节点规模:</strong> {datasetInfo[selectedDataset].nodes.toLocaleString()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <strong>边规模:</strong> {datasetInfo[selectedDataset].edges.toLocaleString()}
                      </Typography>
                    </>
                  ) : (
                    <Typography variant="body2" color="text.secondary" paragraph>
                      <strong>数据集说明:</strong> {datasetInfo[selectedDataset].description}
                    </Typography>
                  )}
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>

        {/* 右侧列 */}
        <Grid container item xs={12} md={8} spacing={3}>
          {/* 控制台输出 */}
          <Grid item xs={12}>
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

          {/* 性能对比卡片 */}
          <Grid item xs={12} ref={performanceRef}>
            <Paper elevation={3} sx={{ p: 2, borderRadius: 3 }}>
              <Typography variant="h6" sx={{
                fontWeight: 700,
                mb: 2,
                color: 'secondary.main',
                borderBottom: '2px solid',
                borderColor: 'secondary.main',
                pb: 1
              }}>
                性能对比详情
              </Typography>

              <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
                  <Tab label="表格视图" />
                  <Tab label="图表视图" />
                </Tabs>
              </Box>

              {tabValue === 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>算法</TableCell>
                        <TableCell>数据集</TableCell>
                        <TableCell>硬件平台</TableCell>
                        <TableCell>基准时间(s)</TableCell>
                        <TableCell>优化时间(s)</TableCell>
                        <TableCell>加速比</TableCell>
                        <TableCell>基准吞吐量</TableCell>
                        <TableCell>优化吞吐量</TableCell>
                        <TableCell>吞吐量提升</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {getValidData().map((row, index) => (
                        <TableRow key={index}>
                          <TableCell>{row.algorithm}</TableCell>
                          <TableCell>{row.dataset}</TableCell>
                          <TableCell>{row.platform}</TableCell>
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
              ) : (
                <Box>
                  <Tabs
                    value={chartMetric}
                    onChange={(e, v) => setChartMetric(v)}
                    sx={{ mb: 2 }}
                  >
                    {platforms.map(platform => (
                      <Tab key={platform} label={platform} value={platform} />
                    ))}
                  </Tabs>

                  <Grid container spacing={2}>
                    {/* 执行时间/加速比图表 */}
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle1" align="center" sx={{ fontWeight: 550, mb: 1 }}>
                        执行时间对比
                      </Typography>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                          data={getChartData(chartMetric)}
                          margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                          barSize={35} // 固定柱子宽度为35px
                          barGap={5}   // 同组柱子之间的间距
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="baselineTime" fill="#7f58af" name="基准时间" />
                          <Bar dataKey="optimizedTime" fill="#64b5f6" name="优化时间" />
                        </BarChart>
                      </ResponsiveContainer>
                    </Grid>
                    
                    {/* 吞吐量图表 */}
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle1" align="center" sx={{ fontWeight: 550, mb: 1 }}>
                        吞吐量对比
                      </Typography>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                          data={getChartData(chartMetric)}
                          margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                          barSize={35} // 固定柱子宽度为35px
                          barGap={5}   // 同组柱子之间的间距
                          onMouseEnter={() => setShowReferenceLine(true)}
                          onMouseLeave={() => setShowReferenceLine(false)}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip 
                            formatter={(value, name) => {
                              const algorithm = getValidData().find(item => item.platform === chartMetric)?.algorithm || selectedAlgo;
                              return [`${value.toFixed(3)} ${getThroughputUnit(algorithm)}`, name];
                            }}
                          />
                          <Legend />
                          <Bar dataKey="baselineThroughput" fill="#26a69a" name="基准吞吐量" />
                          <Bar dataKey="optimizedThroughput" fill="#ef5350" name="优化吞吐量" />
                          <ReferenceLine
                            y={midtermMetrics[selectedAlgo]}
                            stroke="red"
                            strokeDasharray="3 3"
                            strokeOpacity={showReferenceLine ? 1 : 0}
                            style={{
                              opacity: showReferenceLine ? 1 : 0,
                              transition: 'opacity 0.3s ease-in-out'
                            }}
                            label={{
                              value: `中期指标\n(${midtermMetrics[selectedAlgo]} ${getThroughputUnit(selectedAlgo)})`,
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
                    </Grid>
                  </Grid>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}
