"""
Flask API Server for Evidence Management System
Serves exhibit data from SQLite database to web interface
"""
import gzip
from flask import Flask, jsonify, request, make_response
from flask_cors import CORS
from evidence_database import EvidenceDatabase
import json
import functools

app = Flask(__name__)
CORS(app)  # Enable CORS for local development

# Initialize DB with new optimizations
db = EvidenceDatabase()

def compress_response(f):
    @functools.wraps(f)
    def decorated(*args, **kwargs):
        response = f(*args, **kwargs)
        
        # Check if client accepts gzip
        accept_encoding = request.headers.get('Accept-Encoding', '')
        if 'gzip' not in accept_encoding.lower():
            return response
            
        # Compress
        if isinstance(response, tuple):
             response_obj = response[0]
             status_code = response[1]
        else:
             response_obj = response
             status_code = 200
             
        content = response_obj.get_data()
        compressed_content = gzip.compress(content)
        
        new_response = make_response(compressed_content)
        new_response.headers['Content-Encoding'] = 'gzip'
        new_response.headers['Content-Length'] = len(compressed_content)
        new_response.headers['Content-Type'] = 'application/json'
        # Add Cache-Control
        new_response.headers['Cache-Control'] = 'public, max-age=300' # 5 mins
        new_response.status_code = status_code
        
        return new_response
    return decorated

@app.route('/api/exhibits', methods=['GET'])
@compress_response
def get_exhibits():
    """Get all exhibits with optional filtering and pagination"""
    keyword = request.args.get('keyword')
    category = request.args.get('category')
    min_priority = request.args.get('min_priority', type=int)
    page = request.args.get('page', 1, type=int)
    limit = request.args.get('limit', 50, type=int)
    
    offset = (page - 1) * limit
    
    exhibits = db.search_exhibits(
        keyword=keyword, 
        category=category, 
        min_priority=min_priority,
        limit=limit,
        offset=offset
    )
    return jsonify(exhibits)

@app.route('/api/exhibits/critical', methods=['GET'])
def get_critical_exhibits():
    """Get all Priority 10 exhibits"""
    exhibits = db.get_critical_exhibits()
    return jsonify(exhibits)

@app.route('/api/exhibits/<exhibit_number>', methods=['GET'])
def get_exhibit(exhibit_number):
    """Get a specific exhibit by number"""
    exhibits = db.search_exhibits()
    exhibit = next((ex for ex in exhibits if ex['exhibit_number'] == exhibit_number), None)
    
    if exhibit:
        return jsonify(exhibit)
    else:
        return jsonify({'error': 'Exhibit not found'}), 404

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Get database statistics"""
    stats = db.get_stats()
    return jsonify(stats)

@app.route('/api/modules/<int:module_number>/exhibits', methods=['GET'])
def get_module_exhibits(module_number):
    """Get all exhibits for a specific module"""
    exhibits = db.get_exhibits_by_module(module_number)
    return jsonify(exhibits)

@app.route('/api/categories', methods=['GET'])
def get_categories():
    """Get list of all categories"""
    stats = db.get_stats()
    categories = list(stats['by_category'].keys())
    return jsonify(categories)

@app.route('/api/export/index', methods=['GET'])
def export_index():
    """Export exhibit index as text file"""
    filename = db.export_exhibit_index()
    return jsonify({'success': True, 'filename': filename})

if __name__ == '__main__':
    print("🚀 Starting Evidence Management API Server...")
    print("📊 Database loaded with exhibits")
    print("🌐 API available at: http://localhost:5000")
    print("\nAvailable endpoints:")
    print("  GET /api/exhibits - All exhibits (supports ?keyword, ?category, ?min_priority)")
    print("  GET /api/exhibits/critical - Priority 10 exhibits only")
    print("  GET /api/exhibits/<number> - Specific exhibit")
    print("  GET /api/stats - Database statistics")
    print("  GET /api/modules/<number>/exhibits - Exhibits for specific module")
    print("  GET /api/export/index - Export exhibit index")
    
    app.run(debug=False, port=5000)
