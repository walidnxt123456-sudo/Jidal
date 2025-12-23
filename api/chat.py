from http.server import BaseHTTPRequestHandler
import json
import os
import requests

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        # 1. Setup response headers
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()

        # 2. Read incoming data from your app.js
        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length)
        
        # Get API Key from Vercel Environment Variables
        api_key = os.environ.get("YOU_API_KEY")
        url = "https://api.you.com/v1/agents/runs"

        try:
            body = json.loads(post_data.decode("utf-8"))
            
            # Prepare the specific prompt for the talk show
            prompt = (
                f"Task:Create a fictional parody dialogue."
                f"Question:{body.get('question')}"
                f"Instructions:"
                f"-The ENTIRE response must be in plain text only (no markdown, no bold, no headings)."
                f"- Each character’s response MUST be under 10 words."
                f"- Both characters should speak in exaggerated parody versions of themselves."
                f"- Tone for this exchange: {body.get('tone')}"
                f"- Do NOT exceed 20 words by character"
                f"{body.get('guest_a')}:"
                f"- Write a parody of {body.get('guest_a')} responding to the question."
                f"- {body.get('guest_a')} should interact with or react to {body.get('guest_b')}."
                f"{body.get('guest_b')}:"
                f"- Write a parody of {body.get('guest_b')} replying to both the question and {body.get('guest_a')}'s comment."
                f"Format it as Name: [speech]."
                f"Maximum 4 round by Name"
                f"Maximum 10 words by round"
            )

            # 3. Construct the payload EXACTLY as the API requires
            payload = {
                "agent": "express",
                "stream": False,
                "input": [
                    {
                        "role": "user",
                        "content": prompt
                    }
                ]
            }

            headers = {
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            }

            # 4. Make the request to You.com
            response = requests.post(url, json=payload, headers=headers, timeout=25)
            
            if response.status_code == 200:
                ai_data = response.json()
                
                # 5. Precise extraction from the JSON path: output -> [0] -> text
                try:
                    raw_output_list = ai_data.get("output", [])
                    if raw_output_list and len(raw_output_list) > 0:
                        final_text = raw_output_list[0].get("text", "No response text.")
                    else:
                        final_text = "The guests are lost for words."
                except (IndexError, KeyError, TypeError):
                    final_text = "Technical glitch in the studio."
            else:
                print(f"API Error: {response.text}")
                final_text = f"Backstage Error ({response.status_code})."

            # 6. Return ONLY the string to the frontend
            self.wfile.write(json.dumps({"output": final_text}).encode('utf-8'))

        except Exception as e:
            print(f"Python Crash: {str(e)}")
            self.wfile.write(json.dumps({"output": "The show was cancelled due to a server error."}).encode('utf-8'))
