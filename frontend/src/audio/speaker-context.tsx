import React, { createContext, ReactNode } from "react";

import { createLoopback } from "./loopback";

interface ISpeakerContext {
  speak(data: Blob): Promise<void>;
  analyser: AnalyserNode;
}

const SpeakerContext = createContext<ISpeakerContext>({
  speak: undefined,
  analyser: undefined,
});

export { SpeakerContext };

const getAudioContext = () => {
  const audioContext = new window.AudioContext({ sampleRate: 22050 });

  return audioContext;
};

interface Props {
  children: ReactNode | ReactNode[];
}

const SpeakerProvider = ({ children }: Props) => {
  let player: ISpeakerContext;

  let initialised = false;
  const audioContext = getAudioContext();
  const analyser = audioContext.createAnalyser();
  const destinationNode = audioContext.createMediaStreamDestination();
  const onaSpeaker: HTMLAudioElement = document.getElementById(
    "ona-speaker"
  ) as HTMLAudioElement;
  let nextStartTime = audioContext.currentTime;

  let loopbackStream: MediaStream;
  let source: AudioBufferSourceNode;
  const init = async () => {
    loopbackStream = await createLoopback(destinationNode);
    initialised = true;
  };

  const speak = async (audioData: Blob) => {
    const arrayBuffer = await audioData.arrayBuffer();
    if (arrayBuffer && arrayBuffer.byteLength > 0) {
      if (!initialised) {
        await init();
      }

      source = audioContext.createBufferSource();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      source.buffer = audioBuffer;
      source.connect(analyser).connect(destinationNode);
      source.start(nextStartTime);
      nextStartTime += audioBuffer.duration;

      onaSpeaker.muted = false;
      onaSpeaker.srcObject = loopbackStream;
      onaSpeaker.play();
    }
  };

  player = {
    speak,
    analyser,
  };

  return (
    <SpeakerContext.Provider value={player}>{children}</SpeakerContext.Provider>
  );
};

export default SpeakerProvider;
