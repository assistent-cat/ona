declare module "watson-speech/speech-to-text/webaudio-l16-stream" {
  interface Options {
    writableObjectMode: boolean;
  }
  class L16 extends Duplex {
    constructor(options?: Options);
    public pipe<S extends Duplex>(dest: S, pipeOpts?: { end?: boolean }): S;
  }
  export = L16;
}
