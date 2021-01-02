import React, { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import styled from "styled-components";

import { RootState } from "../rootReducer";

import ChatBubble from "./chat-bubble";
import ChatInput from "./chat-input";
import { ChatMessage } from "./chatSlice";

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
  onSubmit(utterance: string): void;
}

const Chat: React.FunctionComponent<Props> = ({ onSubmit }) => {
  const chatRef = useRef<HTMLDivElement>(null);

  const messages = useSelector<RootState, ChatMessage[]>(
    (state) => state.chat.messages
  );

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
