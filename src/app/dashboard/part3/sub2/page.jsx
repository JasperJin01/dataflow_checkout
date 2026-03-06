"use client";
import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Grid, Button, Paper, Typography, 
  LinearProgress, IconButton, Card, CardContent,
  Select, MenuItem, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow
} from '@mui/material';
import { PlayArrow, Pause } from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import request from '@/lib/request/request';

// 场景配置
const scenes = [
  {
    name: "城市道路场景",
    description: "城市道路环境下的自动驾驶场景演示",
    video: "/drive_visual/videos/scene_01.mp4"
  },
  {
    name: "高车流量场景",
    description: "高车流量十字路口环境下的自动驾驶场景演示", 
    video: "/drive_visual/videos/scene_02.mp4"
  },
  {
    name: "窄路场景",
    description: "窄路环境下的自动驾驶场景演示",
    video: "/drive_visual/videos/scene_03.mp4"
  },
  {
    name: "露天停车场场景",
    description: "露天停车场环境下的自动驾驶场景演示",
    video: "/drive_visual/videos/scene_04.mp4"
  }
];

export default function AutonomousDrivingDemo() {
  const [currentScene, setCurrentScene] = useState(0);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  
  // 视频播放状态
  const [beforeVideoEnded, setBeforeVideoEnded] = useState(false);
  const [afterVideoEnded, setAfterVideoEnded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // 性能数据状态
  const [showPerformanceChart, setShowPerformanceChart] = useState(false);
  
  // 日志状态
  const [logs, setLogs] = useState([]);
  
  // Throughput 数据状态
  const [throughputData, setThroughputData] = useState(null);
  
  const beforeVideoRef = useRef(null);
  const afterVideoRef = useRef(null);
  const performanceChartRef = useRef(null);
  const logBoxRef = useRef(null);

  // 性能数据
  const performanceData = [
    {
      name: '融合前',
      value: 1.18,
      unit: 'samples/s',
      fill: '#ff7043'
    },
    {
      name: '融合后', 
      value: throughputData || 1.55,
      unit: 'samples/s',
      fill: '#1976d2'
    }
  ];

  // 播放速度设置 (基于10fps视频基准)
  // 融合前: 150ms/帧 -> ~6.67fps -> 0.67x
  // 融合后: 80ms/帧 -> ~12.5fps -> 1.25x
  const BEFORE_PLAYBACK_RATE = 0.67;
  const AFTER_PLAYBACK_RATE = 1.15;

  // 监听视频结束状态
  useEffect(() => {
    if (beforeVideoEnded && afterVideoEnded) {
      setIsPlaying(false);
      // 播放完成后显示性能图表
      setTimeout(() => {
        setShowPerformanceChart(true);
        
        // 图片播放完毕后滚动到底部展示图表
        setTimeout(() => {
          performanceChartRef.current?.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        }, 500);
        
        // 执行完毕，设置 running 为 false
        setTimeout(() => {
          setRunning(false);
          setLogs(prevLogs => [...prevLogs, `[INFO] ${scenes[currentScene].name} 执行完毕`]);
        }, 1000);
      }, 1000);
    }
  }, [beforeVideoEnded, afterVideoEnded, currentScene]);

  // 更新进度（基于融合后区域的进度）
  const handleTimeUpdate = () => {
    if (afterVideoRef.current) {
      const duration = afterVideoRef.current.duration;
      const currentTime = afterVideoRef.current.currentTime;
      if (duration > 0) {
        setProgress((currentTime / duration) * 100);
      }
    }
  };

  // 自动滚动到日志底部
  useEffect(() => {
    if (logBoxRef.current) {
      logBoxRef.current.scrollTop = logBoxRef.current.scrollHeight;
    }
  }, [logs]);

  // 场景切换时重置状态
  useEffect(() => {
    setRunning(false);
    setIsPlaying(false);
    setBeforeVideoEnded(false);
    setAfterVideoEnded(false);
    setShowPerformanceChart(false);
    setThroughputData(null);
    setProgress(0);
    
    // 重置视频
    if (beforeVideoRef.current) {
      beforeVideoRef.current.currentTime = 0;
      beforeVideoRef.current.pause();
    }
    if (afterVideoRef.current) {
      afterVideoRef.current.currentTime = 0;
      afterVideoRef.current.pause();
    }
  }, [currentScene]);

  const handleRun = async () => {
    if (isPlaying) {
      // 停止所有播放
      if (beforeVideoRef.current) beforeVideoRef.current.pause();
      if (afterVideoRef.current) afterVideoRef.current.pause();
      setIsPlaying(false);
      setRunning(false);
    } else {
      setRunning(true);
      setLogs([`开始执行场景 ${scenes[currentScene].name}...`]);
      setBeforeVideoEnded(false);
      setAfterVideoEnded(false);
      setShowPerformanceChart(false);
      
      // 预加载视频（如果尚未加载）
      if (beforeVideoRef.current) beforeVideoRef.current.load();
      if (afterVideoRef.current) afterVideoRef.current.load();
      
      try {
        // 场景索引：城市道路场景(1)、高车流量场景(2)、窄路场景(3)、露天停车场场景(4)
        const sceneIdx = currentScene + 1;
        
        // 调用后端 API
        setLogs(prev => [...prev, '正在与服务器建立连接...']);
        const eventSource = new EventSource(`${request.BASE_URL}/api/usage/runad/${sceneIdx}`);
        
        eventSource.onmessage = (event) => {
          if (event.data === '[done]') {
            eventSource.close();
            
            // 先小幅滚动到自动驾驶图片播放区域
            setTimeout(() => {
              const imageSection = document.querySelector('.image-display-section');
              if (imageSection) {
                imageSection.scrollIntoView({ 
                  behavior: 'smooth', 
                  block: 'center' 
                });
                
                // 滚动完成后再开始播放视频
                setTimeout(() => {
                  setIsPlaying(true);
                  
                  // 设置播放速度并开始播放
                  if (beforeVideoRef.current) {
                    beforeVideoRef.current.playbackRate = BEFORE_PLAYBACK_RATE;
                    beforeVideoRef.current.play().catch(e => console.error("Before video play failed", e));
                  }
                  
                  if (afterVideoRef.current) {
                    afterVideoRef.current.playbackRate = AFTER_PLAYBACK_RATE;
                    afterVideoRef.current.play().catch(e => console.error("After video play failed", e));
                  }
                  
                }, 800); // 等待滚动动画完成
              }
            }, 500);
            
          } else if (event.data === '[error]') {
            eventSource.close();
            setLogs(prev => [...prev, `❌ 服务器执行出错：${scenes[currentScene].name}`]);
            setRunning(false);
          } else {
            // 提取 Throughput 数据
            const throughputMatch = event.data.match(/Throughput:\s*([\d.]+)\s*samples\/second/);
            if (throughputMatch) {
              const throughputValue = parseFloat(throughputMatch[1]);
              setThroughputData(throughputValue);
            }
            
            // 显示后端日志
            setLogs(prev => [...prev, event.data]);
          }
        };
        
        eventSource.onerror = () => {
          eventSource.close();
          setLogs(prev => [...prev, `❌ ${scenes[currentScene].name} 连接错误`]);
          setRunning(false);
        };
        
      } catch (error) {
        setLogs(prev => [...prev, `❌ 执行失败: ${error.message}`]);
        setRunning(false);
      }
    }
  };

  const handleSceneChange = (sceneIndex) => {
    setCurrentScene(sceneIndex);
  };
  
  const isButtonDisabled = () => {
    // 只有在后端执行阶段才禁用，播放阶段可以点击停止
    if (running && !isPlaying) return true;
    return false;
  };

  return (
    <Box sx={{ p: 3, backgroundColor: '#f5f6fa' }}>
      {/* 顶部说明 */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2, backgroundColor: '#f0f4f8', border: '1px solid #e0e0e0' }}>
        <Typography variant="body1" component="div" sx={{ lineHeight: 1.6, color: '#2d3436', fontSize: '0.95rem' }}>
          <strong style={{ fontSize: '16px' }}>自动驾驶场景演示</strong>
          <Box component="span" display="block">
            本演示展示了基于视觉Transformer（ViT）算法的自动驾驶场景识别和分割效果。
          </Box>
          <Box component="span" display="block">
            通过实时处理摄像头输入，系统能够准确识别道路、车辆、行人等关键元素，
            为自动驾驶决策提供可靠的视觉感知基础。
          </Box>
          <Box component="span" display="block">
            演示包含四个不同场景，每个场景都展示了算法在不同环境下的表现。
          </Box>
        </Typography>
      </Paper>

      {/* 场景选择和控制区域 */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 2, borderRadius: 3 }}>
            <Typography variant="h6" sx={{
              fontWeight: 700,
              mb: 2,
              color: 'secondary.main',
              borderBottom: '2px solid',
              borderColor: 'secondary.main',
              pb: 1
            }}>
              自动驾驶场景选择
            </Typography>

            <Select
              fullWidth
              value={currentScene}
              onChange={(e) => handleSceneChange(e.target.value)}
              sx={{ mb: 2 }}
            >
              {scenes.map((scene, index) => (
                <MenuItem key={index} value={index}>{scene.name}</MenuItem>
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
              {running ? '运行中' : '运行'}
            </Button>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2, lineHeight: 1.6 }}>
              描述：{scenes[currentScene].description}
            </Typography>

            {running && <LinearProgress value={progress} sx={{ mt: 1 }} />}
          </Paper>
        </Grid>
              {/* 右侧列 */}
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
      </Grid>





      {/* 图像显示区域 */}
      <Paper elevation={3} sx={{ p: 2, borderRadius: 3 }} className="image-display-section">

        {/* 左右分割的标题 */}
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          {/* 左侧标题 */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{
              fontWeight: 700,
              color: 'secondary.main',
              borderBottom: '2px solid',
              borderColor: 'secondary.main',
              pb: 1,
              textAlign: 'center'
            }}>
              自动驾驶场景演示（融合前）
            </Typography>
          </Box>
          
          {/* 右侧标题 */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{
              fontWeight: 700,
              color: 'secondary.main',
              borderBottom: '2px solid',
              borderColor: 'secondary.main',
              pb: 1,
              textAlign: 'center'
            }}>
              自动驾驶场景演示（融合后）
            </Typography>
          </Box>
        </Box>

        
        {/* 左右分割的图像显示区域 */}
        <Box sx={{ display: 'flex', gap: 2, height: 500 }}>
          {/* 左侧：融合前区域 */}
          <Box sx={{ 
            flex: 1,
            position: 'relative',
            backgroundColor: '#000',
            borderRadius: 2,
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <video
              ref={beforeVideoRef}
              src={scenes[currentScene].video}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain'
              }}
              muted
              playsInline
              preload="auto"
              onEnded={() => setBeforeVideoEnded(true)}
              onError={(e) => console.error(`Failed to load before video: ${e.target.src}`)}
            />

            {/* 左侧图像信息 */}
            <Box sx={{
              position: 'absolute',
              bottom: 16,
              left: 16,
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              color: 'white',
              padding: '8px 12px',
              borderRadius: 1,
              fontSize: '0.875rem'
            }}>
              <Typography variant="body2">
                {scenes[currentScene].name} - 融合前
              </Typography>
            </Box>
          </Box>

          {/* 右侧：融合后区域 */}
          <Box sx={{ 
            flex: 1,
            position: 'relative',
            backgroundColor: '#000',
            borderRadius: 2,
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <video
              ref={afterVideoRef}
              src={scenes[currentScene].video}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain'
              }}
              muted
              playsInline
              preload="auto"
              onEnded={() => setAfterVideoEnded(true)}
              onTimeUpdate={handleTimeUpdate}
              onError={(e) => console.error(`Failed to load after video: ${e.target.src}`)}
            />

            {/* 右侧图像信息 */}
            <Box sx={{
              position: 'absolute',
              bottom: 16,
              left: 16,
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              color: 'white',
              padding: '8px 12px',
              borderRadius: 1,
              fontSize: '0.875rem'
            }}>
              <Typography variant="body2">
                {scenes[currentScene].name} - 融合后
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* 场景描述 */}
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            <strong>当前场景：</strong>{scenes[currentScene].description}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>算法：</strong>视觉Transformer (ViT) - 自动驾驶场景分割
          </Typography>
        </Box>
      </Paper>

      {/* 性能图表 */}
      <Box sx={{ mt: 4 }} data-performance-chart ref={performanceChartRef}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 2, backgroundColor: '#ffffff', border: '1px solid #e0e0e0' }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{
                  fontWeight: 700,
                  color: 'secondary.main',
                  borderBottom: '2px solid',
                  borderColor: 'secondary.main',
                  pb: 1,
                }}>
                  处理性能对比
              </Typography>
            </Box>

              <Box sx={{ height: 350, mt:4 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={showPerformanceChart ? performanceData : []}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                    barCategoryGap="40%"
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis 
                      label={{ value: 'samples/s', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip 
                      formatter={(value) => [`${value} samples/s`, '处理速度']}
                    />
                    <Legend 
                      payload={[
                        { value: '融合前', type: 'rect', color: '#ff7043' },
                        { value: '融合后', type: 'rect', color: '#1976d2' }
                      ]}
                    />
                    <Bar 
                      dataKey="value" 
                      radius={[4, 4, 0, 0]}
                      maxBarSize={60}
                    >
                      {(showPerformanceChart ? performanceData : []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* 添加脉冲动画样式 */}
      <style jsx>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}</style>
    </Box>
  );
}