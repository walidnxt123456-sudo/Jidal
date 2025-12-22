from http.server import BaseHTTPRequestHandler
import json
import os
import requests

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length)
        
        # Récupération sécurisée de la clé API
        api_key = os.environ.get("YOU_API_KEY")
        
        try:
            # Extraction des données envoyées par app.js
            body = json.loads(post_data.decode("utf-8"))
            question = body.get("question", "un sujet mystère")
            ga = body.get("guest_a", "Elon")
            gb = body.get("guest_b", "Trump")

            # Construction d'un prompt court pour éviter les timeouts
            prompt = f"Dialogue très court (30 mots max) entre {ga} et {gb} sur : {question}."

            # Appel à You.com avec un timeout défini
            response = requests.post(
                "https://api.you.com/v1/agents/runs",
                json={"query": prompt, "stream": False},
                headers={"X-API-Key": api_key},
                timeout=8 # On coupe à 8s pour répondre avant le timeout de Vercel
            )
            
            response.raise_for_status()
            ai_data = response.json()
            
            # You.com renvoie souvent le texte dans 'answer'
            answer = ai_data.get("answer", "Les invités n'ont rien à dire...")

            # Réponse au front-end
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"output": answer}).encode('utf-8'))

        except Exception as e:
            # Ce print apparaîtra dans l'onglet LOGS de Vercel
            print(f"CRASH LOG: {str(e)}")
            
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({
                "error": "L'IA est fatiguée, réessayez !",
                "details": str(e)
            }).encode('utf-8'))
