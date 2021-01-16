import React, { createContext, ReactNode, useContext } from "react";
import { useDispatch } from "react-redux";
import { AudioPlayerContext } from "../audio/player";

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
interface Props {
  children: ReactNode | ReactNode[];
}

let socket: WebSocket;

const WebSocketProvider = ({ children }: Props) => {
  let ws: WSContext;

  const dispatch = useDispatch();
  const player = useContext(AudioPlayerContext);

  const sendUtterance = (utterance: string) => {
    if (socket && socket.readyState === 1) {
      socket.send(
        JSON.stringify({
          msg_type: "recognized_utterance",
          payload: {
            utterance,
          },
        })
      );
    } else {
      console.log("trying to reconnect");
      init();
      sendUtterance(utterance);
    }
  };

  const init = () => {
    socket = new WebSocket(WS_URL);

    socket.onopen = () => {
      console.log("Connection opened");
    };

    socket.onclose = () => {
      console.log("Connection closed");
      socket = undefined;
    };

    socket.onmessage = async (message: MessageEvent<string | any>) => {
      if (typeof message.data === "string") {
        const data: BusMessage = JSON.parse(message.data);
        if (process.env.NODE_ENV === "development") {
          console.log(`message arrived: ${JSON.stringify(data, null, 2)}`);
        }

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
        await player.speak(audioData);
      }
    };
  };

  if (!socket) {
    init();
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
