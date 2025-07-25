"use client";
import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Grid, Button, Select, MenuItem, TextField,
  Paper, Typography, Tabs, Tab,
  LinearProgress
} from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, ReferenceLine, Legend
} from 'recharts';
import request from '@/lib/request/request';

import { algorithmCodeMap } from './algorithmCodeMap';
import { chartResults } from './chartResults';

const algorithms = ['k-Clique', 'GCN', 'PageRank'];
const datasets = {
  'k-Clique': ['rmat-16', 'rmat-18', 'rmat-20'],
  GCN: ['rmat-16', 'rmat-17', 'rmat-18'],
  PageRank: ['rmat-16', 'rmat-18', 'rmat-20'],
};

const logFileMap = {
  'k-Clique': {
    'rmat-16': 'cf_on_rmat_16',
    'rmat-18': 'cf_on_rmat_18',
    'rmat-20': 'cf_on_rmat_20',
    'wiki-vote': 'cf_on_wikivote',
    'web-google': 'cf_on_web_google',
    'slashdot08': 'cf_on_slashdot08'
  },
  GCN: {
    'rmat-16': 'gcn_on_rmat_16_x10',
    'rmat-17': 'gcn_on_rmat_17_x10',
    'rmat-18': 'gcn_on_rmat_18_x10',
    'Cora': 'gcn_on_cora_x10',
    'Citeseer': 'gcn_on_citeseer_x10',
    'Pubmed': 'gcn_on_pubmed_x10'
  },
  'PageRank': {
    'rmat-16': 'pr_on_rmat_16',
    'rmat-18': 'pr_on_rmat_18',
    'rmat-20': 'pr_on_rmat_20',
    'wiki-vote': 'pr_on_wikivote',
    'web-google': 'pr_on_web_google',
    'ego-gplus': 'pr_on_ego_gplus'
  }
};

const yAxisMap = {
'k-Clique': {
    performance: 'GTSPS',
    consumption: 'GTSPS/W',
  },
  GCN: {
    performance: 'GOPS',
    consumption: 'GOPS/W',
  },
  PageRank: {
    performance: 'GTEPS',
    consumption: 'GTEPS/W',
  }
}

// Target metrics for reference lines
const targetMetrics = {
'k-Clique': { performance: 20, consumption: 0.5 }, // GTSPS, GTSPS/W
  GCN: { performance: 20, consumption: 0.5 }, // GOPS, GOPS/W
  PageRank: { performance: 100, consumption: 2.5 } // GTEPS, GTEPS/W
};

const datasetInfo = {
  'k-Clique': {
    'rmat-16': { nodes: 65536, edges: 1048576 },
    'rmat-18': { nodes: 262144, edges: 8388608 },
    'rmat-20': { nodes: 1048576, edges: 31399374 },
    'wiki-vote': { nodes: 7115, edges: 103689 },
    'web-google': { nodes: 875713, edges: 5105039 },
    'slashdot08': { nodes: 77360, edges: 905468 }
  },
  GCN: {
    'rmat-16': { nodes: 65536, edges: 1114112 },
    'rmat-17': { nodes: 131072, edges: 2228224 },
    'rmat-18': { nodes: 262144, edges: 4456448 },
    'Cora': { nodes: 2708, edges: 10556 },
    'Citeseer': { nodes: 3327, edges: 9104 },
    'Pubmed': { nodes: 19717, edges: 88648 }
  },
  PageRank: {
    'rmat-16': { nodes: 65536, edges: 1048576 },
    'rmat-18': { nodes: 262144, edges: 8388608 },
    'rmat-20': { nodes: 1048576, edges: 31399374 },
    'wiki-vote': { nodes: 7115, edges: 103689 },
    'web-google': { nodes: 875713, edges: 5105039 },
    'ego-gplus': { nodes: 107614, edges: 13673453 }
  }
}

