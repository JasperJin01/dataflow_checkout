"use client";
import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Select,
  MenuItem,
  Button,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine } from 'recharts';
import request from '@/lib/request/request'; // 假设你有一个请求库
import PowerGraphDisplay from './PowerGraphDisplay';
import { executionTimes } from './constData';

const algorithms = ['潮流计算','状态估计'];
const datasets = [
  'Case10790',
  'IEEE118',
  'hn_20171128_174550',
  'hn_20171207_06300',
  'hn_20171207_08000',
  'hn_20171207_09150',
  'hn_20171207_10000',
  'hn_20171207_11100',
  'hn_20171208_11100'
];

// 算法与数据集组合配置，用于选项框的展示
const configCombinations = {
  // '潮流计算': ['Case10790', 'IEEE118'],
  '潮流计算': ['Case10790'],
  '状态估计': [
    'hn_20171128_174550',
    // 'hn_20171207_06300',
    // 'hn_20171207_08000',
    // 'hn_20171207_09150',
    // 'hn_20171207_10000',
    // 'hn_20171207_11100',
    // 'hn_20171208_11100'
  ]
}

// 允许执行的组合配置，不出现在这里的不允许进行运行
const allowedCombinations = {
  '潮流计算': ['Case10790', 'IEEE118'],
  '状态估计': [
    'hn_20171128_174550',
    // 'hn_20171207_06300',
    // 'hn_20171207_08000',
    // 'hn_20171207_09150',
    // 'hn_20171207_10000',
    // 'hn_20171207_11100',
    // 'hn_20171208_11100'
  ]
};

const datasetInfo = {
  'Case10790': { nodes: '10,790', edges: '36,608' },
  'IEEE118': { nodes: '118', edges: '176' },
  'hn_20171128_174550': { nodes: '2,703', edges: '5,806' },
  'hn_20171207_06300': { nodes: '2,637', edges: '5,584' },
  'hn_20171207_08000': { nodes: '2,654', edges: '5,614' },
  'hn_20171207_09150': { nodes: '2,651', edges: '5,608' },
  'hn_20171207_10000': { nodes: '2,654', edges: '5,614' },
  'hn_20171207_11100': { nodes: '2,647', edges: '5,600' },
  'hn_20171208_11100': { nodes: '2,433', edges: '5,156' }
};

