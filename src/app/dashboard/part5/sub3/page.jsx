'use client';

import { useEffect, useRef, useState } from 'react';
import { Box, Grid, Paper, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';

import { inputGraphCsr, resultVertex, subCsr, subVertexLabel, vertexLabel } from './data';
import { localComputeLog, subGraphLog, washLog } from './log';
import NetworkGraph from './NetworkGraph';
import { getVisNetworkData, getVisNetworkDataInput } from './utils';

const logDataMap = {
  泛图数据: '泛图数据日志',
  数据清洗: washLog,
  子图划分: subGraphLog,
  本地子图计算: localComputeLog,
  应用: '应用日志',
};

const Page = () => {
  const [hoveredModule, setHoveredModule] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const terminalRef = useRef(null); // 添加 ref 用于终端容器
  const [terminalData, setTerminalData] = useState([]);
  const [isShowMap, setIsShowMap] = useState({
    泛图数据: false,
    数据清洗: false,
    子图划分: false,
    本地子图计算: false,
    应用: false,
  });
  const [subCsrData, setSubCsrData] = useState([]);
  const [inputCsrData, setInputCsrData] = useState({});
  const [resultCsrData, setResultCsrData] = useState({});

  // Define coordinates for each module (approximate based on image)
  const modules = {
    泛图数据: { x: 40, y: 45, width: 93, height: 45 },
    数据清洗: { x: 40, y: 130, width: 93, height: 45 },
    子图划分: { x: 200, y: 125, width: 95, height: 55 },
    本地子图计算: { x: 450, y: 325, width: 100, height: 55 },
    应用: { x: 40, y: 325, width: 95, height: 50 },
  };

  const data = [
    { step: '扩展', pureCPU: 0.49, cpuSubgraph: 0.49 },
    { step: 'k-core', pureCPU: 0.2, cpuSubgraph: 0.000498 },
    { step: 'CC', pureCPU: 0.14, cpuSubgraph: 0.001114 },
    { step: '扩展', pureCPU: 0.27, cpuSubgraph: 0.27 },
    { step: 'PPR', pureCPU: 2.53, cpuSubgraph: 0.00638 },
    { step: '总和', pureCPU: 3.63, cpuSubgraph: 0.767992 },
    { step: '加速比', pureCPU: '', cpuSubgraph: 4.726611736 },
  ];

  const handleMouseMove = (event) => {
    const rect = event.target.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    setMousePosition({ x, y });

    let foundModule = null;
    for (const [module, coords] of Object.entries(modules)) {
      if (x >= coords.x && x <= coords.x + coords.width && y >= coords.y && y <= coords.y + coords.height) {
        foundModule = module;
        break;
      }
    }
    setHoveredModule(foundModule);
  };

  const handleMouseLeave = () => {
    setHoveredModule(null);
    setMousePosition({ x: 0, y: 0 });
  };

  const handleImageClick = (event) => {
    const rect = event.target.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    for (const [module, coords] of Object.entries(modules)) {
      if (x >= coords.x && x <= coords.x + coords.width && y >= coords.y && y <= coords.y + coords.height) {
        scrollToSection(module);
        runProcess(module);
        break;
      }
    }
  };

  const scrollToSection = (module) => {
    const section = document.getElementById(module);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const getLog = (module) => {
    return logDataMap[module];
  };

  const streamLogData = async (module) => {
    const data = getLog(module);
    const logLines = data.split('\n');
    let currentIndex = 0;
    await new Promise((resolve) => setTimeout(resolve, 500));

    while (currentIndex < logLines.length) {
      const nextChunk = logLines.slice(currentIndex, currentIndex + 5);
      setTerminalData((prev) => [...prev, ...nextChunk]);
      currentIndex += 5;
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  };

  const runProcess = async (module) => {
    setTerminalData([]);

    try {
      if (module === '泛图数据') {
        setIsShowMap((prev) => ({
          ...prev,
          [module]: true,
        }));
      } else {
        await streamLogData(module);
        setIsShowMap((prev) => ({
          ...prev,
          [module]: true,
        }));
      }
    } catch (error) {
      setTerminalData((prev) => [...prev, '❌ 运行失败: ' + error]);
    }
  };

  // 添加 useEffect 监听 terminalData 变化并滚动到底部
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalData]);

  useEffect(() => {
    let temp = [];
    for (let i = 0; i < subCsr.graph.length; i++) {
      const csrString = subCsr.graph[i];
      const result = getVisNetworkData(csrString, subVertexLabel);
      temp.push(result);
    }
    setSubCsrData(temp);

    // 初始化输入图
    setInputCsrData(getVisNetworkDataInput(inputGraphCsr.rowPtr, inputGraphCsr.colId, vertexLabel));
    setResultCsrData(getVisNetworkDataInput(inputGraphCsr.rowPtr, inputGraphCsr.colId, resultVertex));
  }, []);

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={12}>
        <Paper
          elevation={3}
          sx={{
            p: 2,
            borderRadius: 3,
            position: 'relative',
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              mb: 2,
              color: 'second.main',
            }}
          >
            流程展示
          </Typography>

          <Box sx={{ textAlign: 'center', mt: 4, height: '600px' }}>
            <img
              src="/all_in_one.png" // Replace with your flowchart image path
              alt="Flowchart"
              onClick={handleImageClick}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={{ cursor: 'pointer', maxWidth: '100%', height: '500px' }}
            />
            {/*             <Typography variant="h6" sx={{ mt: 2 }}>
              鼠标位置: (x: {mousePosition.x.toFixed(2)}, y: {mousePosition.y.toFixed(2)})
            </Typography> */}
            {hoveredModule && (
              <Typography variant="h6" color="primary" sx={{ mt: 2 }}>
                模块: {hoveredModule}
              </Typography>
            )}
          </Box>
        </Paper>
      </Grid>
      <Grid item xs={12} md={9}>
        <Paper
          elevation={3}
          sx={{
            p: 2,
            borderRadius: 3,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              mb: 2,
              color: 'second.main',
            }}
          >
            运行日志
          </Typography>

          <Box
            ref={terminalRef}
            sx={{
              height: '85%',
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
                py: 0.5,
              },
            }}
          >
            {terminalData.map((line, index) => (
              <div key={index}>{`> ${line}`}</div>
            ))}
          </Box>
        </Paper>
      </Grid>
      <Grid item xs={12} md={6} id="泛图数据">
        <Paper
          elevation={3}
          sx={{
            p: 2,
            borderRadius: 3,
            color: 'black',
            height: 500,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700, marginBottom: 2 }}>
            泛图数据展示
          </Typography>
          {isShowMap['泛图数据'] && (
            <Box sx={{ textAlign: 'center' }}>
              <img
                src="/application_excel.png" // Replace with your flowchart image path
                style={{ cursor: 'pointer', maxWidth: '100%', height: '450px' }}
              />
            </Box>
          )}
        </Paper>
      </Grid>
      <Grid item xs={12} md={6} id="数据清洗">
        <Paper
          elevation={3}
          sx={{
            p: 2,
            borderRadius: 3,
            color: 'black',
            height: 500,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700, marginBottom: 2 }}>
            输入图展示
          </Typography>
          {isShowMap['数据清洗'] && (
            <NetworkGraph nodes={inputCsrData.nodes} edges={inputCsrData.edges} height="420px" />
          )}
        </Paper>
      </Grid>
      <Grid item xs={12} md={6} id="子图划分">
        <Paper
          elevation={3}
          sx={{
            p: 2,
            borderRadius: 3,
            color: 'black',
            height: 500,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700, marginBottom: 2 }}>
            子图展示
          </Typography>
          {isShowMap['子图划分'] && (
            <Grid container spacing={2}>
              {subCsrData.map((data, index) => (
                <Grid item xs={6} key={index}>
                  <NetworkGraph nodes={data.nodes} edges={data.edges} height="200px" />
                </Grid>
              ))}
            </Grid>
          )}
        </Paper>
      </Grid>

      <Grid item xs={12} md={6} id="应用">
        <Paper
          elevation={3}
          sx={{
            p: 2,
            borderRadius: 3,
            color: 'black',
            height: 500,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700, marginBottom: 2 }}>
            应用流程图
          </Typography>
          {isShowMap['应用'] && (
            <Box sx={{ textAlign: 'center' }}>
              <img
                src="/application.png" // Replace with your flowchart image path
                style={{ cursor: 'pointer', maxWidth: '100%', height: '420px' }}
              />
            </Box>
          )}
        </Paper>
      </Grid>
      <Grid item xs={12} md={6} id="本地子图计算">
        <Paper
          elevation={3}
          sx={{
            p: 2,
            borderRadius: 3,
            color: 'black',
            height: 500,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700, marginBottom: 2 }}>
            结果图展示
          </Typography>
          {isShowMap['本地子图计算'] && (
            <NetworkGraph nodes={resultCsrData.nodes} edges={resultCsrData.edges} height="420px" />
          )}
        </Paper>
      </Grid>
      <Grid item xs={12} md={6}>
        <Paper
          elevation={3}
          sx={{
            p: 2,
            borderRadius: 3,
            color: 'black',
            height: 500,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700, marginBottom: 2 }}>
            运行结果展示
          </Typography>
          {isShowMap['本地子图计算'] && (
            <Table sx={{ width: '95%', margin: '0 auto' }}>
              <TableHead>
                <TableRow>
                  <TableCell></TableCell>
                  <TableCell align="right">纯CPU版本 (ms)</TableCell>
                  <TableCell align="right">CPU+基于子模块的图加速度 (ms)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{row.step}</TableCell>
                    <TableCell align="right">{row.pureCPU}</TableCell>
                    <TableCell align="right">{row.cpuSubgraph || ''}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Paper>
      </Grid>
    </Grid>
  );
};

export default Page;
