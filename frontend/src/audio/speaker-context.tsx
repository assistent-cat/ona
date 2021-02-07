import React, { createContext, ReactNode, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../rootReducer";

import { createLoopback } from "./loopback";

interface ISpeakerContext {
  addUtterance(data: Blob): Promise<void>;
  stop(): void;
  setVolume(vol: number): void;
  analyser: AnalyserNode;
  destinationNode: MediaStreamAudioDestinationNode;
  audioContext: AudioContext;
}

const SpeakerContext = createContext<ISpeakerContext>({
  addUtterance: undefined,
  stop: undefined,
  setVolume: undefined,
  analyser: undefined,
  destinationNode: undefined,
  audioContext: undefined,
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

  const utteranceQueue: Blob[] = [];
  let playing = false;
  let initialised = false;
  const audioContext = getAudioContext();
  const analyser = audioContext.createAnalyser();
  const destinationNode = audioContext.createMediaStreamDestination();
  const onaSpeaker: HTMLAudioElement = document.getElementById(
    "ona-speaker"
  ) as HTMLAudioElement;
  let nextStartTime = audioContext.currentTime;

  let loopbackStream: MediaStream;
  const init = async () => {
    loopbackStream = await createLoopback(destinationNode);
    initialised = true;
  };

  const addUtterance = async (utterance: Blob) => {
    if (!playing) {
      playing = true;
      await speak(utterance);
    } else {
      utteranceQueue.push(utterance);
    }
  };

  const speak = async (audioData: Blob) => {
    const arrayBuffer = await audioData?.arrayBuffer();
    if (arrayBuffer && arrayBuffer.byteLength > 0) {
      if (!initialised) {
        await init();
      }

      const source = audioContext.createBufferSource();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      source.buffer = audioBuffer;
      source.connect(analyser).connect(destinationNode);
      source.start(nextStartTime);
      nextStartTime += audioBuffer.duration;

      setTimeout(async () => {
        playing = false;
        await speak(utteranceQueue.shift());
      }, audioBuffer.duration * 1000);

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
    addUtterance,
    stop,
    setVolume,
    analyser,
    destinationNode,
    audioContext,
  };

  return (
    <SpeakerContext.Provider value={player}>{children}</SpeakerContext.Provider>
  );
};

export default SpeakerProvider;