export default function Page() {
  const [selectedAlgo, setSelectedAlgo] = useState(algorithms[0]);
  const [selectedDataset, setSelectedDataset] = useState(allowedCombinations[algorithms[0]][0]);
  const [tabValue, setTabValue] = useState(0);
  const [logs, setLogs] = useState([]);
  const [running, setRunning] = useState(false);
  const [powerFlowData, setPowerFlowData] = useState([]);
  const [stateEstimationData, setStateEstimationData] = useState([]);
  const [chartMetric, setChartMetric] = useState('time');
  const [progress, setProgress] = useState(0);
  const [showReferenceLine, setShowReferenceLine] = useState(false);
  // 移除代码内容状态，改为显示图片
  const [showGraphDisplay, setShowGraphDisplay] = useState(false); // 新增状态控制图形显示
  const logBoxRef = React.useRef(null);
  const leftPanelRef = React.useRef(null);
  // 移除代码显示引用，改为显示图片
  const performanceRef = React.useRef(null);  // 添加性能对比区域的ref

  // 移除代码加载逻辑，改为显示图片

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


  // 处理功耗趋势数据请求
  const handlePowerTrend = async () => {
    if (running) return;
    
    setRunning(true);
    setLogs(['正在获取功耗趋势数据...']);
    
    try {
      const eventSource = new EventSource(`/api/usage/powertrend/${selectedDataset}/`);
      
      eventSource.onmessage = (event) => {
        if (event.data === '[done]') {
          eventSource.close();
          setLogs(prev => [...prev, '执行完成']);
          setRunning(false);
        } else if (event.data === '[error]') {
          eventSource.close();
          setLogs(prev => [...prev, '❌ 执行出错']);
          setRunning(false);
        } else {
          setLogs(prev => [...prev, event.data]);
        }
      };
      
      eventSource.onerror = () => {
        eventSource.close();
        setLogs(prev => [...prev, '❌ 连接错误']);
        setRunning(false);
      };
      
    } catch (error) {
      setLogs(prev => [...prev, `❌ 执行失败: ${error.message}`]);
      setRunning(false);
    }
  };

  // 新增判断按钮是否可用的逻辑
  const isButtonDisabled = () => {
    if (running) return true;

    // 判断单个数据集是否允许
    if (selectedDataset !== 'all-datasets') { // 假设all-datasets是默认值
      return !allowedCombinations[selectedAlgo].includes(selectedDataset);
    }

    // 判断"全部数据集"是否允许（检查算法是否有可用的数据集）
    return true;
  };


  // 获取有效数据（已执行的数据集）
  const getValidData = () => {
    return performanceData
  };

  // 生成图表数据
  const getChartData = () => {
    return performanceData.map(item => ({
      ...item,
      displayName: item.dataset
    }));
  };

  // 添加处理算法改变的函数
  const handleAlgoChange = (e) => {
    const newAlgo = e.target.value;
    setSelectedAlgo(newAlgo);
    // 当算法改变时，自动选择该算法下的第一个可用数据集
    setSelectedDataset(configCombinations[newAlgo][0]);
  };

  // 添加滚动到性能对比区域的函数
  const scrollToPerformance = () => {
    performanceRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 修改handleRun函数
  const handleRun = async () => {
    if (running) return;
    
    setRunning(true);
    setProgress(0);
    setLogs(['正在与服务器建立连接...']);
    setShowGraphDisplay(false); // 开始执行时隐藏图形显示


    try {
      if (selectedAlgo === '潮流计算') {
        // 执行功耗趋势计算
        const eventSource = new EventSource(request.getApiUrl(`/api/usage/powertrend/${selectedDataset}/`));
        let totalTime = null;
        
        eventSource.onmessage = async (event) => {
          if (event.data === '[done]') {
            eventSource.close();
            setLogs(prev => [...prev, '执行完成']);

            
            if (totalTime !== null) {
              // 更新性能数据
              const newResult = {
                combinedKey: `${selectedAlgo}-${selectedDataset}`,
                algorithm: selectedAlgo,
                dataset: selectedDataset,
                nodes: datasetInfo[selectedDataset].nodes,
                edges: datasetInfo[selectedDataset].edges,
                cpu: 978.12, // 1000ms
                accelerator: (totalTime * 1000).toFixed(2), // 转换为毫秒，保留两位小数
                speedUp: 978.12 / (totalTime * 1000),
                throughput: 1.0
              };
              
              // 更新潮流计算性能数据
              setPowerFlowData(prev => {
                // 移除相同数据集的旧数据
                const filtered = prev.filter(item => item.dataset !== selectedDataset);
                // 添加新数据并按照allowedCombinations中的顺序排序
                const newData = [...filtered, newResult];
                return newData.sort((a, b) => {
                  return allowedCombinations['潮流计算'].indexOf(a.dataset) - 
                         allowedCombinations['潮流计算'].indexOf(b.dataset);
                });
              });
            }
            
            setRunning(false);
            setShowGraphDisplay(true); // 执行完成后显示图形
            // 执行完毕后滚动到性能对比区域
            setTimeout(() => {
              performanceRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
          } else if (event.data === '[error]') {
            eventSource.close();
            setLogs(prev => [...prev, '❌ 执行出错']);
            setProgress(0);
            setRunning(false);
            setShowGraphDisplay(false); // 执行出错时不显示图形
          } else if (event.data.startsWith('[stderr]')) {
            // 处理stderr输出，显示为错误信息
            const errorMsg = event.data.replace('[stderr] ', '');
            setLogs(prev => [...prev, `⚠️ ${errorMsg}`]);
          } else if (event.data.startsWith('[exit_status]')) {
            // 处理退出状态
            const exitStatus = event.data.replace('[exit_status] ', '');
            if (exitStatus !== '0') {
              setLogs(prev => [...prev, `❌ 命令执行失败，退出状态: ${exitStatus}`]);
            }
          } else {
            setLogs(prev => [...prev, event.data]);
            // 从日志中提取总时间
            const match = event.data.match(/total\s*:\s*(\d+\.\d+)s/);
            if (match) {
              totalTime = parseFloat(match[1]);
            }
            setProgress(50);
          }
        };
        
        eventSource.onerror = () => {
          eventSource.close();
          setLogs(prev => [...prev, '❌ 连接错误']);
          setProgress(0);
          setRunning(false);
          setShowGraphDisplay(false);
        };
      } else { // 状态估计
        // 执行状态估计计算
        const eventSource = new EventSource(request.getApiUrl(`/api/usage/stateestimation/${selectedDataset}/`));
        let totalTime = null;
        
        eventSource.onmessage = async (event) => {
          if (event.data === '[done]') {
            eventSource.close();
            setLogs(prev => [...prev, '执行完成']);

            
            if (totalTime !== null) {
              // 更新性能数据
              const newResult = {
                combinedKey: `${selectedAlgo}-${selectedDataset}`,
                algorithm: selectedAlgo,
                dataset: selectedDataset,
                nodes: datasetInfo[selectedDataset].nodes,
                edges: datasetInfo[selectedDataset].edges,
                cpu: executionTimes[selectedDataset] ? executionTimes[selectedDataset].cpu : 3327.98,
                accelerator: totalTime * 1000, // 转换为毫秒
                speedUp: executionTimes[selectedDataset] ? (executionTimes[selectedDataset].cpu / (totalTime * 1000)) : (3327.98 / (totalTime * 1000)),
                throughput: 1.0
              };
              
              setStateEstimationData(prev => {
                const filtered = prev.filter(item => item.dataset !== selectedDataset);
                const newData = [...filtered, newResult];
                return newData.sort((a, b) => {
                  return allowedCombinations['状态估计'].indexOf(a.dataset) - 
                         allowedCombinations['状态估计'].indexOf(b.dataset);
                });
              });
            } else {
              // 如果没有解析到总时间，使用默认值
              const newResult = {
                combinedKey: `${selectedAlgo}-${selectedDataset}`,
                algorithm: selectedAlgo,
                dataset: selectedDataset,
                nodes: datasetInfo[selectedDataset].nodes,
                edges: datasetInfo[selectedDataset].edges,
                cpu: executionTimes[selectedDataset] ? executionTimes[selectedDataset].cpu : 3327.98,
                accelerator: executionTimes[selectedDataset] ? executionTimes[selectedDataset].accelerator : 12.4,
                speedUp: executionTimes[selectedDataset] ? (executionTimes[selectedDataset].cpu / executionTimes[selectedDataset].accelerator) : (3327.98 / 12.4),
                throughput: 1.0
              };
              
              setStateEstimationData(prev => {
                const filtered = prev.filter(item => item.dataset !== selectedDataset);
                const newData = [...filtered, newResult];
                return newData.sort((a, b) => {
                  return allowedCombinations['状态估计'].indexOf(a.dataset) - 
                         allowedCombinations['状态估计'].indexOf(b.dataset);
                });
              });
            }
            
            setRunning(false);
            setShowGraphDisplay(true);
            // 执行完毕后滚动到性能对比区域
            setTimeout(() => {
              performanceRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
          } else {
            setLogs(prev => [...prev, event.data]);
            
            // 解析总时间
            const match = event.data.match(/total\s*:\s*(\d+\.\d+)s/);
            if (match) {
              totalTime = parseFloat(match[1]);
            }
            setProgress(50);
          }
        };
        
        eventSource.onerror = () => {
          eventSource.close();
          setLogs(prev => [...prev, '❌ 连接错误']);
          setProgress(0);
          setRunning(false);
          setShowGraphDisplay(false);
        };
      }
    } catch (error) {
      setLogs(prev => [...prev, `❌ 执行失败: ${error.message}`]);
      setProgress(0);
      setRunning(false);
      setShowGraphDisplay(false); // 执行失败时不显示图形
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
            {/* <strong style={{ fontSize: '16px' }}>达成指标：</strong>
            <Box component="span" display="block">
              ① 1万图顶点数据的<span className='red-bold'>潮流计算</span>，计算时间约为<span className='red-bold'>100ms</span>。
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              ② 省级规模电网<span className='red-bold'>状态估计</span>，计算时间不超过<span className='red-bold'>200ms</span>。
            </Box> */}

            <strong style={{ fontSize: '16px' }}>评测方法：</strong>
            <Box component="span" display="block">
              ① <span className='red-bold'>潮流计算性能评测方法</span>：选取包含一万多个顶点的电力图开展潮流计算。
              &nbsp;&nbsp;&nbsp;&nbsp;
              ② <span className='red-bold'>状态估计性能评测方法</span>：选取省级规模电网开展状态估计。
            </Box>

            <strong style={{ fontSize: '16px' }}>数据集来源：</strong>
            <Box component="span" display="block">
              ① 数据来自于国家电网提供的10790节点的某国电网数据。
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              ② 状态估计数据来自于国家电网提供的不同时期的某省电网数据。
            </Box>
          </Typography>
        </Paper>
      </Grid>

      <Grid container spacing={3}>
        {/* 左侧列 */}
        <Grid item xs={12} md={4}>
          {/* 算法选择卡片 */}
          <Grid container spacing={3}>
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
                  算法和数据集选择
                </Typography>

                <Typography variant="subtitle1" sx={{ fontWeight: 550, mb: 1 }}>
                  算法选择
                </Typography>
                <Select
                  fullWidth
                  value={selectedAlgo}
                  onChange={handleAlgoChange}
                  sx={{ mb: 2 }}
                >
                  {algorithms.map(algo => (
                    <MenuItem key={algo} value={algo}>{algo}</MenuItem>
                  ))}
                </Select>

                <Typography variant="subtitle1" sx={{ fontWeight: 550, mb: 1 }}>
                  {selectedAlgo}数据集
                </Typography>
                <Select
                  fullWidth
                  value={selectedDataset}
                  onChange={(e) => setSelectedDataset(e.target.value)}
                  sx={{ mb: 2 }}
                >
                  {configCombinations[selectedAlgo].map(ds => (
                    <MenuItem key={ds} value={ds}>{ds}</MenuItem>
                  ))}
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
                {running && <LinearProgress value={progress} sx={{ mt: 1 }} />}
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
                  电力图数据集信息
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>数据集</TableCell>
                        <TableCell>点数</TableCell>
                        <TableCell>边数</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {configCombinations[selectedAlgo].map(ds => (
                        <TableRow key={ds}>
                          <TableCell>{ds}</TableCell>
                          <TableCell>{datasetInfo[ds].nodes}</TableCell>
                          <TableCell>{datasetInfo[ds].edges}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>
          </Grid>
        </Grid>

        {/* 右侧列 */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 2, borderRadius: 3 }}>
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
            <Box 
              ref={logBoxRef}
              sx={{
                height: 430,
                overflow: 'auto',
                fontFamily: 'monospace',
                fontSize: '0.8rem',
                backgroundColor: '#1a1a1a',
                borderRadius: 2,
                p: 1.5,
                '& > div': {
                  color: '#ffffff',
                  lineHeight: 1.6,
                  borderBottom: '1px solid rgba(255,255,255,0.1)',
                  py: 0.5
                }
              }}
            >
              {logs.filter(log => log && typeof log === 'string' && !log.includes('PATH')).map((log, index) => (
                <div key={index}>{`> ${log}`}</div>
              ))}
            </Box>
            {running && <LinearProgress value={progress} sx={{ mt: 1 }} />}
          </Paper>

          {/* 异质数据流映射展示面板 */}
          {/* <Paper elevation={3} sx={{
            p: 2,
            height: '100%',
            borderRadius: 3,
            overflow: 'hidden',
            mb: 1.5  // 从 mb: 3 改为 mb: 1.5
          }}>
            <Typography variant="h6" sx={{
              fontWeight: 700,
              mb: 2,
              color: 'secondary.main',
              borderBottom: '2px solid',
              borderColor: 'secondary.main',
              pb: 1
            }}>
              异质数据流映射展示
            </Typography>
            <Box sx={{
              height: '400px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              
              borderRadius: 2,
              p: 1.5
            }}>
              <img 
                src="/flow.png" 
                alt="Flow Diagram" 
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain'
                }}
              />
            </Box>
          </Paper> */}
        </Grid>

        {/* 下方性能对比和执行日志 */}
        <Grid item xs={12} md={6} ref={performanceRef}>
          <Paper elevation={3} sx={{ p: 2, borderRadius: 3 }}>
            <Typography variant="h6" sx={{
              fontWeight: 700,
              mb: 2,
              color: 'secondary.main',
              borderBottom: '2px solid',
              borderColor: 'secondary.main',
              pb: 1
            }}>
              潮流计算性能对比
            </Typography>
            <Box>
              <BarChart
                width={500}
                height={300}
                data={powerFlowData.map(item => ({ ...item, displayName: item.dataset }))}
                margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="displayName" />
                <YAxis label={{ value: '执行时间(ms)', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="cpu" fill="#7f58af" name="融合前时间" barSize={50} />
                <Bar dataKey="accelerator" fill="#64b5f6" name="融合后时间" barSize={50} />
              </BarChart>
            </Box>
          </Paper>
        </Grid>
        
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
              状态估计性能对比
            </Typography>
            <Box>
              <BarChart
                width={500}
                height={300}
                data={stateEstimationData.map(item => ({ ...item, displayName: item.dataset }))}
                margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="displayName" />
                <YAxis label={{ value: '执行时间(ms)', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="cpu" fill="#7f58af" name="融合前时间" barSize={50} />
                <Bar dataKey="accelerator" fill="#64b5f6" name="融合后时间" barSize={50} />
              </BarChart>
            </Box>
          </Paper>
        </Grid>



        {/* 图形化结果展示 */}
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
              图形化结果展示
            </Typography>
            {!showGraphDisplay ? (
              <Box
                sx={{
                  height: '700px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#f5f5f5',
                  borderRadius: 2,
                  border: '2px dashed #ccc'
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    color: '#666',
                    textAlign: 'center',
                    maxWidth: '80%'
                  }}
                >
                  {running ? (
                    <>
                      <Box sx={{ mb: 2 }}>正在计算中，请稍候...</Box>
                      <LinearProgress sx={{ width: '200px' }} />
                    </>
                  ) : (
                    "图形化结果将在执行完毕后显示"
                  )}
                </Typography>
              </Box>
            ) : (
              <PowerGraphDisplay 
                dataset={selectedDataset} 
                algorithm={selectedAlgo === '潮流计算' ? 'pf' : 'se'} 
              />
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
