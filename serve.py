#!/usr/bin/env python3
"""Kleine lokale webserver voor De films van Bram (alleen om te testen).

Zoals `python3 -m http.server 8000`, maar met ondersteuning voor 'Range'-
verzoeken, zodat je in de film kunt doorspoelen. Start: python3 serve.py [poort]
"""
import http.server, os, re, sys, socketserver, threading, webbrowser

class Handler(http.server.SimpleHTTPRequestHandler):
    extensions_map = {**http.server.SimpleHTTPRequestHandler.extensions_map,
                      ".js": "text/javascript", ".mp4": "video/mp4", ".vtt": "text/vtt",
                      ".webp": "image/webp", ".woff": "font/woff", ".woff2": "font/woff2"}

    def send_head(self):
        rng = self.headers.get("Range")
        path = self.translate_path(self.path)
        if not rng or os.path.isdir(path) or not os.path.isfile(path):
            return super().send_head()
        m = re.match(r"bytes=(\d*)-(\d*)$", rng.strip())
        size = os.path.getsize(path)
        if not m or (m.group(1) == "" and m.group(2) == ""):
            return super().send_head()
        if m.group(1) == "":
            start, end = max(0, size - int(m.group(2))), size - 1
        else:
            start = int(m.group(1)); end = int(m.group(2)) if m.group(2) else size - 1
        end = min(end, size - 1)
        if start >= size or start > end:
            self.send_response(416); self.send_header("Content-Range", f"bytes */{size}"); self.end_headers(); return None
        f = open(path, "rb"); f.seek(start)
        self.send_response(206)
        self.send_header("Content-Type", self.guess_type(path))
        self.send_header("Content-Range", f"bytes {start}-{end}/{size}")
        self.send_header("Content-Length", str(end - start + 1))
        self.end_headers()
        self._remaining = end - start + 1
        return f

    def end_headers(self):
        self.send_header("Accept-Ranges", "bytes")
        self.send_header("Cache-Control", "no-cache")
        super().end_headers()

    def copyfile(self, source, outputfile):
        left = getattr(self, "_remaining", None)
        if left is None:
            return super().copyfile(source, outputfile)
        try:
            while left > 0:
                buf = source.read(min(256 * 1024, left))
                if not buf: break
                outputfile.write(buf); left -= len(buf)
        except (BrokenPipeError, ConnectionResetError):
            pass  # browser heeft de verbinding gesloten (normaal bij video)
        finally:
            self._remaining = None

class Server(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True
    allow_reuse_address = True

if __name__ == "__main__":
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    url = f"http://localhost:{port}/"
    with Server(("", port), Handler) as httpd:
        print(f"De films van Bram draait op {url}  (stoppen: Ctrl+C of sluit dit venster)")
        if "--geen-browser" not in sys.argv:
            threading.Timer(1.0, lambda: webbrowser.open(url)).start()
        try: httpd.serve_forever()
        except KeyboardInterrupt: print("\nGestopt.")
