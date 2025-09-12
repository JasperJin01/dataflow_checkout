"use client";
import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Grid, Button, Paper, Typography, 
  LinearProgress, IconButton, Card, CardContent
} from '@mui/material';
import { PlayArrow, Pause } from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

// 场景配置
const scenes = [
  {
    name: "城市道路场景",
    description: "城市道路环境下的自动驾驶场景演示",
    // description: "城市道路环境下的自动驾驶场景演示，包含多车道、交通信号灯、行人过街等复杂城市交通元素",
    images: Array.from({length: 40}, (_, i) => 
      `${String(39 + i).padStart(3, '0')}.jpg`
    )
  },
  {
    name: "高车流量场景",
    description: "高车流量十字路口环境下的自动驾驶场景演示", 
    // description: "高车流量十字路口环境下的自动驾驶场景演示，展示在繁忙交叉路口的精准导航和避障能力", 
    images: Array.from({length: 41}, (_, i) => 
      `${String(79 + i).padStart(3, '0')}.jpg`
    )
  },
  {
    name: "窄路场景",
    // description: "单车道窄路环境下的自动驾驶场景演示，测试在受限空间中的精确控制和路径规划能力",
    description: "窄路环境下的自动驾驶场景演示",
    images: Array.from({length: 40}, (_, i) => 
      `${String(202 + i).padStart(3, '0')}.jpg`
    )
  },
  {
    name: "露天停车场场景",
    // description: "露天停车场环境下的自动驾驶场景演示，展示自动泊车、车位识别和精确停车的先进技术",
    description: "露天停车场环境下的自动驾驶场景演示",
    images: Array.from({length: 41}, (_, i) => 
      `${String(242 + i).padStart(3, '0')}.jpg`
    )
  }
];

