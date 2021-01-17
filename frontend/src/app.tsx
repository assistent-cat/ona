import React, { useContext } from "react";
import { useDispatch } from "react-redux";
import { WebSocketContext } from "./api/websocket";

import Chat from "./chat/chat";
import { appendChatMessage } from "./chat/chatSlice";

function App() {
  const dispatch = useDispatch();
  const ws = useContext(WebSocketContext);

  // TODO move to chat component
  const onSubmit = (utterance: string) => {
    if (utterance) {
      dispatch(
        appendChatMessage({
          message: utterance,
          type: "human",
        })
      );

      ws.sendUtterance(utterance);
    }
  };

  return <Chat onSubmit={onSubmit} />;
}

export default App;
