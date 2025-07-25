import React, { useEffect, useRef } from 'react';
import { Network } from 'vis-network/standalone';

const NetworkGraph = ({ nodes, edges, options, height = '750px', width = '100%' }) => {
  const containerRef = useRef(null);
  const networkRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // 默认配置，优化大规模图，减少节点重叠
    const defaultOptions = {
      nodes: {
        shape: 'dot',
        size: 10, // 小节点，降低渲染开销
        font: {
          size: 8, // 小字体
          color: 'black',
        },
        borderWidth: 1, // 细边框
      },
      edges: {
        width: 1, // 细边
        smooth: { enabled: false }, // 禁用平滑边
      },
      physics: {
        enabled: true, // 初始启用物理仿真
        barnesHut: {
          gravitationalConstant: -5000, // 强排斥力，分散节点
          centralGravity: 0.1, // 弱聚拢，保持分散
          springLength: 150, // 长边长度，减少重叠
          springConstant: 0.02, // 低弹性，松散布局
          avoidOverlap: 1, // 最大避免重叠
        },
        solver: 'barnesHut', // 高效 solver
        stabilization: {
          enabled: true,
          iterations: 100, // 增加迭代，优化布局
          updateInterval: 20, // 加快更新
          fit: true, // 适应画布
        },
      },
      layout: {
        improvedLayout: false, // 禁用复杂布局
        randomSeed: 42, // 固定种子
      },
    };

    // 合并默认和自定义配置
    const mergedOptions = { ...defaultOptions, ...options };

    // 创建 Vis.js 网络
    const data = { nodes, edges };
    networkRef.current = new Network(containerRef.current, data, mergedOptions);

    // 稳定化完成后静态化
    networkRef.current.on('stabilizationIterationsDone', () => {
      networkRef.current.setOptions({ physics: { enabled: false } });
      console.log('稳定化完成，图已静态');
    });

    // 监控稳定化进度（调试用）
    networkRef.current.on('stabilizationProgress', (params) => {
      console.log(`稳定化进度: ${params.iterations}/${params.total}`);
    });

    return () => {
      if (networkRef.current) {
        networkRef.current.destroy();
        networkRef.current = null;
      }
    };
  }, [nodes, edges, options]);

  return (
    <div
      ref={containerRef}
      style={{
        height,
        width,
        background: '#ffffff',
        border: '1px solid #444',
      }}
    />
  );
};

export default NetworkGraph;
