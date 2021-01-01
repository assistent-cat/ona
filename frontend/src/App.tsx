import React, { useState, useEffect } from "react";

import Chat from "./chat/chat";

const user = "unsafe";
const key = "unsafe";
interface SpeakMessage {
  msg_type: "speak";
  utterance: string;
}

type BusMessage = SpeakMessage;
interface ChatMessage {
  type: "bot" | "human";
  message: string;
}

let socket: WebSocket;

function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    const authToken = btoa(user + ":" + key);

    document.cookie = "X-Authorization=" + authToken + "; path=/";

    socket = new WebSocket("ws://127.0.0.1:5678");
    socket.onopen = () => {
      console.log("Connection opened");
    };

    socket.onmessage = (message: MessageEvent<string>) => {
      const data: BusMessage = JSON.parse(message.data);
      console.log(`message arrived: ${JSON.stringify(data, null, 2)}`);

      if (data.msg_type === "speak") {
        appendChatMessage(data.utterance, "bot");
      }
    };
  }, []);

  const appendChatMessage = (message: string, type: "human" | "bot") => {
    setMessages((messages) => [
      ...messages,
      {
        type,
        message,
      },
    ]);
  };

  const onSubmit = (utterance: string) => {
    if (utterance) {
      appendChatMessage(utterance, "human");

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
    }
  };

  return <Chat messages={messages} onSubmit={onSubmit} />;
}

export default App;
