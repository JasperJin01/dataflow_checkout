import React, { useState, useEffect } from 'react';
import NumericalWaveform from './NumericalWaveform';

const DynamicNumericalPlayer = ({
  data,
  widthPerSegment = 100,
  height = 40,
  currentIndex = 0
}) => {

  return (
    <div style={{ position: 'relative' }}>
      {/* 完整边框参考线 */}
      <div style={{
        position: 'absolute',
        width: data.length * widthPerSegment,
        height,
        pointerEvents: 'none'
      }}/>

      <NumericalWaveform
        data={data.slice(0, currentIndex+1)}
        widthPerSegment={widthPerSegment}
        height={height}
      />
    </div>
  );
};
export default DynamicNumericalPlayer;
