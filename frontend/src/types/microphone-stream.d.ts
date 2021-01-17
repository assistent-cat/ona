declare module "microphone-stream" {
  interface Options {
    stream?: MediaStream;
    objectMode?: boolean;
    bufferSize?: number;
    context?: AudioContext;
  }
  class MicrophoneStream extends Readable {
    constructor(options?: Options);
    public setStream(stream: MediaStream): void;
    public pipe<S extends Duplex>(dest: S, pipeOpts?: { end?: boolean }): S;
    public unpipe<S extends Duplex>(dest: S, pipeOpts?: { end?: boolean }): S;
  }
  export = MicrophoneStream;
}
