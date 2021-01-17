import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface MediaTrack {
  skill: string;
  uri: [string, string] | string;
  artist: string;
  album: string;
  track: string;
  image: string;
  track_length: number;
  elapsed_time: number;
  playlist_position: number;
  status: number;
}

export interface MediaState {
  ona: {
    muted: boolean;
  };

  media: {
    tracks: MediaTrack[];
    playing: boolean;
    muted: boolean;
    volume: number;
  };
}

let initialState: MediaState = {
  ona: {
    muted: false,
  },
  media: {
    tracks: [],
    playing: true,
    muted: false,
    volume: 1,
  },
};

const appendOrMergeTrack = (
  tracks: MediaTrack[],
  newTrack: MediaTrack
): MediaTrack[] => {
  tracks = tracks.slice(-9);
  if (tracks.length === 0) {
    return [newTrack];
  }

  const lastTrack = tracks.pop();
  if (lastTrack.skill !== newTrack.skill || newTrack.uri !== "") {
    return [...tracks, lastTrack, newTrack];
  }

  const mergedTrack = {
    ...newTrack,
    uri: lastTrack.uri,
  };

  return [...tracks, mergedTrack];
};

const mediaSlice = createSlice({
  name: "media",
  initialState,
  reducers: {
    appendMediaTrack(state, action: PayloadAction<MediaTrack>) {
      state.media = {
        tracks: appendOrMergeTrack(state.media.tracks, action.payload),
        muted: false,
        playing: true,
        volume: 1,
      };
    },
    resetMedia(state) {
      state = initialState;
    },
  },
});

export const { appendMediaTrack, resetMedia } = mediaSlice.actions;

export default mediaSlice.reducer;
