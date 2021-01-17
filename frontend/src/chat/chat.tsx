import React, { useContext, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import { RightOutlined } from "@ant-design/icons";

import { WebSocketContext } from "../api/websocket";
import { RootState } from "../rootReducer";

import ChatBubble from "./chat-bubble";
import ChatInput from "./chat-input";
import { appendChatMessage, ChatMessage, closeSidebar } from "./chatSlice";

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

const ChatHeader = styled.div`
  padding: 0.5rem;
  display: flex;
  flex-direction: row;
`;

const ChatClose = styled(RightOutlined)`
  color: lightgray;
  box-sizing: border-box;
  > svg {
    height: 2rem;
    width: 2rem;
  }
  cursor: pointer;
`;

interface Props {}

const Chat: React.FunctionComponent<Props> = () => {
  const dispatch = useDispatch();
  const ws = useContext(WebSocketContext);

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
      <ChatHeader>
        <ChatClose onMouseUp={(e) => dispatch(closeSidebar())} />
      </ChatHeader>
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
