"""Simple HTTP health check server that runs alongside the agent."""
import asyncio
import json
from http.server import BaseHTTPRequestHandler, HTTPServer
from datetime import datetime
from threading import Thread


class HealthCheckHandler(BaseHTTPRequestHandler):
    """Handler for health check requests."""
    
    def do_GET(self):
        """Handle GET requests."""
        if self.path == '/healthz':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            
            response = {
                'status': 'healthy',
                'timestamp': datetime.utcnow().isoformat(),
                'service': 'livekit-voice-agent'
            }
            self.wfile.write(json.dumps(response).encode())
        else:
            self.send_response(404)
            self.end_headers()
    
    def log_message(self, format, *args):
        """Suppress default logging."""
        pass


def start_health_server(port: int = 8080):
    """Start the health check server in a separate thread."""
    server = HTTPServer(('0.0.0.0', port), HealthCheckHandler)
    thread = Thread(target=server.serve_forever, daemon=True)
    thread.start()
    print(f"✅ Health check server started on port {port}")
    return server

