import React, { createContext, ReactNode } from "react";
import { useDispatch } from "react-redux";

import { createLoopback } from "./loopback";

interface IAudioPlayerContext {
  speak(data: Blob): Promise<void>;
  playStream(uri: string): void;
}

const AudioPlayerContext = createContext<IAudioPlayerContext>({
  speak: undefined,
  playStream: undefined,
});

export { AudioPlayerContext };

const getAudioContext = () => {
  //   const CrossAudioContext =
  //     window.AudioContext || (window as any).webkitAudioContext;
  const audioContext = new window.AudioContext({ sampleRate: 22050 });
  // const analyser = audioContext.createAnalyser();

  return audioContext;
};

interface Props {
  children: ReactNode | ReactNode[];
}

const AudioPlayerProvider = ({ children }: Props) => {
  let player: IAudioPlayerContext;

  const dispatch = useDispatch();

  let audioContext: AudioContext;
  let nextStartTime: number;
  let destinationNode: MediaStreamAudioDestinationNode;
  let loopbackStream: MediaStream;
  let source: AudioBufferSourceNode;
  let onaSpeaker: HTMLAudioElement;

  const init = async () => {
    audioContext = getAudioContext();
    nextStartTime = audioContext.currentTime;
    destinationNode = audioContext.createMediaStreamDestination();
    loopbackStream = await createLoopback(destinationNode);
    onaSpeaker = document.getElementById("ona-speaker") as HTMLAudioElement;
  };

  const speak = async (audioData: Blob) => {
    const arrayBuffer = await audioData.arrayBuffer();
    if (arrayBuffer && arrayBuffer.byteLength > 0) {
      if (!audioContext) {
        await init();
      }

      source = audioContext.createBufferSource();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      source.buffer = audioBuffer;
      source.connect(destinationNode);
      source.start(nextStartTime);
      nextStartTime += audioBuffer.duration;

      onaSpeaker.muted = false;
      onaSpeaker.srcObject = loopbackStream;
      onaSpeaker.play();
    }
  };

  const playStream = () => {};

  player = {
    speak,
    playStream,
  };

  return (
    <AudioPlayerContext.Provider value={player}>
      {children}
    </AudioPlayerContext.Provider>
  );
};

export default AudioPlayerProvider;
