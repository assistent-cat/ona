import requests
import os
import json
from threading import Thread
from queue import Empty
from pydub import AudioSegment
from jarbas_tts_plugin_catotron import CatotronTTSPlugin
from hashlib import sha512
from os.path import join, isfile, isdir
from os import makedirs

catotron_server_host = os.getenv('CATOTRON_SERVER_HOST') or 'catotron'
catotron_server_port = os.getenv('CATOTRON_SERVER_PORT') or 9000

class WebsocketAudioSource(Thread):
    def __init__(self, queue):
        super(WebsocketAudioSource, self).__init__()
        self.url = f"http://{catotron_server_host}:{catotron_server_port}/synthesize"
        self.queue = queue
        self.cache = "/tmp/catotron"
        self.sample_rate = 22050
        self.pause_between_chunks = 0.5
        if not isdir(self.cache):
            makedirs(self.cache)
        self.running = True
        
    def run(self):
        while self.running:
            try:
                (payload, client) = self.queue.get(timeout=0.5)
                self.handle_speak_message(payload, client)
            except Empty:
                pass

    def handle_speak_message(self, payload, client):
        utterance = payload["utterance"]
        try:
            audio_data = self.get_tts(utterance)
            client.sendMessage(audio_data, True)
        except:
            pass
        payload = json.dumps(payload)
        client.sendMessage(payload)
        
    def _get_unique_file_path(self, utterance):
        file_name = sha512(utterance.encode('utf-8')).hexdigest()
        return join(self.cache, file_name) + ".wav"
        
    def get_tts(self, utterance):
        cached_file = self._get_unique_file_path(utterance)
        if isfile(cached_file):
            with open(cached_file, "rb") as file:
                return file.read()
        
        combined = AudioSegment.empty()
        silence = AudioSegment.silent(duration=self.pause_between_chunks, frame_rate=22050)
        for sentence_chunk in CatotronTTSPlugin._split_sentences(utterance):
            params = {"text": sentence_chunk}
            audio_data = requests.get(self.url, params=params).content
            combined += AudioSegment(data=audio_data, sample_width=2, frame_rate=22050, channels=1) + silence

        with open(cached_file, "wb") as file:
            combined.export(cached_file, format="wav")

        return combined.raw_data
        
