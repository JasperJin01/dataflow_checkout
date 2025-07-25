import React, { useState, useEffect, useMemo } from 'react';
import ClockWaveform from './ClockWaveform';

const SyncWavePlayer = ({ data, currentIndex }) => {
  // 生成扩展数据（每个原始数据点对应两个节拍）
  const extendedData = useMemo(() =>
    data.flatMap(d => [d, d]),
  [data]);

  return (
    <div style={{ display: 'grid', gap: 20 }}>
      {/* 时钟信号 */}
        <ClockWaveform
          data={data.slice(0, currentIndex + 1)}
        />
    </div>
  );
};
export default SyncWavePlayer;
