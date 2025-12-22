from http.server import BaseHTTPRequestHandler
import json
import os
import requests

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length)
        
        api_key = os.environ.get("YOU_API_KEY")
        url = "https://api.you.com/v1/agents/runs"

        try:
            body = json.loads(post_data.decode("utf-8"))
            prompt = (
                f"Short dialogue. Topic: {body.get('question')}. "
                f"Guests: {body.get('guest_a')} and {body.get('guest_b')}. "
                f"Format: Guest Name: Dialogue."
            )

            # Match exactly the You.com documentation payload
            payload = {
                "agent": "express",
                "query": prompt,
                "stream": False
            }

            # Use the 'Bearer' format required by the Authorization header
            headers = {
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            }

            print(f"DEBUG: Calling You.com with agent: express")

            response = requests.post(url, json=payload, headers=headers, timeout=25)
            
            if response.status_code != 200:
                print(f"API ERROR: {response.text}")
                output_text = "The guests are having technical difficulties. Please try again."
            else:
                ai_data = response.json()
                # Extracting text - You.com usually returns 'answer'
                output_text = ai_data.get("answer") or "The debate has ended prematurely."

            # Send back to app.js
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"output": output_text}).encode('utf-8'))

        except Exception as e:
            print(f"LOCAL ERROR: {str(e)}")
            self.send_response(500)
            self.end_headers()
            self.wfile.write(json.dumps({"output": "Server Error"}).encode('utf-8'))
