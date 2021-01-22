import webrtcvad
import threading
import os
from collections import deque
from queue import Queue, Empty
from threading import Thread

import grpc
from ona_backend.stt_grpc.stt_service_pb2 import RecognitionSpec, RecognitionConfig, StreamingRecognitionRequest
from ona_backend.stt_grpc.stt_service_pb2_grpc import SttServiceStub

vad = webrtcvad.Vad(3)
vosk_server_host = os.getenv('VOSK_SERVER_HOST') or 'localhost'
vosk_server_port = os.getenv('VOSK_SERVER_PORT') or 5001
channel = grpc.insecure_channel(f"{vosk_server_host}:{vosk_server_port}")

class WebsocketAudioListener(Thread):
    def __init__(self, factory, client, queue, sample_rate=16000):
        super(WebsocketAudioListener, self).__init__()
        self.client = client
        self.factory = factory
        self.sample_rate = sample_rate
        self.vad = webrtcvad.Vad(1)
        self.queue = queue

        BLOCKS_PER_SECOND = 50
        self.block_size = int(
            self.sample_rate / float(BLOCKS_PER_SECOND))  # 320
        padding_ms = 600
        block_duration_ms = 1000 * \
            self.block_size // self.sample_rate  # 20
        num_padding_blocks = padding_ms // block_duration_ms  # 30
        self.ratio = 0.75

        self.ring_buffer = deque(maxlen=num_padding_blocks)
        self.triggered = False
        self.running = True

    def run(self):
        while self.keep_running():
            stub = SttServiceStub(channel)
            results = stub.StreamingRecognize(self.vad_generator())
            try:
                for r in results:
                    try:
                        if r.chunks[0].final:
                            self.emit_utterance(r.chunks[0].alternatives[0].text)
                            break
                    except LookupError:
                        print('No available chunks')
            except grpc._channel._Rendezvous as err:
                print('Error code %s, message: %s' % (err._state.code, err._state.details))
        
    def keep_running(self):
        return self.running and self.factory.clients.get(self.client.peer)

    def queue_generator(self):
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
                audio_data = audio_data[self.block_size:]
                yield audio_block

    def vad_generator(self):
        specification = RecognitionSpec(
            partial_results=True,
            audio_encoding='LINEAR16_PCM',
            sample_rate_hertz=self.sample_rate
        )
        
        streaming_config = RecognitionConfig(specification=specification)

        yield StreamingRecognitionRequest(config=streaming_config)
        
        for audio_block in self.queue_generator():
            try:
                is_speech = self.vad.is_speech(audio_block, self.sample_rate)
            except:
                is_speech = False

            if not self.triggered:
                self.ring_buffer.append((audio_block, is_speech))
                num_voiced = len(
                    [f for f, speech in self.ring_buffer if speech])
                if num_voiced > self.ratio * self.ring_buffer.maxlen:
                    self.triggered = True
                    for f, s in self.ring_buffer:
                        yield StreamingRecognitionRequest(audio_content=bytes(f))
                    self.ring_buffer.clear()
            else:
                yield StreamingRecognitionRequest(audio_content=bytes(audio_block))
                self.ring_buffer.append((audio_block, is_speech))
                num_unvoiced = len(
                    [f for f, speech in self.ring_buffer if not speech])
                if num_unvoiced > self.ratio * self.ring_buffer.maxlen:
                    self.triggered = False
                    self.ring_buffer.clear()
                    break

    def emit_utterance(self, utterance):
        if len(utterance) > 0:
            self.factory.emit_utterance_to_bus(self.client, utterance)
            self.factory.emit_utterance_to_ona(self.client, utterance)

    def stop(self):
        self.running = False