import requests
import os
import json
from threading import Thread
from queue import Empty
from pydub import AudioSegment
from jarbas_tts_plugin_catotron import CatotronTTSPlugin
from hashlib import sha512, md5
from os.path import join, isfile, isdir
from os import makedirs
from ovos_utils.log import LOG

LOG.name = 'ONA'

catotron_server_host = os.getenv('CATOTRON_SERVER_HOST') or 'catotron'
catotron_server_port = os.getenv('CATOTRON_SERVER_PORT') or 9000
festival_server_host = os.getenv('FESTIVAL_SERVER_HOST') or 'festival'
festival_server_port = os.getenv('FESTIVAL_SERVER_PORT') or 8100

class WebsocketAudioSource(Thread):
    def __init__(self, queue):
        super(WebsocketAudioSource, self).__init__()
        self.catotron_url = f"http://{catotron_server_host}:{catotron_server_port}/synthesize"
        self.festival_url = f"http://{festival_server_host}:{festival_server_port}/speak/"
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
                (payload, client, tts_engine, tts_voice) = self.queue.get(timeout=0.5)
                self.handle_speak_message(payload, client, tts_engine, tts_voice)
            except Empty:
                pass

    def handle_speak_message(self, payload, client, tts_engine, tts_voice):
        utterance = payload["utterance"]
        try:
            audio_data = self.get_tts(utterance, tts_engine, tts_voice)
            client.sendMessage(audio_data, True)
        except Exception as e:
            LOG.error(f"Could not convert TTS due to {e}")
            pass
        payload = json.dumps(payload)
        client.sendMessage(payload)
        
    def _get_unique_file_path(self, utterance, engine, voice):
        file_name = f"{engine}_{voice}_{sha512(utterance.encode('utf-8')).hexdigest()}"
        return join(self.cache, file_name) + ".wav"
        
    def get_tts(self, utterance, engine="festival", voice="pau"):
        cached_file = self._get_unique_file_path(utterance, engine, voice)
        if isfile(cached_file):
            with open(cached_file, "rb") as file:
                return file.read()
        
        if engine == "catotron":
            return self.get_tts_catotron(utterance, voice, cached_file)
        elif engine == "festival":
            return self.get_tts_festival(utterance, voice, cached_file)
        else:
            raise Exception(f"TTS engine {engine} not supported")
    
    def get_tts_catotron(self, utterance, voice, cached_file):
        combined = AudioSegment.empty()
        silence = AudioSegment.silent(duration=self.pause_between_chunks, frame_rate=22050)
        for sentence_chunk in CatotronTTSPlugin._split_sentences(utterance):
            params = {"text": sentence_chunk, "voice": voice}
            audio_data = requests.get(self.catotron_url, params=params).content
            combined += AudioSegment(data=audio_data, sample_width=2, frame_rate=22050, channels=1) + silence

        with open(cached_file, "wb") as file:
            combined.export(cached_file, format="wav")

        return combined.raw_data
    
    def getMD5(self, text):
        m = md5()
        m.update(text.encode('utf-8'))
        s = m.hexdigest()[:8].lower()
        return s
    
    def get_tts_festival(self, utterance, voice, cached_file):
        params = {"text": utterance, "token": self.getMD5(utterance), "type": "wav"}
        audio_data = requests.get(self.festival_url, params=params).content
        
        with open(cached_file, "wb") as file:
            file.write(audio_data)
        
        return audio_data
