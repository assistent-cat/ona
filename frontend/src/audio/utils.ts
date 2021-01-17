import { MediaTrack } from "./mediaSlice";

export const getMediaUri = (track: MediaTrack): string => {
  if (!track) {
    return null;
  }

  if (Array.isArray(track.uri)) {
    return track.uri[0];
  }

  return track.uri;
};

export interface PLSTrack {
  uri: string;
  title: string;
  length: number;
}

export const parsePLS = (pls: string): PLSTrack[] => {
  const tracks: PLSTrack[] = [];
  const tempObj: { [key: string]: string } = {};

  for (let line of pls.split("\n")) {
    const match = line.match(/^([a-zA-Z0-9]+)=(.+)\r?$/);
    if (match && match.length >= 2) {
      tempObj[match[1].toLowerCase()] = match[2];
    }
  }

  const numberOfEntries = parseInt(tempObj.numberofentries, 10) || 0;
  for (let i = 1; i <= numberOfEntries; i++) {
    tracks.push({
      uri: tempObj[`file${i}`],
      title: tempObj[`title${i}`],
      length: parseInt(tempObj[`length${i}`], 10) || 0,
    });
  }

  return tracks;
};
