import React from "react";
import { useSelector } from "react-redux";
import styled from "styled-components";
import MediaPlayer from "./audio/media-player";

import Microphone from "./audio/microphone";
import Chat from "./chat/chat";
import ChatControl from "./chat/chat-control";
import { RootState } from "./rootReducer";

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: row;
  height: 100%;
`;

const MainWrapper = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
  width: 100%;
  flex: 1;
`;

const MediaWrapper = styled.div`
  padding: 1rem;
  display: flex;
  flex: 1;
  overflow: auto;
`;

const ControlsWrapper = styled.div`
  padding: 1rem;
  display: flex;
  justify-content: center;
`;

const ChatSidebar = styled.div<{ open: boolean }>`
  height: 100%;
  overflow: hidden;
  max-width: 40%;
  width: ${({ open }) => (open ? "600vw" : "0px")};
  background-color: #fcfcfc;
  border: 1px solid #f2f2f2;
  transition: all 0.5s ease-out 0s;
`;

function App() {
  const sidebarOpen = useSelector<RootState, boolean>(
    (state) => state.chat.sidebarOpen
  );

  return (
    <ContentWrapper>
      <MainWrapper>
        <MediaWrapper>
          <MediaPlayer />
        </MediaWrapper>
        <ControlsWrapper>
          <Microphone />
          <ChatControl />
        </ControlsWrapper>
      </MainWrapper>
      <ChatSidebar open={sidebarOpen}>
        <Chat />
      </ChatSidebar>
    </ContentWrapper>
  );
}

export default App;
