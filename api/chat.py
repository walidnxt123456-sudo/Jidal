from http.server import BaseHTTPRequestHandler
import json
import os
import requests

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        # 1. Setup Headers for the response
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        # Enabling CORS just in case your frontend needs it
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()

        # 2. Read incoming data from your app.js
        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length)
        
        # 3. Get API Key from Vercel Environment Variables
        api_key = os.environ.get("YOU_API_KEY")

        try:
            # Parse the JSON sent by the frontend
            body = json.loads(post_data.decode("utf-8"))
            question = body.get("question", "the future of AI")
            ga = body.get("guest_a", "Elon Musk")
            gb = body.get("guest_b", "Aristotle")
            tone = body.get("tone", "funny")

            # 4. Construct a clean, simple prompt to avoid 422 errors
            # We wrap it in a clear instruction for the You.com agent
            prompt = (
                f"Write a very short dialogue (max 50 words) between {ga} and {gb}. "
                f"Topic: {question}. Tone: {tone}. "
                f"Format: {ga}: [text] {gb}: [text]"
            )

            # 5. Call You.com API with the simplified payload
            # Based on the 422 error, we keep it to the bare essentials
            api_url = "https://api.you.com/v1/agents/runs"
            payload = {"query": prompt}
            headers = {"X-API-Key": api_key}

            print(f"DEBUG: Sending query to You.com: {prompt}")

            response = requests.post(
                api_url, 
                json=payload, 
                headers=headers, 
                timeout=20
            )

            # Check if You.com rejected the request
            if response.status_code != 200:
                print(f"YOU.COM ERROR: {response.status_code} - {response.text}")
                # Fallback message so the UI doesn't just show an error
                output_text = f"System: The guests are currently arguing backstage (Error {response.status_code})."
            else:
                ai_data = response.json()
                # You.com usually returns text in 'answer' or 'result'
                output_text = ai_data.get("answer") or ai_data.get("result") or "The guests are speechless."

            # 6. Send the final response back to app.js
            response_body = {"output": output_text}
            self.wfile.write(json.dumps(response_body).encode('utf-8'))

        except Exception as e:
            # This will show up in your Vercel Logs if the code crashes
            print(f"CRITICAL ERROR: {str(e)}")
            error_msg = {"output": f"Error: {str(e)}", "details": "Check Vercel logs."}
            self.wfile.write(json.dumps(error_msg).encode('utf-8'))
