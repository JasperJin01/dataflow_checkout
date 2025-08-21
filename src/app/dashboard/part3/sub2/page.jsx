"use client";
import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Grid, Button, Paper, Typography, 
  LinearProgress, IconButton, Card, CardContent
} from '@mui/material';
import { PlayArrow, Pause } from '@mui/icons-material';

// 场景配置
const scenes = [
  {
    name: "场景1",
    description: "城市道路环境下的自动驾驶场景演示",
    // description: "城市道路环境下的自动驾驶场景演示，包含多车道、交通信号灯、行人过街等复杂城市交通元素",
    images: Array.from({length: 40}, (_, i) => 
      `${String(39 + i).padStart(3, '0')}.jpg`
    )
  },
  {
    name: "场景2",
    description: "高车流量十字路口环境下的自动驾驶场景演示", 
    // description: "高车流量十字路口环境下的自动驾驶场景演示，展示在繁忙交叉路口的精准导航和避障能力", 
    images: Array.from({length: 41}, (_, i) => 
      `${String(79 + i).padStart(3, '0')}.jpg`
    )
  },
  {
    name: "场景3",
    // description: "单车道窄路环境下的自动驾驶场景演示，测试在受限空间中的精确控制和路径规划能力",
    description: "窄路环境下的自动驾驶场景演示",
    images: Array.from({length: 40}, (_, i) => 
      `${String(202 + i).padStart(3, '0')}.jpg`
    )
  },
  {
    name: "场景4",
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
  
  const intervalRef = useRef(null);
  const imageRef = useRef(null);

  // 固定播放速度为100ms
  const playbackSpeed = 150;

  // 自动播放功能
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentImageIndex(prev => {
          const nextIndex = prev + 1;
          if (nextIndex >= scenes[currentScene].images.length) {
            // 播放完毕后停止，不切换到下一个场景
            setIsPlaying(false);
            return prev;
          }
          return nextIndex;
        });
      }, playbackSpeed);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, currentScene, playbackSpeed]);

  // 更新进度
  useEffect(() => {
    const totalImages = scenes[currentScene].images.length;
    const progressPercent = ((currentImageIndex + 1) / totalImages) * 100;
    setProgress(progressPercent);
  }, [currentImageIndex, currentScene]);

  // 场景切换时重置图片索引
  useEffect(() => {
    setCurrentImageIndex(0);
    setIsPlaying(false);
  }, [currentScene]);

  const handleRun = () => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      // 如果已经是最后一张照片，重新开始播放
      if (currentImageIndex === scenes[currentScene].images.length - 1) {
        setCurrentImageIndex(0);
      }
      setIsPlaying(true);
    }
  };

  const handleSceneChange = (sceneIndex) => {
    setCurrentScene(sceneIndex);
    setCurrentImageIndex(0);
    setIsPlaying(false);
  };

  const currentImage = scenes[currentScene].images[currentImageIndex];
  const imagePath = `/dirve_visualize/${currentImage}`;

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
              startIcon={isPlaying ? <Pause /> : <PlayArrow />}
              sx={{ minWidth: '100px' }}
            >
              {isPlaying ? '暂停' : '运行'}
            </Button>
          </Box>

                      {/* 进度显示 */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
              <LinearProgress 
                variant="determinate" 
                value={progress} 
                sx={{ flex: 1, height: 8, borderRadius: 4 }}
              />
              <Typography variant="body2" sx={{ minWidth: '40px' }}>
                {Math.round(progress)}%
              </Typography>
            </Box>

          {/* 当前场景信息 */}
          <Box sx={{ textAlign: 'right', minWidth: '200px' }}>
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
        <Typography variant="h6" sx={{
          fontWeight: 700,
          mb: 2,
          color: 'secondary.main',
          borderBottom: '2px solid',
          borderColor: 'secondary.main',
          pb: 1
        }}>
          自动驾驶场景演示
        </Typography>
        
        <Box sx={{ 
          position: 'relative',
          width: '100%',
          height: 500,
          backgroundColor: '#000',
          borderRadius: 2,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <img
            ref={imageRef}
            src={imagePath}
            alt={`自动驾驶场景 ${currentImage}`}
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain'
            }}
            onError={(e) => {
              console.error(`Failed to load image: ${imagePath}`);
              e.target.style.display = 'none';
            }}
          />
          
          {/* 图像信息覆盖层 */}
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
              {scenes[currentScene].name} 
            </Typography>
          </Box>

          {/* 播放状态指示器 */}
          {isPlaying && (
            <Box sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              backgroundColor: 'rgba(76, 175, 80, 0.9)',
              color: 'white',
              padding: '4px 8px',
              borderRadius: 1,
              fontSize: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: 0.5
            }}>
              <Box sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: 'white',
                animation: 'pulse 1s infinite'
              }} />
              播放中
            </Box>
          )}
        </Box>

        {/* 场景描述 */}
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            <strong>当前场景：</strong>{scenes[currentScene].description}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>算法：</strong>视觉Transformer (ViT) - 自动驾驶场景分割
          </Typography>
          {/* <Typography variant="body2" color="text.secondary">
            <strong>处理速度：</strong>实时处理，每帧间隔 {playbackSpeed}ms
          </Typography> */}
        </Box>
      </Paper>

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