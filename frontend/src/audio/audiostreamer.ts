import { Duplex, DuplexOptions } from "readable-stream";

export class AudioStreamer extends Duplex {
  constructor(public socket: WebSocket, options?: DuplexOptions) {
    super(options);
  }

  public _write(chunk: any, encoding: any, callback: any) {
    console.log(chunk);
    this.socket.send(chunk);
    this.afterSend(callback);
  }

  private afterSend(next: any) {
    if (
      this.socket.bufferedAmount <= (this._writableState.highWaterMark || 0)
    ) {
      next();
    } else {
      setTimeout(this.afterSend.bind(this, next), 10);
    }
  }
}
