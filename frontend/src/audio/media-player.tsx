import React from "react";
import { useSelector } from "react-redux";
import styled from "styled-components";
import ReactPlayer from "react-player";

import { RootState } from "../rootReducer";
import { MediaState } from "./mediaSlice";
import { getMediaUri } from "./utils";
import WaveVisualizer from "./wave-visualizer";

interface Props {}

const ContentWrapper = styled.div`
  height: 100%;
  width: 100%;
`;

const MediaPlayer: React.FunctionComponent<Props> = () => {
  const media = useSelector<RootState, MediaState["media"]>(
    (state) => state.media.media
  );

  const mediaUri = getMediaUri(media.tracks?.[media.tracks.length - 1]);
  return (
    <ContentWrapper>
      {mediaUri ? (
        <ReactPlayer
          playing={media.playing}
          volume={media.volume}
          muted={media.muted}
          url={mediaUri}
          controls={true}
          width="100%"
          height="100%"
        />
      ) : (
        <WaveVisualizer />
      )}
    </ContentWrapper>
  );
};

export default MediaPlayer;
