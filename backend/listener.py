import webrtcvad
import threading
from collections import deque
from queue import Queue, Empty
from threading import Thread

from mycroft.stt import STTFactory

vad = webrtcvad.Vad(3)


class WebsocketAudioListener(Thread):
    def __init__(self, factory, client, queue, sample_rate=16000):
        super(WebsocketAudioListener, self).__init__()
        self.client = client
        self.factory = factory
        self.stt = STTFactory.create()
        self.sample_rate = sample_rate
        self.vad = webrtcvad.Vad(2)
        self.queue = queue

        BLOCKS_PER_SECOND = 50
        self.block_size = int(
            self.sample_rate / float(BLOCKS_PER_SECOND))  # 320
        padding_ms = 300
        block_duration_ms = 1000 * \
            self.block_size // self.sample_rate  # 20
        num_padding_blocks = padding_ms // block_duration_ms  # 5
        self.ratio = 0.75

        self.ring_buffer = deque(maxlen=num_padding_blocks)
        self.triggered = False
        self.running = True

    def run(self):
        audio_data = bytearray()
        while self.keep_running():
            if len(audio_data) < self.block_size:
                try:
                    audio_from_queue = self.queue.get(timeout=1)
                    audio_data.extend(audio_from_queue)
                except Empty:
                    pass
            else:
                audio_block = audio_data[: self.block_size]
                print(f"block: {len(audio_block)}")
                audio_data = audio_data[self.block_size:]
                print(f"data: {len(audio_data)}")
                self.process_audio(audio_block)

    def keep_running(self):
        return self.running and self.factory.clients.get(self.client.peer)

    def process_audio(self, audio_block):
        try:
            is_speech = self.vad.is_speech(audio_block, self.sample_rate)
        except:
            print(f"is_speech exception")
            is_speech = False

        print(f"[{threading.currentThread().getName()}] is speech: {is_speech}; ring_buffer: {len(self.ring_buffer)}")

        if not self.triggered:
            self.ring_buffer.append((audio_block, is_speech))
            num_voiced = len(
                [f for f, speech in self.ring_buffer if speech])
            if num_voiced > self.ratio * self.ring_buffer.maxlen:
                self.triggered = True
                self.stt.stream_start()
                print(
                    f"[{threading.currentThread().getName()}] start: {self.stt.stream.text}")
                for f, s in self.ring_buffer:
                    self.stt.stream_data(f)
                self.ring_buffer.clear()
        else:
            self.stt.stream_data(audio_block)
            self.ring_buffer.append((audio_block, is_speech))
            num_unvoiced = len(
                [f for f, speech in self.ring_buffer if not speech])
            if num_unvoiced > self.ratio * self.ring_buffer.maxlen:
                self.triggered = False
                print(f"[{threading.currentThread().getName()}] finalizing")
                print(
                    f"[{threading.currentThread().getName()}] end: {self.stt.stream.text}")
                self.stt.stream.finalize()
                text = self.stt.stream_stop()
                self.ring_buffer.clear()
                self.emit_utterance(text)

    def emit_utterance(self, utterance):
        if len(utterance) > 0:
            print(f"[{threading.currentThread().getName()}] emit utt: {utterance}")
            self.factory.emit_utterance_to_bus(self.client, utterance)

    def stop(self):
        print("stopping")
        self.stt.stream_stop()
        self.running = False
