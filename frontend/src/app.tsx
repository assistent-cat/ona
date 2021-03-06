import { QuestionCircleOutlined } from "@ant-design/icons";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import styled from "styled-components";
import MediaPlayer from "./audio/media-player";

import Microphone from "./audio/microphone";
import SpeakerControl from "./audio/speaker-control";
import Chat from "./chat/chat";
import ChatControl from "./chat/chat-control";
import HelpModal from "./help-modal";
import IntroModal from "./intro-modal";
import { RootState } from "./rootReducer";
import Settings from "./user/settings";
import SettingsControl from "./user/settings-control";

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

const HeaderWrapper = styled.div`
  padding: 1rem;
  display: flex;
  overflow: auto;
  justify-content: space-between;
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

const Sidebar = styled.div<{ open: boolean; side: "left" | "right" }>`
  height: 100%;
  ${({ side }) => (side === "left" ? "left: 0;" : "right: 0;")}
  overflow: hidden;
  width: ${({ open }) => (open ? "600vw" : "0px")};
  background-color: #fcfcfc;
  border: 1px solid #f2f2f2;
  transition: all 0.5s ease-out 0s;
  @media screen and (min-width: 40em) {
    max-width: 40em;
  }
`;

const HelpButton = styled(QuestionCircleOutlined)`
  color: lightgray;
  box-sizing: border-box;
  padding: 0.2rem 0 0.2rem 0.5rem;
  > svg {
    height: 2rem;
    width: 2rem;
  }
  cursor: pointer;
`;

function App() {
  const chatSidebarOpen = useSelector<RootState, boolean>(
    (state) => state.chat.sidebarOpen
  );
  const userSidebarOpen = useSelector<RootState, boolean>(
    (state) => state.user.sidebarOpen
  );

  const [helpVisible, setHelpVisible] = useState(false);

  return (
    <ContentWrapper>
      <HelpModal visible={helpVisible} setVisible={setHelpVisible} />
      <IntroModal />
      <Sidebar open={userSidebarOpen} side="left">
        <Settings />
      </Sidebar>
      <MainWrapper>
        <HeaderWrapper>
          <SettingsControl />
          <HelpButton
            onMouseUp={() => setHelpVisible((helpVisible) => !helpVisible)}
          />
        </HeaderWrapper>
        <MediaWrapper>
          <MediaPlayer />
        </MediaWrapper>
        <ControlsWrapper>
          <SpeakerControl />
          <Microphone />
          <ChatControl />
        </ControlsWrapper>
      </MainWrapper>
      <Sidebar open={chatSidebarOpen} side="right">
        <Chat />
      </Sidebar>
    </ContentWrapper>
  );
}

export default App;
