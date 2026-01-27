'use client';

import React, { useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import * as echarts from 'echarts';

const PowerGraphDisplay = ({ dataset, algorithm, showLabels = false }) => {
  const graphRef = useRef(null);
  const barChartRef = useRef(null);
  const baselineBarChartRef = useRef(null);

  useEffect(() => {
    const graphChart = echarts.init(graphRef.current);
    const barChart = echarts.init(barChartRef.current);
    const baselineBarChart = echarts.init(baselineBarChartRef.current);

    // 添加窗口大小变化监听
    const handleResize = () => {
      graphChart.resize();
      barChart.resize();
      baselineBarChart.resize();
    };
    window.addEventListener('resize', handleResize);

    // 加载数据并绘制图表
    const loadData = async () => {
      try {
        // 确定要加载的数据文件前缀
        let dataPrefix = 'pf';  // 默认为pf
        if (algorithm === 'se') {
          dataPrefix = 'se';
        } else if (dataset === 'IEEE118') {
          dataPrefix = 'pf_ieee';
        }

        // 加载节点数据
        const nodeResponse = await fetch(`/power/data/${dataPrefix}_node.csv`);
        const nodeText = await nodeResponse.text();
        const nodeData = parseCSV(nodeText);

        // 加载边数据
        const edgeResponse = await fetch(`/power/data/${dataPrefix}_edge.csv`);
        const edgeText = await edgeResponse.text();
        const edgeData = parseCSV(edgeText);

        // 加载时间数据
        const timeResponse = await fetch(`/power/data/${dataPrefix}_time.csv`);
        const timeText = await timeResponse.text();
        const timeData = timeText.trim().split(',').map(Number);

        // 构建图表数据
        const nodes = nodeData.map(node => ({
          name: `${node[1]}`,  // true_id
          x: parseFloat(node[3]),
          y: parseFloat(node[4]),
          category: parseInt(node[2]),
          init_Vm: parseFloat(node[5]),
          init_Va: parseFloat(node[6]),
          init_P: parseFloat(node[7]),
          init_Q: parseFloat(node[8]),
          Vm: parseFloat(node[9]),
          Va: parseFloat(node[10])
        }));

        const edges = edgeData.map(edge => ({
          edge_id: parseInt(edge[0]),
          source: parseInt(edge[1]),
          target: parseInt(edge[2]),
          true_source: parseInt(edge[3]),
          true_target: parseInt(edge[4]),
          G: parseFloat(edge[5]),
          B: parseFloat(edge[6])
        }));

        // 设置图表配置
        const categories = [
          { name: '用户' },
          { name: '变电站' },
          { name: '基准节点' }
        ];

        const graphOption = {
          tooltip: {
            trigger: 'item',
            formatter: function (params) {
              if (params.data.source !== undefined) {
                return `<div style="font-size:12px;line-height:1.2;">
                  <b>edge${params.data.edge_id}</b>
                  <br/>源点: ${params.data.true_source}
                  <br/>目标点: ${params.data.true_target}
                  <br/>电导: ${params.data.G}
                  <br/>电纳: ${params.data.B}
                  </div>`;
              } else {
                const iVm = params.data.category === 0 ? '-' : params.data.init_Vm.toString();
                const iVa = params.data.category === 0 ? '-' : params.data.init_Va.toString();
                const iP = params.data.category === 2 ? '-' : params.data.init_P.toString();
                const iQ = params.data.category === 1 || params.data.category === 2 ? '-' : params.data.init_Q.toString();
                const type = ['PQ节点', 'PV节点', '平衡节点'][params.data.category];

                return `<div style="font-size:12px;line-height:1.2;">
                  <b>节点${params.data.name}</b>
                  <br/>节点类型：${type}
                  <br/>初始电压幅值：${iVm}
                  <br/>初始电压相位：${iVa}
                  <br/>初始有功功率：${iP}
                  <br/>初始无功功率：${iQ}
                  <br/>结果电压幅值：${params.data.Vm}
                  <br/>结果电压相位：${params.data.Va}
                  </div>`;
              }
            },
            backgroundColor: 'rgba(0,0,0,0.5)',
            borderColor: 'rgba(0,0,0,0.5)',
            textStyle: {
              color: '#fff'
            },
            extraCssText: 'width:auto;white-space:nowrap;padding:5px 8px;'
          },
          legend: [{
            data: categories.map(a => a.name)
          }],
          animation: false,
          series: [{
            type: 'graph',
            layout: 'none',
            symbolSize: 10,
            data: nodes,
            links: edges,
            categories: categories,
            roam: true,
            edgeSymbol: ['circle', 'arrow'],
            edgeSymbolSize: [4, 10],
            label: {
            //   show: true,  
              show: false,
              position: 'right'
            },
            force: {
              repulsion: 100,
              gravity: 0.03,
              edgeLength: 80,
              layoutAnimation: true
            }
          }]
        };

        // 处理时间数据 - 统一时间条显示的阶段
        const legendData = ['矩阵生成', '矩阵分解', '传输', '右端项', '前代/回代'];
        const seriesData = [];
        
        // 处理前两个数据点（矩阵生成和分解）
        seriesData.push({
          name: legendData[0],
          type: 'bar',
          stack: '总量',
          barWidth: 15,
          label: {
            show: showLabels,
            position: 'top',
            formatter: (params) => {
              // 检查是否有重叠
              const series = params.series;
              const dataIndex = params.dataIndex;
              let total = 0;
              let currentValue = params.value;
              
              // 计算当前位置的所有值的总和
              series.forEach(s => {
                if (s.data[dataIndex]) {
                  total += s.data[dataIndex];
                }
              });
              
              // 如果当前值占总和的比例太小，则不显示标签
              return (currentValue / total > 0.1) ? params.value.toFixed(3) : '';
            }
          },
          data: [timeData[0]]
        });

        seriesData.push({
          name: legendData[1],
          type: 'bar',
          stack: '总量',
          barWidth: 15,
          label: {
            show: showLabels,
            position: 'top',
            formatter: (params) => {
              const series = params.series;
              const dataIndex = params.dataIndex;
              let total = 0;
              let currentValue = params.value;
              
              series.forEach(s => {
                if (s.data[dataIndex]) {
                  total += s.data[dataIndex];
                }
              });
              
              return (currentValue / total > 0.1) ? params.value.toFixed(3) : '';
            }
          },
          data: [timeData[1]]
        });

        // 处理剩余的数据组（每组4个数据）
        const remainingData = timeData.slice(2);
        for (let i = 0; i < remainingData.length; i++) {
          const groupIndex = Math.floor(i / 4);
          const positionInGroup = i % 4;
          
          let tagName;
          let position;
          
          if (positionInGroup === 0) {
            tagName = legendData[2];
            position = 'bottom';
          } else if (positionInGroup === 1) {
            tagName = legendData[3];
            position = 'top';
          } else if (positionInGroup === 2) {
            tagName = legendData[4];
            position = 'bottom';
          } else {
            tagName = legendData[2];
            position = 'top';
          }

          seriesData.push({
            name: tagName,
            type: 'bar',
            stack: '总量',
            barWidth: 15,
            label: {
              show: showLabels,
              position: position,
              formatter: (params) => {
                const series = params.series;
                const dataIndex = params.dataIndex;
                let total = 0;
                let currentValue = params.value;
                
                series.forEach(s => {
                  if (s.data[dataIndex]) {
                    total += s.data[dataIndex];
                  }
                });
                
                return (currentValue / total > 0.1) ? params.value.toFixed(3) : '';
              }
            },
            data: [remainingData[i]]
          });
        }

        // 设置柱状图配置
        const barOption = {
          tooltip: {
            trigger: 'item',
            axisPointer: { type: 'shadow' },
            formatter: function(params) {
              const value = params.value;
              return `<div style="margin:3px 0">
                <span style="font-weight:bold">${params.seriesName}阶段</span><br/>
                <span>执行时间: ${value.toFixed(3)}ms</span>
              </div>`;
            }
          },
          legend: {
            data: legendData,
            selectedMode: false
          },
          grid: {
            top: '30%',
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
          },
          xAxis: {
            type: 'value',
            name: 'ms',
            max: algorithm === 'pf' ? 600 : algorithm === 'se' ? 200 : undefined, // 潮流计算优化手动设置最大值为600ms
            axisLabel: {
              formatter: '{value}'
            }
          },
          yAxis: {
            type: 'category',
            data: ['优化时间'],
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: {
              fontSize: 12,
              fontWeight: 'bold',
              color: '#1976d2'
            }
          },
          series: seriesData
        };

        // 创建基准时间条配置
        // 根据算法和数据集选择对应的基准数据，统一为5个阶段：矩阵生成、矩阵分解、传输、右端项、前代/回代
        let baselineData = [];
        
        if (algorithm === 'pf') {
           // 潮流计算基准数据 - Case10790: 矩阵生成、矩阵分解、传输(0)、右端项、前代/回代
           baselineData = [
             16.467,   // 矩阵生成 (0.016467s * 1000)
             364.243,  // 矩阵分解 (0.364243s * 1000)
             0,        // 传输 (基准数据中无传输时间)
             137.289,  // 右端项 (0.137289s * 1000)
             34.412    // 前代/回代 (0.034412s * 1000)
           ];
        } else if (algorithm === 'se') {
          // 状态估计基准数据 - 根据数据集选择，统一为5个阶段
           const seBaselineMap = {
             'hn_20171128_174550': [39.93, 99.31, 0, 59.57, 1.15],  // 矩阵生成、矩阵分解、传输(0)、右端项、前代/回代
             'hn_20171208_11100': [38.56, 107.24, 0, 58.15, 1.07],
             'hn_20171207_11100': [39.58, 102.85, 0, 59.50, 1.08],
             'hn_20171207_10000': [41.26, 97.30, 0, 60.49, 1.09],
             'hn_20171207_09150': [39.00, 105.12, 0, 57.03, 1.02],
             'hn_20171207_08000': [38.78, 106.45, 0, 59.25, 1.08],
             'hn_20171207_06300': [39.10, 100.90, 0, 59.40, 1.09],
             'hn_20160818_174550': [38.81, 100.56, 0, 59.47, 1.07]
           };
          
          // 根据数据集选择基准数据，如果没有匹配则使用第一个作为默认
          baselineData = seBaselineMap[dataset] || seBaselineMap['hn_20171128_174550'];
        } else {
           // 默认使用潮流计算数据
           baselineData = [16.467, 364.243, 0, 137.289, 34.412];
         }
        const baselineSeriesData = [];
        
        // 处理基准时间数据（统一为5个阶段：矩阵生成、矩阵分解、传输、右端项、前代/回代）
        for (let i = 0; i < baselineData.length && i < 5; i++) {
          baselineSeriesData.push({
            name: legendData[i],
            type: 'bar',
            stack: '基准总量',
            barWidth: 15,
            label: {
              show: showLabels,
              position: 'top',
              formatter: (params) => {
                // 如果值为0（如传输时间），不显示标签
                return params.value > 0 ? params.value.toFixed(3) : '';
              }
            },
            data: [baselineData[i]]
          });
        }

        // 设置基准时间条配置
        const baselineBarOption = {
          tooltip: {
            trigger: 'item',
            axisPointer: { type: 'shadow' },
            formatter: function(params) {
              const value = params.value;
              return `<div style="margin:3px 0">
                <span style="font-weight:bold">${params.seriesName}阶段 (基准)</span><br/>
                <span>执行时间: ${value.toFixed(3)}ms</span>
              </div>`;
            }
          },
          legend: {
            data: legendData,
            selectedMode: false
          },
          grid: {
            top: '30%',
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
          },
          xAxis: {
            type: 'value',
            name: 'ms',
            max: algorithm === 'pf' ? 600 : undefined, // 潮流计算手动设置基准时间最大值为600ms
            axisLabel: {
              formatter: '{value}'
            }
          },
          yAxis: {
            type: 'category',
            data: ['基准时间'],
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: {
              fontSize: 12,
              fontWeight: 'bold',
              color: '#f57c00'
            }
          },
          series: baselineSeriesData
        };

        // 渲染图表
        graphChart.setOption(graphOption);
        barChart.setOption(barOption);
        baselineBarChart.setOption(baselineBarOption);
      } catch (error) {
        console.error('Error loading graph data:', error);
      }
    };

    loadData();

    // 清理函数
    return () => {
      graphChart.dispose();
      barChart.dispose();
      baselineBarChart.dispose();
      window.removeEventListener('resize', handleResize);
    };
  }, [dataset, algorithm, showLabels]);

  // CSV解析函数
  const parseCSV = (text) => {
    return text.trim().split('\n').map(line => line.split(','));
  };

  return (
    <Box sx={{ 
      height: 800,
      backgroundColor: '#f5f5f5',
      borderRadius: 2,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      <Box ref={graphRef} sx={{ flex: 1, minHeight: 400 }} />
      <Box ref={baselineBarChartRef} sx={{ height: 100, mt: 2 }} />
      <Box ref={barChartRef} sx={{ height: 100, mt: 1 }} />
    </Box>
  );
};

export default PowerGraphDisplay;