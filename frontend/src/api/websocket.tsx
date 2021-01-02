import React, { createContext } from "react";
import { appendChatMessage } from "../chat/chatSlice";
import { BusMessage } from "./interfaces";

interface WSContext {
  socket?: WebSocket;
  sendUtterance?(utterance: string): void;
}

const WebSocketContext = createContext<WSContext>({});

let socket: WebSocket;

export default ({ children }: any) => {
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

  let ws: WSContext = {
    sendUtterance,
  };

  if (!socket) {
    socket = new WebSocket("ws://127.0.0.1:5678");

    socket.onopen = () => {
      console.log("Connection opened");
    };

    socket.onmessage = (message: MessageEvent<string>) => {
      const data: BusMessage = JSON.parse(message.data);
      console.log(`message arrived: ${JSON.stringify(data, null, 2)}`);

      if (data.msg_type === "speak") {
        appendChatMessage({
          message: data.utterance,
          type: "bot",
        });
      }
    };

    ws.socket = socket;
  }

  return (
    <WebSocketContext.Provider value={ws}>{children}</WebSocketContext.Provider>
  );
};
