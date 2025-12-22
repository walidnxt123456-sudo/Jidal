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
                f"Create a short dialogue between {body.get('guest_a')} and {body.get('guest_b')} "
                f"about {body.get('question')}. Format: Name: Dialogue."
            )

            # THIS IS THE EXACT STRUCTURE THE ERROR IS ASKING FOR:
            payload = {
                "agent": "express",
                "input": prompt,
                "stream": False
                }
            }

            headers = {
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            }

            print(f"DEBUG: Attempting with nested input structure...")

            response = requests.post(url, json=payload, headers=headers, timeout=25)
            
            if response.status_code != 200:
                print(f"STILL ERROR: {response.text}")
                output_text = f"API Error {response.status_code}: {response.text}"
            else:
                ai_data = response.json()
                # You.com usually returns text in 'answer'
                output_text = ai_data.get("answer") or "The conversation was too quiet to hear."

            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"output": output_text}).encode('utf-8'))

        except Exception as e:
            self.send_response(500)
            self.end_headers()
            self.wfile.write(json.dumps({"output": f"Local Crash: {str(e)}"}).encode('utf-8'))
