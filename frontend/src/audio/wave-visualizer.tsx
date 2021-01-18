import React, { useCallback, useContext, useEffect, useRef } from "react";
import styled from "styled-components";

import { SpeakerContext } from "./speaker-context";

const Canvas = styled.canvas`
  width: 100%;
  height: 100%;
`;

interface Props {}

const WaveVisualizer: React.FunctionComponent<Props> = () => {
  const canvasRef = useRef<HTMLCanvasElement>();
  const requestRef = useRef<number>();
  let { analyser } = useContext(SpeakerContext);

  const updateWave = useCallback(() => {
    if (analyser) {
      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      analyser.getByteTimeDomainData(dataArray);
      const canvas = canvasRef.current;
      const height = canvas.height;
      const width = canvas.width;
      const context = canvas.getContext("2d");
      let x = 0;
      const sliceWidth = (width * 1.0) / dataArray.length;

      context.lineWidth = 1;
      context.strokeStyle = "#6a96ff";
      context.clearRect(0, 0, width, height);

      context.beginPath();
      context.moveTo(0, height / 2);
      for (const item of dataArray) {
        const y = (item / 255.0) * height;
        context.lineTo(x, y);
        x += sliceWidth;
      }
      context.lineTo(x, height / 2);
      context.stroke();
    }
    requestRef.current = requestAnimationFrame(updateWave);
  }, [analyser]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(updateWave);
    return () => cancelAnimationFrame(requestRef.current);
  }, [updateWave]);

  return <Canvas ref={canvasRef} />;
};

export default WaveVisualizer;
