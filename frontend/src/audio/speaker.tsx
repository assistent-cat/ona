import React, { createContext, ReactNode } from "react";

import { createLoopback } from "./loopback";

interface ISpeakerContext {
  speak(data: Blob): Promise<void>;
}

const SpeakerContext = createContext<ISpeakerContext>({
  speak: undefined,
});

export { SpeakerContext as AudioPlayerContext };

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

const SpeakerProvider = ({ children }: Props) => {
  let player: ISpeakerContext;

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

  player = {
    speak,
  };

  return (
    <SpeakerContext.Provider value={player}>{children}</SpeakerContext.Provider>
  );
};

export default SpeakerProvider;
