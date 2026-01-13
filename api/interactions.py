from api.db import get_connection
from http.server import BaseHTTPRequestHandler
import json

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            body = json.loads(post_data.decode("utf-8"))
            
            action = body.get('action')
            discussion_id = body.get('discussion_id')
            user_id = body.get('user_id', 'anonymous')  # Default to anonymous
            
            conn = get_connection()
            cur = conn.cursor()
            
            if action == 'like':
                # Toggle like
                cur.execute("""
                    SELECT id FROM jdl_likes 
                    WHERE discussion_id = %s AND user_id = %s
                """, (discussion_id, user_id))
                
                if cur.fetchone():
                    # Unlike
                    cur.execute("""
                        DELETE FROM jdl_likes 
                        WHERE discussion_id = %s AND user_id = %s
                    """, (discussion_id, user_id))
                    liked = False
                else:
                    # Like
                    cur.execute("""
                        INSERT INTO jdl_likes (discussion_id, user_id)
                        VALUES (%s, %s)
                    """, (discussion_id, user_id))
                    liked = True
                    
                response = {'success': True, 'liked': liked}
                
            elif action == 'comment':
                content = body.get('content', '').strip()
                if content:
                    cur.execute("""
                        INSERT INTO jdl_comments (discussion_id, user_id, content)
                        VALUES (%s, %s, %s)
                    """, (discussion_id, user_id, content))
                    response = {'success': True}
                else:
                    response = {'success': False, 'error': 'Comment content is required'}
                    
            elif action == 'rate':
                stars = int(body.get('stars', 0))
                if 1 <= stars <= 5:
                    cur.execute("""
                        INSERT INTO jdl_ratings (discussion_id, user_id, stars)
                        VALUES (%s, %s, %s)
                        ON CONFLICT (discussion_id, user_id) 
                        DO UPDATE SET stars = EXCLUDED.stars
                    """, (discussion_id, user_id, stars))
                    
                    # Update average stars in jdl_ai_logs
                    cur.execute("""
                        UPDATE jdl_ai_logs 
                        SET stars = (
                            SELECT AVG(stars)::numeric(10,2)
                            FROM jdl_ratings 
                            WHERE discussion_id = %s
                        )
                        WHERE id = %s
                    """, (discussion_id, discussion_id))
                    
                    response = {'success': True}
                else:
                    response = {'success': False, 'error': 'Stars must be between 1 and 5'}
            
            else:
                response = {'success': False, 'error': 'Invalid action'}
            
            conn.commit()
            cur.close()
            conn.close()
            
            self.wfile.write(json.dumps(response).encode('utf-8'))
            
        except Exception as e:
            error_response = {'success': False, 'error': str(e)}
            self.wfile.write(json.dumps(error_response).encode('utf-8'))