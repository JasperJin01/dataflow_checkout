'use client';

import React from 'react';
import { Box, Grid, Paper, Typography } from '@mui/material';

export default function EmbeddedPage() {
  const url = 'http://disgraphui.xning.site:5380';
  return (
    <Box>
      <Grid item xs={12} sx={{ mb: 3 }}>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 2,
            backgroundColor: '#f0f4f8',
            border: '1px solid #e0e0e0',
          }}
        >
          <Typography
            variant="body1"
            component="div"
            sx={{
              lineHeight: 1.6,
              color: '#2d3436',
              fontSize: '0.95rem',
              '& .red-bold': {
                fontWeight: 600,
                color: '#ff4444',
                display: 'inline',
                padding: '0 2px',
              },
              '& strong': {
                fontWeight: 600,
              },
            }}
          >
            <strong>考核指标</strong>
            <Box component="span" display="block">
              指标4.1: 典型并发图处理任务性能提升两个数量级指标
            </Box>
            <Box component="span" display="block">
              指标4.2：高可扩展并行图算法库
            </Box>

            <strong>中期指标：</strong>
            <Box component="span" display="block">
              指标4.1: 相比于基准图处理系统GraphX 性能提升一个数量级
            </Box>
            <Box component="span" display="block">
              指标4.2：实现高可扩展的典型图遍历类算法和典型图神经网络算法的算子
            </Box>
            <strong>完成时指标：</strong>
            <Box component="span" display="block">
              指标4.1: 相比于基准图处理系统GraphX 性能提升两个数量级
            </Box>
            <Box component="span" display="block">
              指标4.2：实现高可扩展的典型图挖掘类算法的算子，与中期成果一起最终形成包含并行BFS、SSSP、CC
              等的典型图算法库
            </Box>
            <strong>考核方式：</strong>
            <Box component="span" display="block">
              <Box>
                科技查新、专家鉴定或专利授权，提供具有资质的第三方测试机构的测试报告，提供完整的技术报告和使用手册。{' '}
              </Box>
              <Box>
                采用亿级图顶点规模的Graph500 标准数据集和GAPBS 数据集并行运行PageRank、SSSP、CC 和BFS
                等算法，进行实际性能测试。
              </Box>
              <Box>
                基准系统采用2023 年11 月立项时的最新软件版本，运行环境依托主流处理器Intel Xeon Gold 6338
                CPU，计算节点数相同。
              </Box>
            </Box>

            <strong>数据集来源：</strong>
            <Box component="span" display="block">
              采用亿级图顶点规模的Graph500 标准数据集和GAPBS 数据集
            </Box>
          </Typography>
        </Paper>
      </Grid>
      <div
        style={{
          width: '1700px',
          height: '100vh',
          transform: 'scale(0.8)', // 可根据需要调整缩放比例
          transformOrigin: 'top left',
        }}
      >
        <iframe
          src={url}
          width="100%"
          height="100%"
          title="Embedded Page"
          style={{
            border: 'none',
          }}
          allowFullScreen
          sandbox="allow-scripts allow-same-origin allow-forms"
          allow="same-origin allow-scripts allow-popups allow-forms allow-storage-access-by-user-activation"
        ></iframe>
      </div>
    </Box>
  );
}