export default function AutonomousDrivingDemo() {
  const [currentScene, setCurrentScene] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  
  // 融合前区域状态
  const [beforeImageIndex, setBeforeImageIndex] = useState(0);
  const [isBeforePlaying, setIsBeforePlaying] = useState(false);
  
  // 融合后区域状态
  const [afterImageIndex, setAfterImageIndex] = useState(0);
  const [isAfterPlaying, setIsAfterPlaying] = useState(false);
  
  // 性能数据状态
  const [showPerformanceChart, setShowPerformanceChart] = useState(false);
  
  const intervalRef = useRef(null);
  const beforeIntervalRef = useRef(null);
  const afterIntervalRef = useRef(null);
  const imageRef = useRef(null);

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
      value: 1.55,
      unit: 'samples/s',
      fill: '#1976d2'
    }
  ];

  // 播放速度设置
  const beforePlaybackSpeed = 150; // 融合前播放速度
  const afterPlaybackSpeed = 118;   // 融合后播放速度

  // NOTE 融合前区域自动播放功能
  useEffect(() => {
    if (isBeforePlaying) {
      beforeIntervalRef.current = setInterval(() => {
        setBeforeImageIndex(prev => {
          // const nextIndex = prev + 1;
          const nextIndex = prev + 1;
          if (nextIndex >= scenes[currentScene].images.length) {
            // 播放完毕后停止
            setIsBeforePlaying(false);
            return prev;
          }
          return nextIndex;
        });
      }, beforePlaybackSpeed);
    } else {
      if (beforeIntervalRef.current) {
        clearInterval(beforeIntervalRef.current);
      }
    }

    return () => {
      if (beforeIntervalRef.current) {
        clearInterval(beforeIntervalRef.current);
      }
    };
  }, [isBeforePlaying, currentScene, beforePlaybackSpeed]);

  // 检测播放完毕状态
  useEffect(() => {
    const beforeFinished = beforeImageIndex >= scenes[currentScene].images.length - 1;
    const afterFinished = afterImageIndex >= scenes[currentScene].images.length - 1;
    
    if (beforeFinished && afterFinished && !isBeforePlaying && !isAfterPlaying) {
      setShowPerformanceChart(true);
      // 播放完成后自动向下滑动到性能图表
      setTimeout(() => {
        const performanceChart = document.querySelector('[data-performance-chart]');
        if (performanceChart) {
          performanceChart.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 500);
    }
  }, [beforeImageIndex, afterImageIndex, isBeforePlaying, isAfterPlaying, currentScene]);

  // 融合后区域自动播放功能
  useEffect(() => {
    if (isAfterPlaying) {
      afterIntervalRef.current = setInterval(() => {
        setAfterImageIndex(prev => {
          const nextIndex = prev + 1;
          if (nextIndex >= scenes[currentScene].images.length) {
            // 播放完毕后停止
            setIsAfterPlaying(false);
            return prev;
          }
          return nextIndex;
        });
      }, afterPlaybackSpeed);
    } else {
      if (afterIntervalRef.current) {
        clearInterval(afterIntervalRef.current);
      }
    }

    return () => {
      if (afterIntervalRef.current) {
        clearInterval(afterIntervalRef.current);
      }
    };
  }, [isAfterPlaying, currentScene, afterPlaybackSpeed]);

  // 更新进度（基于融合后区域的进度）
  useEffect(() => {
    const totalImages = scenes[currentScene].images.length;
    const progressPercent = ((afterImageIndex + 1) / totalImages) * 100;
    setProgress(progressPercent);
  }, [afterImageIndex, currentScene]);

  // 场景切换时重置所有图片索引
  useEffect(() => {
    setCurrentImageIndex(0);
    setBeforeImageIndex(0);
    setAfterImageIndex(0);
    setIsPlaying(false);
    setIsBeforePlaying(false);
    setIsAfterPlaying(false);
  }, [currentScene]);

  const handleRun = () => {
    const anyPlaying = isBeforePlaying || isAfterPlaying;
    if (anyPlaying) {
      // 停止所有播放
      setIsBeforePlaying(false);
      setIsAfterPlaying(false);
      setIsPlaying(false);
    } else {
      // 如果已经是最后一张照片，重新开始播放
      if (beforeImageIndex === scenes[currentScene].images.length - 1) {
        setBeforeImageIndex(0);
      }
      if (afterImageIndex === scenes[currentScene].images.length - 1) {
        setAfterImageIndex(0);
      }
      // 开始播放两个区域
      setIsBeforePlaying(true);
      setIsAfterPlaying(true);
      setIsPlaying(true);
    }
  };

  const handleSceneChange = (sceneIndex) => {
    setCurrentScene(sceneIndex);
    setCurrentImageIndex(0);
    setBeforeImageIndex(0);
    setAfterImageIndex(0);
    setIsPlaying(false);
    setIsBeforePlaying(false);
    setIsAfterPlaying(false);
    setShowPerformanceChart(false);
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

      {/* 播放控制区域 - 横向长条 */}
      <Paper elevation={3} sx={{ p: 2, mb: 3, borderRadius: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          {/* 场景选择 */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            {scenes.map((scene, index) => (
              <Button
                key={index}
                variant={currentScene === index ? "contained" : "outlined"}
                size="small"
                onClick={() => handleSceneChange(index)}
                sx={{ minWidth: '80px' }}
              >
                {scene.name}
              </Button>
            ))}
          </Box>

          {/* 播放控制 */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleRun}
              startIcon={(isBeforePlaying || isAfterPlaying) ? <Pause /> : <PlayArrow />}
              sx={{ minWidth: '100px' }}
            >
              {(isBeforePlaying || isAfterPlaying) ? '暂停' : '运行'}
            </Button>
          </Box>

          {/* 当前场景信息 */}
          <Box sx={{ textAlign: 'left', minWidth: '200px' }}>
            <Typography variant="body2" color="text.secondary">
              <strong>{scenes[currentScene].name}</strong>
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {scenes[currentScene].description}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* 图像显示区域 */}
      <Paper elevation={3} sx={{ p: 2, borderRadius: 3 }}>

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
            <img
              src={`/drive_visual/combined/combined_${scenes[currentScene].images[beforeImageIndex]}`}
              alt={`融合前场景 ${scenes[currentScene].images[beforeImageIndex]}`}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain'
              }}
              onError={(e) => {
                console.error(`Failed to load before image: ${e.target.src}`);
                e.target.style.display = 'none';
              }}
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
            <img
              src={`/drive_visual/combined/combined_${scenes[currentScene].images[afterImageIndex]}`}
              alt={`融合后场景 ${scenes[currentScene].images[afterImageIndex]}`}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain'
              }}
              onError={(e) => {
                console.error(`Failed to load after image: ${e.target.src}`);
                e.target.style.display = 'none';
              }}
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
          <Typography variant="body2" color="text.secondary">
            <strong>显示模式：</strong>左侧融合前区域（播放速度：150ms），右侧融合后区域（播放速度：60ms）
          </Typography>
        </Box>
      </Paper>

      {/* 性能图表 */}
      <Box sx={{ mt: 4 }} data-performance-chart>
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