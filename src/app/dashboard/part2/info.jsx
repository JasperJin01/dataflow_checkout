
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';

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
          分布式框架兼容至少3类异构分布式环境（CPU-GPU、CPU-FPGA、CPU-DSA），
        </Box>
        <Box component="span" display="block">
        相较于传统数据流TensorFlow（分布式模式），大规模数据测试条件下<span className='red-bold'>典型图算法和机器学习模型取得1.5倍以上的性能提升</span>。
        </Box>
        
        <Box component="span" display="block" mt={1}>
          <strong>典型图算法测试：</strong>
        </Box>
        <Box component="span" display="block">
          采用Graph500标准数据集运行图计算典型算法PageRank进行实际测试，
        </Box>
        <Box component="span" display="block">
          性能度量依据为算法端到端的总体执行时间。
        </Box>
        
        <Box component="span" display="block" mt={1}>
          <strong>典型机器学习算法测试：</strong>
        </Box>
        <Box component="span" display="block">
          采用ImageNet、DriveSeg等智能驾驶数据集运行标准ViT模型进行实际测试，
        </Box>
        <Box component="span" display="block">
          性能度量依据为算法端到端的总体执行时间。
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

// PageRank数据集配置表
export const PAGERANK_DATASETS = {
  'Rmat-18': { node: '174,147', edge: '7,600,696', memory: '94MB' },
  'Rmat-19': { node: '335,318', edge: '15,459,350', memory: '195MB' },
  'Rmat-20': { node: '645,820', edge: '31,361,722', memory: '404MB' }
};

// 数据集信息组件
export const DatasetInfo = ({ dataset }) => {
  // 处理数组情况（全部数据集）
  if (Array.isArray(dataset)) {
    // 检查是否包含 PageRank 数据集
    const pageRankDatasets = dataset.filter(ds => PAGERANK_DATASETS[ds]);
    
    if (pageRankDatasets.length > 0) {
      return (
        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e0e0e0' }}>
          <Table size="small">
            <TableHead sx={{ bgcolor: '#f5f5f5' }}>
              <TableRow>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>数据集</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>节点规模</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>边规模</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>内存大小</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pageRankDatasets.map(ds => {
                const info = PAGERANK_DATASETS[ds];
                return (
                  <TableRow key={ds}>
                    <TableCell align="center">{ds}</TableCell>
                    <TableCell align="center">{info.node}</TableCell>
                    <TableCell align="center">{info.edge}</TableCell>
                    <TableCell align="center">{info.memory}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      );
    }
    
    // 对于非PageRank数据集（如ViT），列表显示
    return (
      <Box>
        {dataset.map(ds => (
          <Box key={ds} sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              <strong>{ds}:</strong>
            </Typography>
            <DatasetInfo dataset={ds} />
          </Box>
        ))}
      </Box>
    );
  }

  // 如果是PageRank的数据集，显示表格
  if (PAGERANK_DATASETS[dataset]) {
    const info = PAGERANK_DATASETS[dataset];
    return (
      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e0e0e0' }}>
        <Table size="small">
          <TableHead sx={{ bgcolor: '#f5f5f5' }}>
            <TableRow>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>数据集</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>节点规模</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>边规模</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>内存大小</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell align="center">{dataset}</TableCell>
              <TableCell align="center">{info.node}</TableCell>
              <TableCell align="center">{info.edge}</TableCell>
              <TableCell align="center">{info.memory}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
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