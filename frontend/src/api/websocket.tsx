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

interface Props {
  children: ReactNode | ReactNode[];
}

let socket: WebSocket;

const WebSocketProvider = ({ children }: Props) => {
  let ws: WSContext;

  const dispatch = useDispatch();

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

    socket.onmessage = (message: MessageEvent<string>) => {
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
