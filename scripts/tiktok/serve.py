import http.server, os, sys
ROOT = sys.argv[1]
class H(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **k): super().__init__(*a, directory=ROOT, **k)
    def send_head(self):
        path = self.translate_path(self.path)
        if self.path.split('?')[0] != '/' and (not os.path.exists(path) or (os.path.isdir(path) and not os.path.exists(os.path.join(path, 'index.html')))):
            self.path = '/index.html'
        return super().send_head()
    def log_message(self, *a): pass
http.server.ThreadingHTTPServer(('127.0.0.1', int(sys.argv[2]) if len(sys.argv) > 2 else 4173), H).serve_forever()
