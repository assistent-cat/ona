import { SoundOutlined } from "@ant-design/icons";
import React, { useState } from "react";
import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";

import { RootState } from "../rootReducer";
import { setVolume, toggleSpeaker } from "./mediaSlice";
import { Slider } from "antd";

const ContentWrapper = styled.div`
  position: relative;
`;

const VolumeSlider = styled.div`
  position: absolute;
  display: inline-block;
  height: 12rem;
  bottom: 99%;
  left: 0;
  padding: 0.75rem;
  padding-bottom: 1%;
`;

const SpeakerButton = styled(SoundOutlined)<{ muted: boolean }>`
  color: ${({ muted }) => (muted ? "lightgray" : "#6a96ff")};
  box-sizing: border-box;
  padding: 0.2rem 0 0.2rem 0.5rem;
  > svg {
    height: 3rem;
    width: 3rem;
  }
  cursor: pointer;
`;

interface Props {}

const SpeakerControl: React.FunctionComponent<Props> = () => {
  const [volVisible, setVolVisible] = useState(false);
  const dispatch = useDispatch();
  const muted = useSelector<RootState, boolean>((state) => state.media.muted);
  const volume = useSelector<RootState, number>((state) => state.media.volume);

  return (
    <ContentWrapper>
      {volVisible ? (
        <VolumeSlider
          onMouseEnter={() => setVolVisible(true)}
          onMouseLeave={() => setVolVisible(false)}
        >
          <Slider
            vertical
            defaultValue={100}
            value={volume * 100}
            onChange={(value: number) => dispatch(setVolume(value / 100))}
          />
        </VolumeSlider>
      ) : null}
      <SpeakerButton
        muted={muted}
        onMouseUp={() => dispatch(toggleSpeaker())}
        onMouseEnter={() => setVolVisible(true)}
        onMouseLeave={() => setVolVisible(false)}
      />
    </ContentWrapper>
  );
};

export default SpeakerControl;
