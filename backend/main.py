import json
import threading
from queue import Queue

from jarbas_hive_mind import get_listener
from jarbas_hive_mind.configuration import CONFIGURATION
from jarbas_hive_mind.master import HiveMind, HiveMindProtocol
from jarbas_hive_mind.database import ClientDatabase
from ovos_utils.log import LOG
from ovos_utils.messagebus import Message
from mycroft.stt import STTFactory
from mycroft.configuration import Configuration

from listener import WebsocketAudioListener
from speaker import WebsocketAudioSource


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
        if isBinary:
            LOG.debug(
                "Binary message received: {0} bytes".format(len(payload)))
        else:
            payload = self.decode(payload)
            LOG.debug(
                "Missatge de text rebut: {0}".format(payload))

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
                utterance = payload.get('utterance')
                self.emit_utterance_to_bus(client, utterance)

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
                "utterance": message.data['utterance']
            }
        elif message.msg_type == "ona:recognized":
            payload = {
                "msg_type": "recognized",
                "utterance": message.data['utterance']
            }
        else:
            return

        peers = message.context.get("destination") or []
        if not isinstance(peers, list):
            peers = [peers]
        for peer in peers:
            if peer and peer in self.clients:
                client = self.clients[peer].get("instance")
                self.interface.send(payload, client)
                if payload["msg_type"] == "speak":
                    self.audio_source_queue.put((payload["utterance"], client))

    def emit_utterance_to_bus(self, client, utterance):
        bus_message = {
            "type": "recognizer_loop:utterance",
            "data": {
                "utterances": [utterance],
                "context": {
                    "source": client.peer,
                    "destination": ["skills"],
                    "client_name": "OnaWebInterface"
                }
            },
        }
        self.handle_bus_message(bus_message, client)

    def emit_utterance_to_ona_via_bus(self, client, utterance):
        bus_message = {
            "type": "ona:recognized",
            "data": {
                "utterance": utterance,
                "context": {
                    "source": "ona-listener",
                    "destination": client.peer,
                    "client_name": "OnaWebInterface"
                }
            },
        }
        self.handle_bus_message(bus_message, client)

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
                                     "audio_listener": audio_listener}
        audio_listener.start()

    def unregister_client(self, client, code=3078,
                          reason="unregister client request"):
        """
        Remove client from list of managed connections.
        """

        LOG.info("deregistering client: " + str(client.peer))
        if client.peer in self.clients.keys():
            client_data = self.clients[client.peer] or {}
            audio_listener = client_data.get("audio_listener")
            if audio_listener:
                LOG.info("stopping audio listener")
                audio_listener.stop()
            j, ip, sock_num = client.peer.split(":")
            context = {"user": client_data.get("names", ["unknown_user"])[0],
                       "source": client.peer}
            self.bus.emit(
                Message("hive.client.disconnect",
                        {"reason": reason, "ip": ip, "sock": sock_num},
                        context))
            client.sendClose(code, reason)
            self.clients.pop(client.peer)


def start_mind(config=None, bus=None):

    config = config or CONFIGURATION

    # listen
    listener = get_listener(bus=bus)

    # use http
    config["ssl"]["use_ssl"] = False

    # read port and ssl settings
    listener.load_config(config)

    config_core = Configuration.get()
    print(config_core.get("stt", {}))

    factory = OnaFactory(bus=listener.bus, announce=False)
    listener.listen(factory=factory, protocol=OnaBackendProtocol)


if __name__ == '__main__':
    # TODO argparse
    start_mind()

    # that's it, now external applications can connect to the HiveMind

    # use configuration to set things like
    #  - blacklisted/whitelisted ips
    #  - blacklisted/whitelisted message_types
    #  - blacklisted/whitelisted intents - Coming soon
    #  - blacklisted/whitelisted skills  - Coming soon

    # you can send messages to the mycroft bus to send/broadcast to clients
    # 'Message(hive.client.broadcast',
    #           {"payload":
    #               {"msg_type": "speak",
    #               "data": {"utterance": "Connected to the HiveMind"}
    #           })

    # or you can listen to hive mind events
    # "hive.client.connection.error"
    # "hive.client.connect"
    # "hive.client.disconnect"
    # "hive.client.send.error"
