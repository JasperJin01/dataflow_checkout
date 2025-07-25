import React, { useState, useEffect } from 'react';
import DigitalWaveform from './DigitalWaveform'; // 引入数字波形组件

const DynamicWavePlayer = ({ data, currentIndex }) => {

  return (
    <div>
      <DigitalWaveform
        data={data.slice(0, currentIndex + 1)}
      />
    </div>
  );
};

export default DynamicWavePlayer;
