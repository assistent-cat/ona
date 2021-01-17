import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppThunk } from "../store";
import { getMediaUri, parsePLS } from "./utils";

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
  human: {
    muted: boolean;
  };

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
  human: {
    muted: true,
  },
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
  if (lastTrack.skill !== newTrack.skill || (lastTrack.uri && newTrack.uri)) {
    return [...tracks, lastTrack, newTrack];
  }

  const uri = lastTrack.uri === "" ? newTrack.uri : lastTrack.uri;
  const mergedTrack = {
    ...newTrack,
    uri,
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
    toggleMicrophone(state) {
      state.human.muted = !state.human.muted;
    },
  },
});

export const {
  appendMediaTrack,
  resetMedia,
  toggleMicrophone,
} = mediaSlice.actions;

export default mediaSlice.reducer;

export const resolveAndAppendMediaTrack = (
  track: MediaTrack
): AppThunk => async (dispatch) => {
  const uri = getMediaUri(track);
  console.log(uri);
  if (uri === "") {
    dispatch(appendMediaTrack(track));
    return;
  }
  try {
    const headResponse = await fetch(uri, { method: "HEAD" });
    const contentType = headResponse.headers.get("content-type");

    if (
      headResponse.status >= 200 &&
      headResponse.status < 300 &&
      contentType !== "audio/x-scpls"
    ) {
      dispatch(appendMediaTrack(track));
      return;
    }

    const getResponse = await fetch(uri, {
      method: "GET",
      mode: "cors",
    });

    if (getResponse.status >= 200 && getResponse.status < 300) {
      const pls = await getResponse.text();
      for (const plsTrack of parsePLS(pls)) {
        dispatch(
          appendMediaTrack({
            ...track,
            uri: plsTrack.uri,
            track: plsTrack.title,
            track_length: plsTrack.length,
          })
        );
      }
    }
  } catch (err) {
    // ignore
    console.log("error: " + err);
  }
};
