import React from "react";
import { useSelector } from "react-redux";
import styled from "styled-components";
import ReactPlayer from "react-player";

import { RootState } from "../rootReducer";
import { MediaState, MediaTrack } from "./mediaSlice";

interface Props {}

const ContentWrapper = styled.div`
  height: 100%;
  width: 100%;
`;

const MediaPlayer: React.FunctionComponent<Props> = () => {
  const media = useSelector<RootState, MediaState["media"]>(
    (state) => state.media.media
  );

  const getMediaUri = (tracks: MediaTrack[]): string => {
    const track = tracks?.[tracks?.length - 1];
    if (!track) {
      return null;
    }

    if (Array.isArray(track.uri)) {
      return track.uri[0];
    }

    return track.uri;
  };

  const mediaUri = getMediaUri(media.tracks);
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
      ) : null}
    </ContentWrapper>
  );
};

export default MediaPlayer;
