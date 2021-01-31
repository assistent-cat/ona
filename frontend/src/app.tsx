import React from "react";
import { useSelector } from "react-redux";
import styled from "styled-components";
import MediaPlayer from "./audio/media-player";

import Microphone from "./audio/microphone";
import SpeakerControl from "./audio/speaker-control";
import Chat from "./chat/chat";
import ChatControl from "./chat/chat-control";
import IntroModal from "./intro-modal";
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
  width: ${({ open }) => (open ? "600vw" : "0px")};
  background-color: #fcfcfc;
  border: 1px solid #f2f2f2;
  transition: all 0.5s ease-out 0s;
  @media screen and (min-width: 40em) {
    max-width: 40em;
  }
`;

function App() {
  const sidebarOpen = useSelector<RootState, boolean>(
    (state) => state.chat.sidebarOpen
  );

  return (
    <ContentWrapper>
      <IntroModal />
      <MainWrapper>
        <MediaWrapper>
          <MediaPlayer />
        </MediaWrapper>
        <ControlsWrapper>
          <SpeakerControl />
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
