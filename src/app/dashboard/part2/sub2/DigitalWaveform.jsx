import React, { useMemo } from 'react';

const DigitalWaveform = ({ data = [0, 1, 0, 1], widthPerSegment = 100, height = 40 }) => {
  const segments = useMemo(() => {
    return data.map((value, index) => {
      const x = index * widthPerSegment;
      const y = (value === 1 || value === "1") ? 0 : 40; // 上下位置
      const prevValue = data[index - 1];

      return {
        x,
        y,
        // 添加垂直线判断
        verticalLine: index > 0 && prevValue !== value
      };
    });
  }, [data]);

  return (
    <svg width={data.length * widthPerSegment} height={height}>
      {segments.map((seg, index) => (
        <g key={index}>
          {/* 水平线 */}
          <line
            x1={seg.x}
            y1={seg.y}
            x2={seg.x + widthPerSegment}
            y2={seg.y}
            stroke="#2ecc71"
            strokeWidth="4"
          />

          {/* 垂直线（当值变化时） */}
          {seg.verticalLine && (
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
export default DigitalWaveform;
