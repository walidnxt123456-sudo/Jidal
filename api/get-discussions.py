from api.db import get_connection
from http.server import BaseHTTPRequestHandler
import json

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        # Setup response headers
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        try:
            # Get query parameters
            from urllib.parse import urlparse, parse_qs
            parsed_url = urlparse(self.path)
            query_params = parse_qs(parsed_url.query)
            
            # Parse parameters with defaults
            page = int(query_params.get('page', [1])[0])
            limit = int(query_params.get('limit', [10])[0])
            offset = (page - 1) * limit
            
            # Get sort parameter
            sort_by = query_params.get('sort_by', ['date'])[0]
            
            # Build SQL query based on sort
            if sort_by == 'popular':
                order_by = "stars DESC, likes DESC, created_at DESC"
            else:  # default to newest
                order_by = "created_at DESC"
            
            # Connect to database
            conn = get_connection()
            cur = conn.cursor()
            
            # Get discussions with pagination
            cur.execute(f"""
                SELECT 
                    d.id,
                    d.topic,
                    d.guest1,
                    d.guest2,
                    d.tone,
                    d.response,
                    d.stars,
                    d.conversation_type,
                    d.created_at,
                    COALESCE(l.like_count, 0) as likes,
                    COALESCE(c.comment_count, 0) as comments
                FROM jdl_ai_logs d
                LEFT JOIN (
                    SELECT discussion_id, COUNT(*) as like_count 
                    FROM jdl_likes 
                    GROUP BY discussion_id
                ) l ON d.id = l.discussion_id
                LEFT JOIN (
                    SELECT discussion_id, COUNT(*) as comment_count 
                    FROM jdl_comments 
                    GROUP BY discussion_id
                ) c ON d.id = c.discussion_id
                ORDER BY {order_by}
                LIMIT %s OFFSET %s
            """, (limit, offset))
            
            discussions = cur.fetchall()
            
            # Convert to list of dicts
            discussions_list = []
            for row in discussions:
                discussions_list.append({
                    'id': row['id'],
                    'topic': row['topic'],
                    'guest1': row['guest1'],
                    'guest2': row['guest2'],
                    'tone': row['tone'],
                    'response': row['response'],
                    'stars': row['stars'],
                    'type': row['conversation_type'],
                    'created_at': row['created_at'].isoformat() if row['created_at'] else None,
                    'likes': row['likes'],
                    'comments': row['comments']
                })
            
            # Get total count for pagination
            cur.execute("SELECT COUNT(*) as total FROM jdl_ai_logs")
            total = cur.fetchone()['total']
            
            cur.close()
            conn.close()
            
            # Return response
            response = {
                'success': True,
                'discussions': discussions_list,
                'pagination': {
                    'page': page,
                    'limit': limit,
                    'total': total,
                    'has_more': (page * limit) < total
                }
            }
            
            self.wfile.write(json.dumps(response).encode('utf-8'))
            
        except Exception as e:
            print(f"Error fetching discussions: {str(e)}")
            error_response = {
                'success': False,
                'error': str(e),
                'discussions': [],
                'pagination': {
                    'page': 1,
                    'limit': 10,
                    'total': 0,
                    'has_more': False
                }
            }
            self.wfile.write(json.dumps(error_response).encode('utf-8'))