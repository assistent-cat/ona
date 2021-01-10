import React, { createContext, ReactNode } from "react";
import { useDispatch } from "react-redux";

import { appendChatMessage } from "../chat/chatSlice";
import { WS_URL } from "../config";
import { BusMessage } from "./interfaces";

interface WSContext {
  socket: WebSocket;
  sendUtterance(utterance: string): void;
}

const WebSocketContext = createContext<WSContext>({
  socket: undefined,
  sendUtterance: undefined,
});

export { WebSocketContext };

const getAudioContext = () => {
  AudioContext = window.AudioContext || (window as any).webkitAudioContext;
  const audioContext = new AudioContext({ sampleRate: 22050 });
  const analyser = audioContext.createAnalyser();

  return { audioContext, analyser };
};
interface Props {
  children: ReactNode | ReactNode[];
}

let socket: WebSocket;

const WebSocketProvider = ({ children }: Props) => {
  let ws: WSContext;

  const dispatch = useDispatch();
  const { audioContext, analyser } = getAudioContext();
  let nextStartTime = audioContext.currentTime;
  let source: AudioBufferSourceNode;

  const sendUtterance = (utterance: string) => {
    if (socket) {
      socket.send(
        JSON.stringify({
          msg_type: "recognized_utterance",
          payload: {
            utterance,
          },
        })
      );
    } else {
      console.log("no socket");
    }
  };

  if (!socket) {
    socket = new WebSocket(WS_URL);

    socket.onopen = () => {
      console.log("Connection opened");
    };

    socket.onmessage = async (message: MessageEvent<string | any>) => {
      if (typeof message.data === "string") {
        const data: BusMessage = JSON.parse(message.data);
        console.log(`message arrived: ${JSON.stringify(data, null, 2)}`);

        if (data.msg_type === "speak") {
          dispatch(
            appendChatMessage({
              message: data.utterance,
              type: "bot",
            })
          );
        } else if (data.msg_type === "recognized") {
          dispatch(
            appendChatMessage({
              message: data.utterance,
              type: "human",
            })
          );
        }
      } else if (message.data instanceof Blob) {
        const audioData = message.data;
        const arrayBuffer = await audioData.arrayBuffer();
        if (arrayBuffer && arrayBuffer.byteLength > 0) {
          console.log(nextStartTime);
          source = audioContext.createBufferSource();
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          source.buffer = audioBuffer;
          source.connect(audioContext.destination);
          source.start(nextStartTime);
          nextStartTime += audioBuffer.duration;
          console.log(nextStartTime);
        }
      }
    };
  }
  ws = {
    socket,
    sendUtterance,
  };

  return (
    <WebSocketContext.Provider value={ws}>{children}</WebSocketContext.Provider>
  );
};

export default WebSocketProvider;
