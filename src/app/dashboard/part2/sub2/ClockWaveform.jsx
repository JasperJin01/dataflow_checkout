import React, { useMemo } from 'react';

const ClockWaveform = ({
  data = [0, 1],
  widthPerSegment = 100,
  height = 40,
}) => {
  // 生成时钟节拍序列（每个数据点对应两个电平变化）
  const clockData = useMemo(() =>
    data.flatMap(() => [1, 0]),
  [data]);

  // 生成节拍标记（每个数据点对应一个节拍编号）
  const beatMarkers = useMemo(() =>
    data.map((_, index) => ({
      x: index * widthPerSegment + widthPerSegment/2, // 居中显示在完整周期中间
      number: index + 1
    })),
  [data, widthPerSegment]);

  // 生成波形路径
  const segments = useMemo(() => {
    const segmentWidth = widthPerSegment / 2;
    return clockData.map((value, index) => {
      const x = index * segmentWidth;
      const y = value === 1 ? 0 : height;
      const prevValue = clockData[index - 1];

      return {
        x,
        y,
        vertical: index > 0 && prevValue !== value,
        beatNumber: index + 1
      };
    });
  }, [clockData, widthPerSegment, height]);

  return (
    <svg
      width={data.length * widthPerSegment}
      height={height + 40}
      style={{ overflow: 'visible' }}
    >
      {/* 节拍编号显示 */}
      {beatMarkers.map((marker, index) => (
        <text
          key={`num-${index}`}
          x={marker.x}
          y="10"
          textAnchor="middle"
          fill="#2c3e50"
          fontSize="13"
          fontWeight="600"
          style={{marginBottom: '5px'}}
        >
          {'第' + marker.number + '拍'}
        </text>
      ))}

      {/* 波形绘制 */}
      {segments.map((seg, index) => (
        <g key={`wave-${index}`} transform="translate(0, 25)">
          {/* 水平线段 */}
          <line
            x1={seg.x}
            y1={seg.y}
            x2={seg.x + (widthPerSegment/2)}
            y2={seg.y}
            stroke="#2ecc71"
            strokeWidth="2"
          />

          {/* 垂直线（当电平变化时） */}
          {seg.vertical && (
            <line
              x1={seg.x}
              y1={segments[index-1].y}
              x2={seg.x}
              y2={seg.y}
              stroke="#2ecc71"
              strokeWidth="2"
            />
          )}
        </g>
      ))}
    </svg>
  );
};

export default ClockWaveform;
