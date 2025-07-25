"use client";
import React, { useState } from 'react';
import {
  Box, Grid, Button, Select, MenuItem,
  Paper, Typography, LinearProgress
} from '@mui/material';
import ReadOnlyCodeBox from '@/components/common/CodeContainer';
import request from '@/lib/request/request';
import {sampleCodes} from './constCode';

const frameworks = {
  'GraphScope': ['bfs', 'sssp', 'ppr'],
  'DGL': ['gcn'],
};

// 算法对应的数据集选项
const datasetOptions = {
  'bfs': ['smallgraph', 'physics', 'facebook'],
  'sssp': ['smallgraph', 'physics', 'facebook'],
  'ppr': ['smallgraph', 'physics', 'facebook'],
  'gcn': ['cora'],
};


export default function FrameworkConversionPage() {
  const [selectedFramework, setSelectedFramework] = useState(Object.keys(frameworks)[0]);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState(frameworks[Object.keys(frameworks)[0]][0]);
  const [selectedDataset, setSelectedDataset] = useState(datasetOptions[frameworks[Object.keys(frameworks)[0]][0]][0]);
  const [originalCodeDisplay, setOriginalCodeDisplay] = useState(sampleCodes[frameworks[Object.keys(frameworks)[0]][0]].frameworkCode);
  const [transformedCode, setTransformedCode] = useState(sampleCodes[frameworks[Object.keys(frameworks)[0]][0]].cgaCode);
  const [results, setResults] = useState({});
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
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

  const handleFrameworkChange = (event) => {
    const framework = event.target.value;
    setSelectedFramework(framework);
    if (frameworks[framework].length > 0) {
      const newAlgorithm = frameworks[framework][0];
      setSelectedAlgorithm(newAlgorithm);
      setSelectedDataset(datasetOptions[newAlgorithm][0]);
      setOriginalCodeDisplay(sampleCodes[newAlgorithm].frameworkCode);
      setTransformedCode(sampleCodes[newAlgorithm].cgaCode);
    } else {
      setSelectedAlgorithm('');
      setOriginalCodeDisplay('');
      setTransformedCode('');
    }
    setResults({});
  };

  const handleAlgorithmChange = (event) => {
    const algorithm = event.target.value;
    setSelectedAlgorithm(algorithm);
    setSelectedDataset(datasetOptions[algorithm][0]);
    setOriginalCodeDisplay(sampleCodes[algorithm].frameworkCode);
    setTransformedCode(sampleCodes[algorithm].cgaCode);
    setResults({});
  };

  const handleDatasetChange = (event) => {
    setSelectedDataset(event.target.value);
  };

  const handleRun = async () => {
    if (isRunning || !selectedAlgorithm) {
      return;
    }

    setIsRunning(true);
    setProgress(0);
    setResults({ terminalOutput: 'Connecting to server...\n' });

    try {
      const eventSource = new EventSource(`${request.BASE_URL}/part3/execute/2/${selectedAlgorithm}/${selectedDataset}/`);
      let terminalOutput = '';

      eventSource.onmessage = async (event) => {
        if (event.data === '[done]') {
          eventSource.close();
          setResults(prev => ({
            ...prev,
            terminalOutput: prev.terminalOutput + 'Copying results...\n'
          }));

          try {
            const res = await fetch(`${request.BASE_URL}/part3/result/2/${selectedAlgorithm}/`);
            const jsonData = await res.json();

            setResults(prev => ({
              ...prev,
              terminalOutput: prev.terminalOutput + 'Completed\n'
            }));

            const originalCode = selectedFramework === 'GraphScope' ? jsonData.data.pregel : jsonData.data.dgl;
            setOriginalCodeDisplay(originalCode ? originalCode.join('\n') : sampleCodes[selectedAlgorithm].frameworkCode);

            setTransformedCode(jsonData.data.CGA ? jsonData.data.CGA.join('\n') : sampleCodes[selectedAlgorithm].cgaCode);

            setResults(prev => ({
              ...prev,
              graphIR: jsonData.data.GraphIR ? jsonData.data.GraphIR.join('\n') : '',
              matrixIR: jsonData.data.MatrixIR ? jsonData.data.MatrixIR.join('\n') : '',
              hardwareInstructions: jsonData.data.asm ? jsonData.data.asm.join('\n') : ''
            }));

            setProgress(100);
          } catch (error) {
            setResults(prev => ({
              ...prev,
              terminalOutput: prev.terminalOutput + `Failed to get results: ${error.message}\n`
            }));
          } finally {
            setIsRunning(false);
          }

        } else if (event.data === '[error]') {
          eventSource.close();
          setResults(prev => ({
            ...prev,
            terminalOutput: prev.terminalOutput + '\nExecution error\n'
          }));
          setIsRunning(false);
        } else {
          setResults(prev => ({
            ...prev,
            terminalOutput: prev.terminalOutput + event.data + '\n'
          }));
        }
      };

      eventSource.onerror = () => {
        eventSource.close();
        setResults(prev => ({
          ...prev,
          terminalOutput: prev.terminalOutput + '\nConnection error\n'
        }));
        setIsRunning(false);
      };

    } catch (error) {
      setResults({
        terminalOutput: `Execution failed: ${error.message}`
      });
      setIsRunning(false);
    }
  };

  const handleSimulatorRun = async () => {
    if (isSimulatorRunning) {
      return;
    }

    setIsSimulatorRunning(true);
    setSimulatorProgress(0);
    setSimulatorResults('Connecting to server...\n');

    try {
      const eventSource = new EventSource(`${request.BASE_URL}/part3/moni2/${selectedAlgorithm}/${selectedDataset}/`);

      eventSource.onmessage = (event) => {
        if (event.data === '[done]') {
          eventSource.close();
          setSimulatorResults(prev => prev + 'Simulator execution completed\n');
          setSimulatorProgress(100);
          setIsSimulatorRunning(false);
        } else if (event.data === '[error]') {
          eventSource.close();
          setSimulatorResults(prev => prev + '\nExecution error\n');
          setIsSimulatorRunning(false);
        } else {
          setSimulatorResults(prev => prev + event.data + '\n');
          setSimulatorProgress(prev => Math.min(prev + 5, 95));
        }
      };

      eventSource.onerror = () => {
        eventSource.close();
        setSimulatorResults(prev => prev + '\nConnection error\n');
        setIsSimulatorRunning(false);
      };

    } catch (error) {
      console.error('Simulator execution failed:', error);
      setSimulatorResults(`Execution failed: ${error.message}`);
      setIsSimulatorRunning(false);
    }
  };

  return (
    <Box sx={{ p: 3, backgroundColor: '#f5f6fa' }}>
      {/* 顶部文字说明模块 */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2, backgroundColor: '#f0f4f8', border: '1px solid #e0e0e0' }}>
        <Typography variant="body1" component="div" sx={{ lineHeight: 1.6, color: '#2d3436', fontSize: '0.95rem' }}>
          <strong>考核指标：</strong>
          <Box component="span" display="block">建立统一图计算编程模型和编译工具</Box>
          <Box component="span" display="block">动态图更新性能达到每秒百万条边</Box>
          <strong>中期指标：</strong>
          <Box component="span" display="block">指标3.1：抽象出图遍历、图挖掘、图学习所具有的共性计算特征</Box>
          <Box component="span" display="block">指标3.2：使用SNAP标准动态图数据集进行评测，动态图更新速率达到每秒五十万条边</Box>
          <strong>完成时指标：</strong>
          <Box component="span" display="block">指标3.1：提出对图计算、图挖掘、图学习算法统一化表达的编程模型和编译工具</Box>
          <Box component="span" display="block">指标3.2：使用SNAP标准动态图数据集进行评测，动态图更新速率达到每秒百万条边</Box>
          <strong>考核方式：</strong>
          <Box component="span" display="block">首先，将图遍历、图学习、图挖掘应用采用CGA编程模型统一化表达</Box>
          <Box component="span" display="block">然后，将CGA编程模型经过多层编译，转换成图计算加速卡（模拟器）上运行的代码</Box>
          <Box component="span" display="block">最后，支持GraphScope和DGL框架向CGA编程模型的转换</Box>
          <Box component="span" display="block">使用SNAP标准动态图数据集进行评测，性能指标计算方法是：动态图更新速率=总更新边数/总更新时间</Box>
          <strong>数据集来源：</strong>
          <Box component="span" display="block">采用选自斯坦福网络分析平台（SNAP）的自然图数据集ego-Facebook，大型网络数据集KONECT的自然图数据集Physicians，图卷积网络自然图数据集Cora</Box>
        </Typography>
      </Paper>

      {/* 运行控制模块和Terminal执行结果并排 */}
      <Grid container spacing={3} mb={2} alignItems="stretch">
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 2, borderRadius: 3, height: 350, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'secondary.main', borderBottom: '2px solid', borderColor: 'secondary.main', pb: 1 }}>
              运行控制
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 550, fontSize: '16px', mb: 1 }}>
                选择框架
              </Typography>
              <Select
                fullWidth
                value={selectedFramework}
                onChange={handleFrameworkChange}
                disabled={isRunning}
              >
                {Object.keys(frameworks).map((framework) => (
                  <MenuItem key={framework} value={framework}>
                    {framework}
                  </MenuItem>
                ))}
              </Select>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 550, fontSize: '16px', mb: 1 }}>
                选择算法
              </Typography>
              <Select
                fullWidth
                value={selectedAlgorithm}
                onChange={handleAlgorithmChange}
                disabled={isRunning || !selectedFramework || frameworks[selectedFramework].length === 0}
              >
                {frameworks[selectedFramework]?.map((algorithm) => (
                  <MenuItem key={algorithm} value={algorithm}>
                    {algorithm}
                  </MenuItem>
                ))}
              </Select>
            </Box>
            <Button
              variant="contained"
              color="primary"
              onClick={handleRun}
              disabled={isRunning || !selectedAlgorithm}
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
              Terminal输出
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
            }} ref={resultsBoxRef}>
              {results.terminalOutput || ''}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* 代码展示区域 */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          {/* 原框架代码 */}
          <Paper elevation={3} sx={{ p: 2, borderRadius: 3, mb: 3, height: 400 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'secondary.main' }}>
              {selectedFramework}框架代码展示
            </Typography>
            <ReadOnlyCodeBox content={originalCodeDisplay} height={300} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          {/* 现框架代码 */}
          <Paper elevation={3} sx={{ p: 2, borderRadius: 3, mb: 3, height: 400 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'secondary.main' }}>
              基于CGA编程模型的代码展示
            </Typography>
            <ReadOnlyCodeBox content={transformedCode} height={300} />
          </Paper>
        </Grid>
      </Grid>

      {/* 结果展示 */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2, borderRadius: 3, height: 450 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'secondary.main' }}>
              GraphIR展示
            </Typography>
            <ReadOnlyCodeBox content={results.graphIR || ''} height={350} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2, borderRadius: 3, height: 450 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'secondary.main' }}>
              MatrixIR展示
            </Typography>
            <ReadOnlyCodeBox content={results.matrixIR || ''} height={350} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2, borderRadius: 3, height: 450 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'secondary.main' }}>
              硬件指令展示
            </Typography>
            <ReadOnlyCodeBox content={results.hardwareInstructions || ''} height={350} />
          </Paper>
        </Grid>
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
                {selectedAlgorithm && datasetOptions[selectedAlgorithm]?.map((dataset) => (
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

        {/* 模拟器执行结果显示 */}
        <Grid item xs={12} md={8}>
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