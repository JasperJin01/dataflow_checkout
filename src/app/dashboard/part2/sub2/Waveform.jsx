import React, { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import DynamicWavePlayer from "./DynamicWavePlayer";
import DynamicNumericalPlayer from "./DynamicNumericalPlayer";
import SyncWavePlayer from "./SyncWavePlayer";

const Waveform = ({ data, currentIndex, setCurrentIndex, height }) => {
  const [waveformData, setWaveformData] = useState([]);
  const [signalNames, setSignalNames] = useState([]);
  const [signalTypes, setSignalTypes] = useState([]);
  const [totalBeats, setTotalBeats] = useState([]);
  const interval = 500; // 设置间隔时间为500ms

  useEffect(() => {
    if (data) {
      const lines = data.split("\n");
      if (lines.length >= 2) {
        // 解析第一行和第二行
        setSignalNames(lines[0].split(" "));
        const signalNameLength = lines[0].split(" ").length;
        const tempSignalTypes = lines[1].split(" ");
        setSignalTypes(tempSignalTypes);
        // 解析波形数据
        const data = lines.slice(2).map((line) => line.split(" "));
        const waveData = [];
        data.forEach((item, index) => {
          if (index == 0) {
            for (let i = 0; i < signalNameLength; i++) {
              if (tempSignalTypes[i] === "signal") {
                waveData.push([item[i]]); // Ensure item[i] is parsed to an integer
              } else if (tempSignalTypes[i] === "data") {
                waveData.push([item[i]]); // Ensure item[i] is parsed to an integer
              }
            }
          } else {
            for (let i = 0; i < signalNameLength; i++) {
              if (tempSignalTypes[i] === "signal") {
                waveData[i].push(item[i]); // Ensure item[i] is parsed to an integer
              } else if (tempSignalTypes[i] === "data") {
                waveData[i].push(item[i]); // Ensure item[i] is parsed to an integer
              }
            }
          }
        })
        console.log("waveData", waveData);
        setWaveformData(waveData);
        const tempTotalBeats = totalBeats;
        tempTotalBeats.push(tempTotalBeats.length + 1);
        setTotalBeats(tempTotalBeats);
      }
    } else {
      setWaveformData([]);
      setSignalNames([]);
      setSignalTypes([]);
      setTotalBeats([]);
    }
  }, [data]);

  useEffect(() => {
    let timer;
    if (currentIndex < waveformData[0]?.length - 1) {
      timer = setInterval(() => {
        setCurrentIndex(prev => prev + 1);
      }, interval);
    }
    return () => clearInterval(timer);
  }, [currentIndex, waveformData]);


  // 绘制信号波形
  const renderSignalWave = (data, index) => {
    return (
      <Box key={index} sx={{height: 45, mb: "5px"}}>
        {data && data.length > 0 && (<Box display={"flex"} alignItems="center">
          <DynamicWavePlayer
            data={data.map((value) => value)}
            interval={500}
            currentIndex={currentIndex}
          />
        </Box>)}
      </Box>
    );
  };

  const renderNumberWave = (data, index) => {
    return (
      <Box key={index} sx={{height: 45, mb: "5px"}}>
        {data && data.length > 0 && (
          <DynamicNumericalPlayer
            data={data.map((value) => value)}
            interval={500}
            currentIndex={currentIndex}
          />
        )}
      </Box>
    );
  }


  return (
    <Box sx={{display: 'flex', flexDirection: 'column'}}>
      <Box border="1px solid #ccc" p={2} height={height} overflow="auto" sx={{display: 'flex'}}>
        <Box >
          {signalNames.length > 0 &&
            <Typography variant="body1" sx={{
              pr: 1,
              height: '80px',
              lineHeight: '50px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              paddingTop: '30px'
            }}>{'clk'}</Typography>
          }
          {signalNames.length > 0 &&
            signalNames.map((name, index) => (
              <Typography variant="body1" key={name} sx={{
                pr: 1,
                height: '50px',
                lineHeight: '50px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>{signalNames[index]}</Typography>
            ))
          }
        </Box>
        <Box>
        {waveformData.length > 0 && <SyncWavePlayer data={waveformData[0]} currentIndex={currentIndex}/>}
        {waveformData.length > 0 &&
          signalNames.map((_, index) => {
            if (signalTypes[index] === "signal") {
               return renderSignalWave(
                waveformData[index],
                index
              )
            } else if (signalTypes[index] === "data") {
              return renderNumberWave(
                waveformData[index],
                index,
              )
            }

          })}
      </Box>

      </Box>
    </Box>
  );
};

export default Waveform;
