
import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

// 考核指标组件
export const AssessmentCriteria = () => {
  return (
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
          分别部署在CPU、GPU、FPGA 三种不同类型的硬件平台上的平稳运行，并得到正确结果。
        </Box>
        <Box component="span" display="block">
        相比于同时期典型基线系统TensorFlow（单节点模式），<span className='red-bold'>程序执行效率提高60%以上，吞吐量提升1.5倍</span>，达到同时期最好水平。
        </Box>
        
        <Box component="span" display="block" mt={1}>
          <strong>硬件平台：</strong>
        </Box>
        <Box component="span" display="block">
          CPU：Intel Xeon E5-2680v4
        </Box>
        <Box component="span" display="block">
          GPU：NVIDIA Ampere A100
        </Box>
        <Box component="span" display="block">
          FPGA：AMD Xilinx U280
        </Box>
        <Box component="span" display="block">
          DSA：华为昇腾910
        </Box>
      </Typography>
    </Paper>
  );
};

// 算法详情组件
export const AlgorithmDetails = ({ algorithm }) => {
  if (algorithm === 'PageRank') {
    return (
      <div>
        PageRank是一种用于衡量网页重要性的算法，通过分析网页之间的链接关系来计算每个网页的权重值。
      </div>
    );
  }
  
  if (algorithm === 'ViT') {
    return (
      <div>
        Vision Transformer (ViT) 是一种将Transformer架构应用于图像分类任务的深度学习模型，通过将图像分割成patches并进行序列化处理。
      </div>
    );
  }
  
  return null;
};

// 数据集信息组件
export const DatasetInfo = ({ dataset }) => {
  if (dataset === 'Rmat-16') {
    return (
      <div>
        <div>节点规模：65,536</div>
        <div>边规模：1,048,576</div>
        <div>内存大小：51MB</div>
      </div>
    );
  }
  
  if (dataset === 'Rmat-18') {
    return (
      <div>
        <div>节点规模：174,147</div>
        <div>边规模：7,600,696</div>
        <div>内存大小：94MB</div>
      </div>
    );
  }

  // TODO: 数据集Rmat-19的信息需要调整
  if (dataset === 'Rmat-19') {
    return (
      <div>
        <div>节点规模：335,318</div>
        <div>边规模：15,459,350</div>
        <div>内存大小：195MB</div>
      </div>
    );
  }
  
  if (dataset === 'Rmat-20') {
    return (
      <div>
        <div>节点规模：645,820</div>
        <div>边规模：31,361,722</div>
        <div>内存大小：404MB</div>
      </div>
    );
  }
  
  if (dataset === 'ImageNet') {
    return (
      <div>
        大规模图像识别数据集，包含超过1400万张图像，涵盖2万多个类别
      </div>
    );
  }
  
  if (dataset === 'DriveSeg') {
    return (
      <div>
        自动驾驶场景分割数据集，专门用于道路场景的语义分割任务
      </div>
    );
  }
  
  return null;
};



// 获取吞吐量单位
export const getThroughputUnit = (algorithm) => {
  switch(algorithm) {
    case 'PageRank': return 'GTEPS';
    case 'ViT': return 'GFLOPS';
    default: return '';
  };
};