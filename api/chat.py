from http.server import BaseHTTPRequestHandler
import json
import os
import requests
# Handler for Vercel Serverless Function
class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        # 1. Read the incoming request body
        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length)
        
        # Load API Key from Vercel Environment Variables
        api_key = os.getenv("YOU_API_KEY")
        api_url = "https://api.you.com/v1/agents/runs"

        try:
            # 2. Parse the JSON
            if not post_data:
                raise ValueError("No data received")
                
            body = json.loads(post_data.decode("utf-8"))
            
            # Extract fields with fallbacks to prevent 400 errors
            question = body.get("question", "").strip()
            guest_a = body.get("guest_a", "Guest A").strip()
            guest_b = body.get("guest_b", "Guest B").strip()
            tone = body.get("tone", "Funny").strip()

            # Validation: if question is empty, we send a clear error
            if not question:
                self.send_response(400)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Please provide a topic!"}).encode())
                return

            # 3. Construct the AI Prompt for You.com
            prompt = (
                f"Context: An AI Talk Show. "
                f"Host: Create a short, punchy dialogue between {guest_a} and {guest_b}. "
                f"Topic: {question}. Tone: {tone}. "
                f"Requirement: Keep it under 60 words total. Format as Guest Name: Dialogue."
            )

            # 4. Call the You.com API
            headers = {"X-API-Key": api_key}
            payload = {
                "query": prompt,
                "stream": False
            }
            
            # Request to AI provider
            api_res = requests.post(api_url, json=payload, headers=headers, timeout=15)
            api_res.raise_for_status()
            ai_data = api_res.json()

            # Extract text from You.com response (adjust 'answer' key if necessary)
            full_response = ai_data.get("answer", "The guests are lost for words.")

            # 5. Send Success Response to app.js
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            
            # 'output' must match document.getElementById('response').textContent = data.output
            self.wfile.write(json.dumps({"output": full_response}).encode('utf-8'))

        except Exception as e:
            # Catch-all for 500 errors (API failures, key errors, etc.)
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))

