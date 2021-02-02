import React, { useContext, useRef } from "react";
import { useSelector } from "react-redux";
import styled from "styled-components";
import ReactPlayer from "react-player";

import { RootState } from "../rootReducer";
import { MediaState } from "./mediaSlice";
import { getMediaUri } from "./utils";
import WaveVisualizer from "./wave-visualizer";
import { SpeakerContext } from "./speaker-context";

interface Props {}

const ContentWrapper = styled.div`
  height: 100%;
  width: 100%;
`;

const MediaPlayer: React.FunctionComponent<Props> = () => {
  const playerRef = useRef<ReactPlayer>();
  const speaker = useContext(SpeakerContext);

  const media = useSelector<RootState, MediaState["media"]>(
    (state) => state.media.media
  );

  const mediaUri = getMediaUri(media.tracks?.[media.tracks.length - 1]);
  const onReady = () => {
    if (playerRef.current) {
      const player = playerRef.current.getInternalPlayer();
      if (
        player instanceof HTMLAudioElement ||
        player instanceof HTMLVideoElement
      ) {
        const playerAudio = speaker.audioContext.createMediaElementSource(
          player
        );
        playerAudio.connect(speaker.destinationNode);
      }
    }
  };

  return (
    <ContentWrapper>
      {mediaUri && !media.stopped ? (
        <ReactPlayer
          ref={playerRef}
          onReady={onReady}
          playing={media.playing}
          volume={media.volume}
          muted={media.muted}
          url={mediaUri}
          controls={true}
          config={{
            file: {
              attributes: {
                crossOrigin: "anonymous",
              },
            },
          }}
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
