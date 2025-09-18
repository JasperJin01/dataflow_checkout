import { useRef, useState, useEffect } from 'react';
import { Box, Typography, Paper } from '@mui/material';

const FlowDiagram = ({ onModuleClick, onModuleHover, imageSrc = '/dataflow/overall1.png' }) => {
  const [hoveredModule, setHoveredModule] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const imageRef = useRef(null);
  const [scaleFactor, setScaleFactor] = useState({ scaleX: 1, scaleY: 1 });
  
  // 原始图片尺寸（根据实际图片尺寸设置）
  const originalImageDimensions = { width: 480, height: 700 };

  // 定义按钮坐标和尺寸 - 基于原始图片尺寸
  const modules = {
    'PageRank': { x: 123, y: 20, width: 124, height: 39.6 },
    'ViT': { x: 278, y: 20, width: 115.2, height: 38.8 },
    '指令级': { x: 140, y: 160, width: 82, height: 40 },
    '程序块级': { x: 242, y: 165, width: 99.6, height: 40 },
    '线程级': { x: 360, y: 165, width: 126, height: 40 },
    '转换': { x: 228, y: 236, width: 30, height: 44 },
    '异质数据流抽象机': { x: 2, y: 295, width: 450, height: 50 },
    'CPU单机系统': { x: 28, y: 610, width: 66, height: 40 },
    'GPU单机系统': { x: 112, y: 610, width: 42, height: 40 },
    'CPU-GPU异构系统': { x: 205, y: 610, width: 110, height: 40 },
    'CPU-DSA异构系统': { x: 339, y: 610, width: 110, height: 40 }
  };

  // 计算当前缩放比例
  const calculateScaleFactor = () => {
    if (!imageRef.current) return { scaleX: 1, scaleY: 1 };
    
    const displayWidth = imageRef.current.clientWidth;
    const displayHeight = imageRef.current.clientHeight;
    
    return {
      scaleX: displayWidth / originalImageDimensions.width,
      scaleY: displayHeight / originalImageDimensions.height
    };
  };

  // 监听窗口大小变化，重新计算缩放因子
  useEffect(() => {
    const updateScaleFactor = () => {
      const newScaleFactor = calculateScaleFactor();
      setScaleFactor(newScaleFactor);
    };

    // 初始计算
    updateScaleFactor();

    // 监听窗口大小变化
    window.addEventListener('resize', updateScaleFactor);
    
    // 清理函数
    return () => {
      window.removeEventListener('resize', updateScaleFactor);
    };
  }, []);

  // 图片加载完成后计算缩放因子
  const handleImageLoad = () => {
    const newScaleFactor = calculateScaleFactor();
    setScaleFactor(newScaleFactor);
  };
  
  // 根据缩放比例调整坐标
  const getScaledCoordinates = (coords) => {
    return {
      x: coords.x * scaleFactor.scaleX,
      y: coords.y * scaleFactor.scaleY,
      width: coords.width * scaleFactor.scaleX,
      height: coords.height * scaleFactor.scaleY
    };
  };
  
  const handleMouseMove = (event) => {
    const rect = event.target.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // 计算对应的原始坐标（反向计算）
    const originalX = x / scaleFactor.scaleX;
    const originalY = y / scaleFactor.scaleY;
    
    setMousePosition({ 
      x, 
      y,
      originalX,
      originalY
    });
    
    let foundModule = null;
    for (const [module, coords] of Object.entries(modules)) {
      const scaledCoords = getScaledCoordinates(coords);
      
      if (
        x >= scaledCoords.x && 
        x <= scaledCoords.x + scaledCoords.width && 
        y >= scaledCoords.y && 
        y <= scaledCoords.y + scaledCoords.height
      ) {
        foundModule = module;
        // 调用父组件传入的悬停回调函数
        if (onModuleHover && hoveredModule !== module) {
          onModuleHover(module, true);
        }
        break;
      }
    }
    
    // 如果之前有悬停的模块，现在没有了，调用悬停结束回调
    if (hoveredModule && !foundModule && onModuleHover) {
      onModuleHover(hoveredModule, false);
    }
    
    setHoveredModule(foundModule);
  };

  const handleMouseLeave = () => {
    // 如果有悬停的模块，调用悬停结束回调
    if (hoveredModule && onModuleHover) {
      onModuleHover(hoveredModule, false);
    }
    setHoveredModule(null);
    setMousePosition({ x: 0, y: 0 });
  };

  const handleImageClick = (event) => {
    const rect = event.target.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    for (const [module, coords] of Object.entries(modules)) {
      const scaledCoords = getScaledCoordinates(coords);
      
      if (
        x >= scaledCoords.x && 
        x <= scaledCoords.x + scaledCoords.width && 
        y >= scaledCoords.y && 
        y <= scaledCoords.y + scaledCoords.height
      ) {
        console.log(`点击了模块: ${module}`);
        if (onModuleClick) {
          onModuleClick(module);
        }
        break;
      }
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: 2,
        borderRadius: 3,
        height: '100%',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Typography variant="h6" sx={{ 
        fontWeight: 700, mb: 2, color: 'secondary.main', borderBottom: '2px solid', pb: 1
      }}>
        流程展示
      </Typography>
      <Box sx={{ textAlign: 'center', height: '100%', overflow: 'hidden', mt:1 }}>
        <img
          ref={imageRef}
          src={imageSrc}
          alt="流程图"
          onClick={handleImageClick}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onLoad={handleImageLoad}
          style={{ 
            cursor: 'pointer', 
            maxWidth: '100%', 
            height: 'auto',
            maxHeight: '80%'
          }}
        />
        {hoveredModule && (
          <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
            {hoveredModule}
          </Typography>
        )}
        {/* 鼠标位置、缩放、原始坐标，用于调试 */}
        {/* <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
          鼠标位置: ({mousePosition.x.toFixed(0)}, {mousePosition.y.toFixed(0)}) 
          缩放: ({scaleFactor.scaleX.toFixed(2)}, {scaleFactor.scaleY.toFixed(2)}) 
          原始坐标: ({mousePosition.originalX?.toFixed(1) || 0}, {mousePosition.originalY?.toFixed(1) || 0})
        </Typography> */}
      </Box>
    </Paper>
  );
};

export default FlowDiagram;
