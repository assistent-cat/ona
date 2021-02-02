import React, { createContext, ReactNode, useContext, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  resolveAndAppendMediaTrack,
  setListening,
  lowerMediaVolumeBy,
  restoreMediaVolume,
  stopPlayingMedia,
} from "../audio/mediaSlice";
import { SpeakerContext } from "../audio/speaker-context";

import { appendChatMessage } from "../chat/chatSlice";
import { WS_URL } from "../config";
import { RootState } from "../rootReducer";
import { Configuration } from "../user/userSlice";
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
  const player = useContext(SpeakerContext);

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
      init();
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
            dispatch(setListening(false));
            break;
          case "play":
            dispatch(resolveAndAppendMediaTrack(data.data));
            break;
          case "stop":
            dispatch(stopPlayingMedia());
            player.stop();
            break;
          case "listening":
            dispatch(setListening(true));
            dispatch(lowerMediaVolumeBy(0.2));
            break;
          case "waiting_for_hotword":
            dispatch(setListening(false));
            dispatch(restoreMediaVolume());
            break;
          default:
        }
      } else if (message.data instanceof Blob) {
        const audioData = message.data;
        await player.speak(audioData);
      }
    };
  };

  const configuration = useSelector<RootState, Configuration>(
    (state) => state.user.configuration
  );

  useEffect(() => {
    if (socket && socket.readyState === 1) {
      socket.send(
        JSON.stringify({
          msg_type: "configuration",
          payload: configuration,
        })
      );
    }
  }, [configuration]);

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
