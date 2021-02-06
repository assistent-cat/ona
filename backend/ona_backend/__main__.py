import json
import threading
from queue import Queue

from jarbas_hive_mind import get_listener
from jarbas_hive_mind.configuration import CONFIGURATION
from jarbas_hive_mind.master import HiveMind, HiveMindProtocol
from jarbas_hive_mind.database import ClientDatabase
from ovos_utils.log import LOG
from ovos_utils.messagebus import Message

from ona_backend.listener import WebsocketAudioListener
from ona_backend.speaker import WebsocketAudioSource

LOG.name = "ONA"

class OnaBackendProtocol(HiveMindProtocol):
    def onConnect(self, request):

        LOG.info("Client connecting: {0}".format(request.peer))

        ip = request.peer.split(":")[1]
        context = {"source": self.peer}
        self.platform = request.headers.get("platform", "unknown")

        self.crypto_key = None
        # send message to internal mycroft bus
        data = {"ip": ip, "headers": request.headers}

        self.blacklist = {
            "messages": [],
            "skills": [],
            "intents": []
        }
        self.factory.mycroft_send("hive.client.connect", data, context)
        # return a pair with WS protocol spoken (or None for any) and
        # custom headers to send in initial WS opening handshake HTTP response
        headers = {"server": self.platform}
        return (None, headers)

    def onMessage(self, payload, isBinary):
        if not isBinary:
            payload = self.decode(payload)

        self.factory.on_message_from_client(self, payload, isBinary)


class OnaFactory(HiveMind):
    def __init__(self, bus=None, announce=True, *args, **kwargs):
        super(OnaFactory, self).__init__(*args, **kwargs)
        self.audio_source_queue = Queue()
        self.audio_source = WebsocketAudioSource(self.audio_source_queue)
        self.audio_source.start()

    def register_mycroft_messages(self):
        self.bus.on("message", self.on_message_from_mycroft)

    def on_message_from_client(self, client, payload, isBinary):
        """
       Process message from client, decide what to do internally here
       """

        if isBinary:
            audio_queue = self.clients[client.peer].get("audio_queue")
            if audio_queue:
                try:
                    audio_queue.put(payload)
                except Exception as e:
                    print(
                        f"[{threading.currentThread().getName()}] could not put in queue")
                    print(e)
        else:
            data = json.loads(payload)
            payload = data["payload"]
            msg_type = data["msg_type"]

            if msg_type == "recognized_utterance":
                utterance = payload.get("utterance")
                self.emit_utterance_to_bus(client, utterance)
            elif msg_type == "welcome":
                # Extract to skill
                msg_type = "speak"
                data = {
                    "utterance": "Hola! en què et puc ajudar?"
                }
                self.emit_to_ona(client, msg_type, data)
            elif msg_type == "configuration":
                use_hotword = payload.get("useHotword")
                tts_engine = payload.get("ttsEngine") or "festival"
                tts_voice = payload.get("ttsVoice") or "ona"
                client_config = self.clients.get(client.peer) or None
                if client_config:
                    client_config["use_hotword"] = use_hotword
                    client_config["tts_engine"] = tts_engine
                    client_config["tts_voice"] = tts_voice


    def on_message_from_mycroft(self, message=None):
        # forward internal messages to clients if they are the target
        if isinstance(message, dict):
            message = json.dumps(message)
        if isinstance(message, str):
            message = Message.deserialize(message)

        LOG.debug(
            "Missatge de mycroft rebut: {0}".format(message.serialize()))

        message.context = message.context or {}
        if message.msg_type == "speak":
            payload = {
                "msg_type": "speak",
                "utterance": message.data["utterance"]
            }
        elif message.msg_type == "ona:recognized":
            payload = {
                "msg_type": "recognized",
                "utterance": message.data["utterance"]
            }
        elif message.msg_type == "ona:hotword_start":
            payload = {
                "msg_type": "waiting_for_hotword",
            }
        elif message.msg_type == "ona:hotword_detected":
            payload = {
                "msg_type": "listening",
            }
        elif message.msg_type == "play:status":
            payload = {
                "msg_type": "play",
                "data": message.data
            }
        elif message.msg_type == "mycroft.stop":
            payload = {
                "msg_type": "stop"
            }
        else:
            return

        peers = message.context.get("destination") or []
        if not isinstance(peers, list):
            peers = [peers]
        for peer in peers:
            if peer and peer in self.clients:
                client = self.clients[peer].get("instance")
                if payload["msg_type"] == "speak":
                    tts_engine = self.clients[peer].get("tts_engine")
                    tts_voice = self.clients[peer].get("tts_voice")
                    self.audio_source_queue.put((payload, client, tts_engine, tts_voice))
                else:
                    self.interface.send(payload, client)
                    

    def emit_utterance_to_bus(self, client, utterance):
        bus_message = {
            "msg_type": "recognizer_loop:utterance",
            "data": {
                "utterances": [utterance]
            },
            "context": {
                "source": client.peer,
                "destination": ["skills"],
                "client_name": "OnaWebInterface"
            }
        }
        self.handle_bus_message(bus_message, client)

    def emit_utterance_to_ona(self, client, utterance):
        msg_type = "ona:recognized"
        data = {
            "utterance": utterance
        }
        self.emit_to_ona(client, msg_type, data)
    
    def emit_hotword_message_to_ona(self, hotword_message, client):
        msg_type = f"ona:hotword_{hotword_message}"
        data = {}
        self.emit_to_ona(client, msg_type, data)
        
    def emit_to_ona(self, client, msg_type, data):
        context = {
            "source": "ona-listener",
            "destination": client.peer,
            "client_name": "OnaWebInterface"
        }
        message = Message(msg_type, data, context)
        self.on_message_from_mycroft(message)

    def register_client(self, client, platform=None):
        """
       Add client to list of managed connections.
       """
        platform = platform or "unknown"
        LOG.info("registering client: " + str(client.peer))
        t, ip, sock = client.peer.split(":")
        # see if ip address is blacklisted
        if ip in self.ip_list and self.blacklist:
            LOG.warning("Blacklisted ip tried to connect: " + ip)
            self.unregister_client(client, reason="Blacklisted ip")
            return
        # see if ip address is whitelisted
        elif ip not in self.ip_list and not self.blacklist:
            LOG.warning("Unknown ip tried to connect: " + ip)
            #  if not whitelisted kick
            self.unregister_client(client, reason="Unknown ip")
            return

        audio_queue = Queue()
        audio_listener = WebsocketAudioListener(
            self, client, audio_queue)
        self.clients[client.peer] = {"instance": client,
                                     "status": "connected",
                                     "platform": platform,
                                     "audio_queue": audio_queue,
                                     "audio_listener": audio_listener,
                                     "use_hotword": True,
                                     "tts_engine": "festival",
                                     "tts_voice": "ona"}
        audio_listener.start()


def start_ona(config=None, bus=None):

    config = config or CONFIGURATION

    # listen
    listener = get_listener(bus=bus)

    # use http inside cluster
    config["ssl"]["use_ssl"] = False

    # read port and ssl settings
    listener.load_config(config)

    factory = OnaFactory(bus=listener.bus, announce=False)
    listener.listen(factory=factory, protocol=OnaBackendProtocol)


if __name__ == "__main__":
    start_ona()