import React, { createContext, ReactNode, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../rootReducer";

import { createLoopback } from "./loopback";

interface ISpeakerContext {
  speak(data: Blob): Promise<void>;
  stop(): void;
  setVolume(vol: number): void;
  analyser: AnalyserNode;
}

const SpeakerContext = createContext<ISpeakerContext>({
  speak: undefined,
  stop: undefined,
  setVolume: undefined,
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
  const volume = useSelector<RootState, number>((state) => state.media.volume);

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

  const stop = () => {
    if (onaSpeaker) {
      onaSpeaker.src = "";
    }
  };

  const setVolume = (volume: number) => {
    if (onaSpeaker) {
      onaSpeaker.volume = volume;
    }
  };

  useEffect(() => {
    onaSpeaker.volume = volume;
  }, [volume, onaSpeaker]);

  player = {
    speak,
    stop,
    setVolume,
    analyser,
  };

  return (
    <SpeakerContext.Provider value={player}>{children}</SpeakerContext.Provider>
  );
};

export default SpeakerProvider;
