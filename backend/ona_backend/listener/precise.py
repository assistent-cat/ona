from precise_runner import PreciseEngine

class PreciserEngine(PreciseEngine):
    def stop(self):
        if self.proc:
            self.proc.terminate()
            self.proc.wait()
            self.proc = None