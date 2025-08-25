"use client";
import React, { useState } from 'react';
import { Box, Grid, Paper, Typography } from '@mui/material';
import FlowDiagram from './FlowDiagram';

export default function DataflowTheory() {
  const [selectedMainModule, setSelectedMainModule] = useState(null); // PageRank 或 ViT
  const [selectedSubModule, setSelectedSubModule] = useState(null); // 指令级、程序块级、线程级
  const [currentImage, setCurrentImage] = useState('/dataflow/overall1.png');
  const [showMiddlePanel, setShowMiddlePanel] = useState(false);
  const [showRightPanel, setShowRightPanel] = useState(false);
  const [showLargePanel, setShowLargePanel] = useState(false);
  const [largePanelImage, setLargePanelImage] = useState('');
  const [middlePanelImage, setMiddlePanelImage] = useState('');
  const [rightPanelImage, setRightPanelImage] = useState('');
  const [flowDiagramImage, setFlowDiagramImage] = useState('/dataflow/overall1.png');

  const handleModuleClick = (module) => {
    console.log('点击模块:', module);
    
    switch (module) {
      case 'PageRank':
        // 切换到PageRank时清空之前的显示
        setSelectedMainModule('PageRank');
        setShowLargePanel(false);
        setShowMiddlePanel(true);
        setShowRightPanel(false);
        setMiddlePanelImage('/dataflow/pr-0.png');
        setRightPanelImage('');
        break;
      case 'ViT':
        // 切换到ViT时清空之前的显示
        setSelectedMainModule('ViT');
        setShowLargePanel(false);
        setShowMiddlePanel(true);
        setShowRightPanel(false);
        setMiddlePanelImage('/dataflow/vit-0.png');
        setRightPanelImage('');
        break;
      case '指令级':
        if (selectedMainModule === 'PageRank') {
          setRightPanelImage('/dataflow/pr-1.png');
        } else if (selectedMainModule === 'ViT') {
          setRightPanelImage('/dataflow/vit-1.png');
        }
        setShowRightPanel(true);
        break;
      case '程序块级':
        if (selectedMainModule === 'PageRank') {
          setRightPanelImage('/dataflow/pr-2.png');
        } else if (selectedMainModule === 'ViT') {
          setRightPanelImage('/dataflow/vit-2.png');
        }
        setShowRightPanel(true);
        break;
      case '线程级':
        if (selectedMainModule === 'PageRank') {
          setRightPanelImage('/dataflow/pr-3.png');
        } else if (selectedMainModule === 'ViT') {
          setRightPanelImage('/dataflow/vit-3.png');
        }
        setShowRightPanel(true);
        break;
      case '转换':
        setShowLargePanel(true);
        setShowMiddlePanel(false);
        setShowRightPanel(false);
        setLargePanelImage('/dataflow/yingshe.png');
        break;
      case '异质数据流抽象机':
        setShowLargePanel(true);
        setShowMiddlePanel(false);
        setShowRightPanel(false);
        setLargePanelImage('/dataflow/abstract.png');
        break;
      case 'CPU单机系统':
        setShowLargePanel(true);
        setShowMiddlePanel(false);
        setShowRightPanel(false);
        setLargePanelImage('/dataflow/cpu.png');
        break;
      case 'GPU单机系统':
        setShowLargePanel(true);
        setShowMiddlePanel(false);
        setShowRightPanel(false);
        setLargePanelImage('/dataflow/gpu.png');
        break;
      case 'CPU-GPU异构系统':
        setShowLargePanel(true);
        setShowMiddlePanel(false);
        setShowRightPanel(false);
        setLargePanelImage('/dataflow/cpugpu.png');
        break;
      case 'CPU-DSA异构系统':
        setShowLargePanel(true);
        setShowMiddlePanel(false);
        setShowRightPanel(false);
        setLargePanelImage('/dataflow/cpudsa.png');
        break;
      default:
        break;
    }
  };

  const handleModuleHover = (module, isHovering) => {
    if (module === '转换') {
      if (isHovering) {
        setFlowDiagramImage('/dataflow/overall2.png');
      } else {
        setFlowDiagramImage('/dataflow/overall1.png');
      }
    }
  };

  return (
    <Box sx={{ height: '100vh', p: 2 }}>

      
      <Grid container spacing={2} sx={{ height: 'calc(100vh - 120px)' }}>
        {/* 左侧面板 - 固定显示 */}
        <Grid item xs={4}>
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>

            <Box sx={{ flex: 1 }}>
              <FlowDiagram 
                onModuleClick={handleModuleClick}
                onModuleHover={handleModuleHover}
                imageSrc={flowDiagramImage}
              />
            </Box>
          </Box>
        </Grid>
        
        {/* 中间和右侧面板 */}
        {showLargePanel ? (
          /* 大面板模式 - 占据中间和右侧 */
          <Grid item xs={8}>
            <Paper elevation={3} sx={{ p: 2, borderRadius: 3, height: '100%' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'secondary.main' }}>
                详细展示
              </Typography>
              <Box sx={{ textAlign: 'center', height: 'calc(100% - 40px)' }}>
                <img
                  src={largePanelImage}
                  alt="详细展示"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain'
                  }}
                />
              </Box>
            </Paper>
          </Grid>
        ) : (
          /* 分离面板模式 */
          <>
            {/* 中间面板 */}
            <Grid item xs={4}>
              {showMiddlePanel ? (
                <Paper elevation={3} sx={{ p: 2, borderRadius: 3, height: '100%' }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'secondary.main' }}>
                    {selectedMainModule} 算法
                  </Typography>
                  <Box sx={{ textAlign: 'center', height: 'calc(100% - 40px)' }}>
                     <img
                       src={middlePanelImage}
                       alt={`${selectedMainModule} 算法`}
                       style={{
                         maxWidth: '100%',
                         maxHeight: '100%',
                         objectFit: 'contain'
                       }}
                     />
                   </Box>
                </Paper>
              ) : (
                <Paper elevation={3} sx={{ p: 2, borderRadius: 3, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="body1" color="text.secondary">
                    请点击 PageRank 或 ViT 开始
                  </Typography>
                </Paper>
              )}
            </Grid>
            
            {/* 右侧面板 */}
            <Grid item xs={4}>
              {showRightPanel ? (
                <Paper elevation={3} sx={{ p: 2, borderRadius: 3, height: '100%' }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'secondary.main' }}>
                    层级详情
                  </Typography>
                  <Box sx={{ textAlign: 'center', height: 'calc(100% - 40px)' }}>
                     <img
                       src={rightPanelImage}
                       alt="层级详情"
                       style={{
                         maxWidth: '100%',
                         maxHeight: '100%',
                         objectFit: 'contain'
                       }}
                     />
                   </Box>
                </Paper>
              ) : (
                <Paper elevation={3} sx={{ p: 2, borderRadius: 3, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="body1" color="text.secondary">
                    请点击指令级、程序块级或线程级
                  </Typography>
                </Paper>
              )}
            </Grid>
          </>
        )}
      </Grid>
    </Box>
  );
}