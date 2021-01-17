// From https://gist.github.com/alexciarlillo/4b9f75516f93c10d7b39282d10cd17bc
export const createLoopback = async (
  stream: MediaStreamAudioDestinationNode
) => {
  let rtcConnection: RTCPeerConnection;
  let rtcLoopbackConnection: RTCPeerConnection;
  let loopbackStream = new MediaStream(); // this is the stream you will read from for actual audio output

  const offerOptions = {
    offerVideo: true,
    offerAudio: true,
    offerToReceiveAudio: false,
    offerToReceiveVideo: false,
  };

  let offer, answer;

  // initialize the RTC connections

  rtcConnection = new RTCPeerConnection();
  rtcLoopbackConnection = new RTCPeerConnection();

  rtcConnection.onicecandidate = (e) =>
    e.candidate &&
    rtcLoopbackConnection.addIceCandidate(new RTCIceCandidate(e.candidate));
  rtcLoopbackConnection.onicecandidate = (e) =>
    e.candidate &&
    rtcConnection.addIceCandidate(new RTCIceCandidate(e.candidate));

  rtcLoopbackConnection.ontrack = (e) =>
    e.streams[0].getTracks().forEach((track) => {
      loopbackStream.addTrack(track);
    });

  // setup the loopback
  rtcConnection.addTrack(stream.stream.getAudioTracks()[0], stream.stream); // this stream would be the processed stream coming out of Web Audio API destination node

  offer = await rtcConnection.createOffer(offerOptions);
  await rtcConnection.setLocalDescription(offer);

  await rtcLoopbackConnection.setRemoteDescription(offer);
  answer = await rtcLoopbackConnection.createAnswer();
  await rtcLoopbackConnection.setLocalDescription(answer);

  await rtcConnection.setRemoteDescription(answer);
  return loopbackStream;
};