export default function Page() {
  const [selectedAlgo, setSelectedAlgo] = useState(algorithms[0]);
  const [selectedDataset, setSelectedDataset] = useState(datasets['k-Clique'][0]);
  const [terminalData, setTerminalData] = useState([]);
  const [savedResults, setSavedResults] = useState({ 'k-Clique': {}, GCN: {}, PageRank: {} });
  const [chartData, setChartData] = useState([]);
  const [displayCode, setDisplayCode] = useState(algorithmCodeMap[algorithms[0]]);
  const [isRunning, setIsRunning] = useState(false);
  const [chartMetric, setChartMetric] = useState('performance');
  const terminalRef = useRef(null);

  let tempSaveResults;

  useEffect(() => {
    setDisplayCode(algorithmCodeMap[selectedAlgo]);
  }, [selectedAlgo]);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalData]);

  const generateChartData = () => {
    const algoResults = tempSaveResults[selectedAlgo];

    // 使用 datasets[selectedAlgo] 控制顺序，只包含 algoResults 中存在的数据集
    const chartData = datasets[selectedAlgo]
      .filter(dataset => algoResults[dataset] !== undefined) // 只包含 savedResults 中存在的数据集
      .map(dataset => {
        const results = algoResults[dataset];
        return {
          dataset,
          performance: results[0]?.value || null,
          ptarget: results[1]?.value || null,
          consumption: results[2]?.value || null,
          ctarget: results[3]?.value || null,
        };
    });
    return chartData.filter(item => item.performance !== null || item.consumption !== null);
  };

  const streamLogData = async () => {
    const data = await request({
      url: `/logfile/${logFileMap[selectedAlgo][selectedDataset]}`,
      method: 'GET',
      responseType: 'text',
    });
    const logLines = data.split('\n');
    let currentIndex = 0;
    await new Promise(resolve => setTimeout(resolve, 100));

    while (currentIndex < logLines.length) {
      const nextChunk = logLines.slice(currentIndex, currentIndex + 5);
      setTerminalData(prev => [...prev, ...nextChunk]);
      currentIndex += 5;
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  };

  const runProcess = async () => {
    setIsRunning(true);
    setTerminalData([]);

    try {
      await streamLogData();
      const results = chartResults[selectedAlgo][selectedDataset];
      // Save results
      tempSaveResults = { ...savedResults,
        [selectedAlgo]: {
          ...savedResults[selectedAlgo],
          [selectedDataset]: results
        }
      };
      setSavedResults(tempSaveResults);
      setChartData(generateChartData())
    } catch (error) {
      setTerminalData(prev => [...prev, '❌ 运行失败: ' + error]);
    } finally {
      setIsRunning(false);
    }
  };

  const algoOnchange = (event) => {
    const algo = event.target.value;
    setSelectedAlgo(algo);
    setSelectedDataset(datasets[algo][0]);
    setSavedResults({ 'k-Clique': {}, GCN: {}, PageRank: {} });
    setChartData([]);
    setTerminalData([]);
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
              指标2.1：标准图遍历算法 PageRank 计算性能
            </Box>
            <Box component="span" display="block">
              指标2.2：标准图挖掘算法 k-Clique 计算性能
            </Box>
            <Box component="span" display="block">
              指标2.3：标准图学习算法 GCN 计算性能
            </Box>
            <Box component="span" display="block">
              指标2.4：标准图遍历算法 PageRank 性能功耗比
            </Box>
            <Box component="span" display="block">
              指标2.5：标准图挖掘算法 k-Clique 性能功耗比
            </Box>
            <Box component="span" display="block">
              指标2.6：标准图学习算法 GCN 计算性能 性能功耗比
            </Box>

            <strong style={{ fontSize: '16px' }}>中期指标：</strong>
            <Box component="span" display="block">
              指标2.1：基于模拟器的图计算加速卡，标准图遍历算法PageRank计算性能达到
              <span className='red-bold'>100GTEPS</span>
            </Box>
            <Box component="span" display="block">
            指标2.2：基于模拟器的图计算加速卡，标准图挖掘算法k-Clique计算性能达到
              <span className='red-bold'>20GTSPS</span>
            </Box>
            <Box component="span" display="block">
              指标2.3：基于模拟器的图计算加速卡，标准图学习算法GCN计算性能达到
              <span className='red-bold'>20GOPS</span>
            </Box>
            <Box component="span" display="block">
              指标2.4：基于模拟器的图计算加速卡，标准图遍历算法PageRank
              性能功耗比达到 <span className='red-bold'>2.5GTEPS/W</span>
            </Box>
            <Box component="span" display="block">
              指标2.5：基于模拟器的图计算加速卡，标准图挖掘算法k-Clique
              性能功耗比达到 <span className='red-bold'>0.5GTSPS/W</span>
            </Box>
            <Box component="span" display="block">
              指标2.6：基于模拟器的图计算加速卡，标准图学习算法GCN
              性能功耗比达到 <span className='red-bold'>0.5GOPS/W</span>
            </Box>

            <strong style={{ fontSize: '16px' }}>完成时指标：</strong>
            <Box component="span" display="block">
              指标2.1：基于图计算加速芯片的加速卡，标准图遍历算法PageRank计算性能达到
              <span className='red-bold'>100GTEPS</span>
            </Box>
            <Box component="span" display="block">
              指标2.2：基于图计算加速芯片的加速卡，标准图挖掘算法k-Clique计算性能达到
              <span className='red-bold'>20GTSPS</span>
            </Box>
            <Box component="span" display="block">
              指标2.3：基于图计算加速芯片的加速卡，标准图学习算法GCN计算性能达到
              <span className='red-bold'>20GOPS</span>
            </Box>
            <Box component="span" display="block">
              指标2.4：基于图计算加速芯片的加速卡，标准图遍历算法PageRank
              性能功耗比达到 <span className='red-bold'>2.5GTEPS/W</span>
            </Box>
            <Box component="span" display="block">
              指标2.5：基于图计算加速芯片的加速卡，标准图挖掘算法k-Clique
              性能功耗比达到 <span className='red-bold'>0.5GTSPS/W</span>
            </Box>
            <Box component="span" display="block">
              指标2.6：基于图计算加速芯片的加速卡，标准图学习算法GCN
              性能功耗比达到 <span className='red-bold'>0.5GOPS/W</span>
            </Box>

            <strong style={{ fontSize: '16px' }}>考核方式：</strong>
            <Box component="span" display="block">
              <Box>采用Graph500标准数据集在图计算加速卡模拟器上运行PageRank、k-Clique和GCN
              代码，进行性能和性能功耗比测试。</Box>
            </Box>

            <strong style={{ fontSize: '16px' }}>数据集来源：</strong>
            <Box component="span" display="block">
              采用4个Graph500标准数据集RMAT-16、RMAT-17、RMAT-18、RMAT-20
            </Box>
          </Typography>
        </Paper>
      </Grid>
      <Grid container spacing={3}>
        {/* 控制面板 */}
        <Grid item xs={12} md={4}>
          <Grid item xs={12} sx={{ mb: 3 }}>

            <Paper elevation={3} sx={{ p: 2, borderRadius: 3 }}>
            <Typography variant="h6" sx={{
              fontWeight: 700,
              mb: 2,
              color: 'second.main',
              borderBottom: '2px solid',
              borderColor: 'second.main',
              pb: 1
            }}>
              运行选项
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h6" sx={{
                  fontWeight: 550,
                  fontSize: '16px',
                  mb: 1,
                }}>
                  选择算法
                </Typography>
                <Select
                  fullWidth
                  value={selectedAlgo}
                  onChange={algoOnchange}
                  disabled={isRunning}
                >
                  {algorithms.map((algo) => (
                    <MenuItem key={algo} value={algo} sx={{ py: 1 }}>
                      <Typography variant="body1" fontWeight="500">
                        {algo}
                      </Typography>
                    </MenuItem>
                  ))}
                </Select>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" sx={{
                  fontWeight: 550,
                  fontSize: '16px',
                  mb: 1,
                }}>
                  选择数据集
                </Typography>
                <Select
                  value={selectedDataset}
                  onChange={(e) => setSelectedDataset(e.target.value)}
                  disabled={isRunning}
                  fullWidth
                >
                  {datasets[selectedAlgo].map((dataset) => (
                    <MenuItem key={dataset} value={dataset} sx={{ py: 1 }}>
                      <Typography variant="body1">{dataset}</Typography>
                    </MenuItem>
                  ))}
                </Select>
              </Grid>

              <Grid item xs={12}>
                <Button
                  fullWidth
                  variant="contained"
                  color="success"
                  onClick={runProcess}
                  sx={{ py: 1.5 }}
                  disabled={isRunning}
                >
                  {isRunning ? '运行中...' : '开始运行'}
                </Button>
              </Grid>
            </Grid>

            {isRunning && (
              <Box sx={{ mt: 2 }}>
                <LinearProgress color="success" />
              </Box>
            )}
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
                {'数据集信息'}
              </Typography>

                <Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      <strong>节点规模:</strong> {datasetInfo[selectedAlgo][selectedDataset].nodes.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>边规模:</strong> {datasetInfo[selectedAlgo][selectedDataset].edges.toLocaleString()}
                    </Typography>
                  </Box>
                </Box>
            </Paper>
          </Grid>
      </Grid>

        {/* 代码展示 */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{
            height: '600px',
            borderRadius: 3,
            overflow: 'hidden',
            p: 2,
          }}>
            <Typography variant="h6" sx={{
              p: 2,
              fontWeight: 700,
              mb: 2,
              color: 'second.main',
              borderBottom: '2px solid',
              borderColor: 'second.main',
              pb: 1
            }}>
              机器指令展示
            </Typography>
            <TextField
              fullWidth
              multiline
              value={displayCode}
              InputProps={{
                readOnly: true,
                sx: {
                  fontFamily: '"Fira Code", monospace',
                  fontSize: '0.85rem',
                  backgroundColor: '#1e1e1e',
                  color: '#d4d4d4',
                  overflow: 'auto',
                  alignItems: 'flex-start',
                  height: '500px',
                  '& textarea': {
                    whiteSpace: 'pre !important',
                    paddingTop: '16px !important'
                  }
                }
              }}
              variant="outlined"
            />
          </Paper>
        </Grid>

        {/* 运行日志 */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{
            p: 2,
            borderRadius: 3,
          }}>
            <Typography variant="h6" sx={{
              fontWeight: 700,
              mb: 2,
              color: 'second.main',
            }}>
              运行状态
            </Typography>

            <Box
              ref={terminalRef}
              sx={{
                height: '400px',
                overflow: 'auto',
                fontFamily: 'monospace',
                fontSize: '0.8rem',
                backgroundColor: '#000',
                borderRadius: 2,
                height: 400,
                p: 1.5,
                '& > div': {
                  color: '#4caf50',
                  lineHeight: 1.6,
                  borderBottom: '1px solid rgba(255,255,255,0.1)',
                  py: 0.5
                }
              }}>
              {terminalData.map((line, index) => (
                <div key={index}>{`> ${line}`}</div>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* 分析结果 */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{
            p: 2,
            borderRadius: 3,
            position: 'relative'
          }}>
            <Typography variant="h6" sx={{
              fontWeight: 700,
              mb: 2,
              color: 'second.main',
            }}>
              结果展示
            </Typography>

            <Box sx={{ height: 400 }}>
              {chartData.length > 0 ? (
                <>
                  <Tabs
                    value={chartMetric}
                    onChange={(e, v) => setChartMetric(v)}
                    sx={{ mb: 2 }}
                  >
                    <Tab label="性能" value="performance" style={{ fontWeight: 'bold', color: 'black' }} />
                    <Tab label="性能功耗比" value="consumption" style={{ fontWeight: 'bold', color: 'black' }} />
                  </Tabs>
                  {chartMetric === 'performance' && (
                    <BarChart
                      data={chartData}
                      margin={{ top: 40, right: 20, left: 5, bottom: 20 }}
                      width={550}
                      height={350}
                    >
                      <text
                        x="50%"
                        y={20}
                        textAnchor="middle"
                        style={{ fontSize: '16px', fontWeight: 'bold' }}
                      >
                        {`${selectedAlgo} 性能测试结果`}
                      </text>
                      <XAxis dataKey="dataset" />
                      <YAxis
                        label={{
                          value: `性能值(${yAxisMap[selectedAlgo][chartMetric]})`,
                          angle: -90,
                          position: 'insideLeft'
                        }}
                      />
                      <Legend
                        verticalAlign="bottom"
                        height={36} // 固定图例高度
                        wrapperStyle={{ fontSize: '14px', paddingTop: '10px' }} // 调整字体和间距
                      />
                      <Bar
                        dataKey="performance"
                        fill="#1976d2"
                        radius={[4, 4, 0, 0]}
                        barSize={50}
                        name={'性能值'}
                        label={{
                          position: 'top',
                          formatter: (value) => value.toFixed(4)
                        }}
                      />
                      <Bar
                        dataKey="ptarget"
                        fill="green"
                        radius={[4, 4, 0, 0]}
                        barSize={50}
                        name={'中期指标值'}
                        label={{
                          position: 'top',
                        }}
                      />
                    </BarChart>
                  )}
                  {chartMetric === 'consumption' && (
                    <BarChart
                      data={chartData}
                      margin={{ top: 40, right: 20, left: 5, bottom: 20 }}
                      width={550}
                      height={350}
                    >
                      <text
                        x="50%"
                        y={20}
                        textAnchor="middle"
                        style={{ fontSize: '16px', fontWeight: 'bold' }}
                      >
                        {`${selectedAlgo} 功耗比测试结果`}
                      </text>
                      <XAxis dataKey="dataset" />
                      <YAxis
                        label={{
                          value: `性能值(${yAxisMap[selectedAlgo][chartMetric]})`,
                          angle: -90,
                          position: 'insideLeft'
                        }}
                      />
                      <Legend
                        verticalAlign="bottom"
                        height={36} // 固定图例高度
                        wrapperStyle={{ fontSize: '14px', paddingTop: '10px' }} // 调整字体和间距
                      />
                      <Bar
                        dataKey="consumption"
                        fill="#1976d2"
                        name={'性能功耗比'}
                        radius={[4, 4, 0, 0]}
                        barSize={50}
                        label={{
                          position: 'top',
                          formatter: (value) => value.toFixed(4)
                        }}
                      />
                      <Bar
                        dataKey="ctarget"
                        fill="green"
                        radius={[4, 4, 0, 0]}
                        barSize={50}
                        name={'性能功耗比中期指标值'}
                        label={{
                          position: 'top',
                        }}
                      />
                    </BarChart>
                  )}
                </>
              ) : (
                <Box sx={{
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'text.secondary'
                }}>
                  <Typography variant="h6">
                    {isRunning ? '数据生成中...' : '等待运行结果'}
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
