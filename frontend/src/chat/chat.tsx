import React, { useEffect, useRef } from "react";
import styled from "styled-components";

import ChatBubble from "./chat-bubble";
import ChatInput from "./chat-input";

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const ChatWrapper = styled.div`
  overflow: auto;
  margin-top: 40px;
  padding: 0 24px;
  flex: 1;
`;

interface Props {
  messages: Array<{
    type: "bot" | "human";
    message: string;
  }>;
  onSubmit(utterance: string): void;
}

const Chat: React.FunctionComponent<Props> = ({ messages, onSubmit }) => {
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTo(0, chatRef.current.scrollHeight);
    }
  }, [messages]);

  return (
    <ContentWrapper>
      <ChatWrapper ref={chatRef}>
        {messages.map(({ type, message }, index) => {
          return <ChatBubble key={`${index}`} message={message} type={type} />;
        })}
      </ChatWrapper>
      <ChatInput onSubmit={onSubmit} />
    </ContentWrapper>
  );
};

export default Chat;
