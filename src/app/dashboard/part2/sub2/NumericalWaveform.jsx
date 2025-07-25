import React from 'react';

const NumericalWaveform = ({
  data = [5, 3, 8, 2],
  widthPerSegment = 40,
  height = 40
}) => {
  return (
    <svg
      width={data.length * widthPerSegment}
      height={height}
    >
      {data.map((value, index) => (
        <g key={index}>
          {/* 边框容器 */}
          <line
          x1={index * widthPerSegment}
          y1={0}
          x2={index * widthPerSegment}
          y2={height}
          stroke="#2ecc71"
          strokeWidth={2}
        />
        <line
          x1={(index + 1) * widthPerSegment}
          y1={0}
          x2={(index + 1) * widthPerSegment}
          y2={height}
          stroke="#2ecc71"
          strokeWidth={2}
        />

        {/* 上下边框（宽度2px） */}
        <line
          x1={index * widthPerSegment}
          y1={0}
          x2={(index + 1) * widthPerSegment}
          y2={0}
          stroke="#2ecc71"
          strokeWidth={4}
        />
        <line
          x1={index * widthPerSegment}
          y1={height}
          x2={(index + 1) * widthPerSegment}
          y2={height}
          stroke="#2ecc71"
          strokeWidth={4}
        />

          {/* 数值显示 */}
          <text
            x={index * widthPerSegment + widthPerSegment/2}
            y={height/2}
            textAnchor="middle"
            dominantBaseline="central"
            fill="#2ecc71"
            fontSize="14"
            fontWeight="500"
          >
            {value}
          </text>
        </g>
      ))}
    </svg>
  );
};

export default NumericalWaveform;
