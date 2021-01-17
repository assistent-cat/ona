import React, { createContext, ReactNode, useContext } from "react";
import { useDispatch } from "react-redux";
import { appendMediaTrack } from "../audio/mediaSlice";
import { AudioPlayerContext } from "../audio/speaker";

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
      // TODO: some sort of ws connection watcher instead of this
      console.log("trying to reconnect");
      init();
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

        switch (data.msg_type) {
          case "speak":
            dispatch(
              appendChatMessage({
                message: data.utterance,
                type: "bot",
              })
            );
            break;
          case "recognized":
            dispatch(
              appendChatMessage({
                message: data.utterance,
                type: "human",
              })
            );
            break;
          case "play":
            dispatch(appendMediaTrack(data.data));
            break;
          default:
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
