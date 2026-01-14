from api.db import get_connection
from http.server import BaseHTTPRequestHandler
import json
from urllib.parse import urlparse, parse_qs

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            # Parse query parameters
            parsed_url = urlparse(self.path)
            query_params = parse_qs(parsed_url.query)
            
            # Validate discussion_id
            discussion_id = query_params.get('discussion_id', [None])[0]
            if not discussion_id:
                return self._send_error(400, "discussion_id is required")
            
            try:
                discussion_id = int(discussion_id)
            except ValueError:
                return self._send_error(400, "discussion_id must be a number")
            
            # Use context manager for DB connection
            with get_connection() as conn:
                with conn.cursor() as cur:
                    # Fetch comments for this discussion
                    cur.execute("""
                        SELECT 
                            id,
                            user_id,
                            content,
                            created_at
                        FROM jdl_comments
                        WHERE discussion_id = %s
                        ORDER BY created_at DESC
                    """, (discussion_id,))
                    
                    comments = cur.fetchall()
            
            # Format response
            comments_list = [
                {
                    'id': row['id'],
                    'user_id': row['user_id'],
                    'content': row['content'],
                    'created_at': row['created_at'].isoformat() if row['created_at'] else None
                }
                for row in comments
            ]
            
            response = {
                'success': True,
                'data': {
                    'comments': comments_list,
                    'count': len(comments_list)
                },
                'error': None
            }
            
            # Send success response
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(response).encode('utf-8'))
            
        except Exception as e:
            print(f"Error fetching comments: {str(e)}")
            self._send_error(500, "Internal server error")
    
    def _send_error(self, status_code, message):
        """Helper to send standardized error responses"""
        self.send_response(status_code)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        response = {
            'success': False,
            'data': None,
            'error': message
        }
        self.wfile.write(json.dumps(response).encode('utf-8'))