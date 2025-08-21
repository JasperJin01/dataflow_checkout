"use client";
import React from 'react';
import { Box, Grid, Paper, Typography, Button } from '@mui/material';
import { useRouter } from 'next/navigation';
import { paths } from '@/paths';

export default function DataflowTheory() {
  const router = useRouter();

  return (
    <Box sx={{ p: 3, backgroundColor: '#f5f6fa' }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper elevation={0} sx={{
            p: 3,
            borderRadius: 2,
            backgroundColor: '#f0f4f8',
            border: '1px solid #e0e0e0'
          }}>
            <Typography variant="h5" component="h1" gutterBottom sx={{ fontWeight: 700, color: '#1a237e' }}>
              数据流理论演示
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              数据流计算是一种高效的并行计算模型，特别适合于图计算和机器学习等应用场景。
              通过优化数据移动和计算调度，数据流计算可以显著提高算法执行效率和吞吐量。
            </Typography>
            <Typography variant="body1">
              请选择以下演示内容查看详细信息：
            </Typography>
          </Paper>
        </Grid>

        {/* PageRank算法卡片 */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ 
            p: 3, 
            borderRadius: 2, 
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
            }
          }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'primary.main' }}>
              PageRank算法
            </Typography>
            <Typography variant="body2" sx={{ mb: 3, flexGrow: 1 }}>
              PageRank是一种用于网页排名的图算法，由Google创始人拉里·佩奇和谢尔盖·布林开发。
              本演示展示了如何使用数据流计算模型优化PageRank算法，提高其在大规模图数据上的处理效率。
            </Typography>
            <Button 
              variant="contained" 
              color="primary"
              onClick={() => router.push(paths.dashboard.dataflow_theory_pagerank)}
              sx={{ alignSelf: 'flex-start' }}
            >
              查看演示
            </Button>
          </Paper>
        </Grid>

        {/* 典型机器学习算法卡片 */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ 
            p: 3, 
            borderRadius: 2, 
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
            }
          }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'secondary.main' }}>
              Vision Transformer
            </Typography>
            <Typography variant="body2" sx={{ mb: 3, flexGrow: 1 }}>
              本演示展示了如何将数据流计算应用于Vision Transformer (ViT)算法，
              通过数据流优化，这些算法可以在处理大规模图像数据集时获得显著的性能提升。
            </Typography>
            <Button 
              variant="contained" 
              color="secondary"
              onClick={() => router.push(paths.dashboard.dataflow_theory_ml)}
              sx={{ alignSelf: 'flex-start' }}
            >
              查看演示
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
} 