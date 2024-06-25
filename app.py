from flask import Flask, request, jsonify, render_template, send_from_directory
import psycopg2
import psycopg2.extras
import os

app = Flask(__name__)

# Database connection URL
TREE_DATABASE_URL = "postgresql://postgres:lovecricket@18@localhost/Voting"

def get_db_connection():
    conn = psycopg2.connect(TREE_DATABASE_URL)
    return conn

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upvote_tree', methods=['POST'])
def upvote_tree():
    data = request.get_json()
    tree_id = data['id']
    
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("UPDATE trees SET upvotes = upvotes + 1 WHERE id = %s", (tree_id,))
        conn.commit()
        return jsonify({"status": "success", "message": "Tree upvoted successfully"}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({"status": "fail", "message": "Failed to upvote the tree", "error": str(e)}), 500
    finally:
        cur.close()
        conn.close()

@app.route('/downvote_tree', methods=['POST'])
def downvote_tree():
    data = request.get_json()
    tree_id = data['id']
    
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("UPDATE trees SET downvotes = downvotes + 1 WHERE id = %s", (tree_id,))
        conn.commit()
        return jsonify({"status": "success", "message": "Tree downvoted successfully"}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({"status": "fail", "message": "Failed to downvote the tree", "error": str(e)}), 500
    finally:
        cur.close()
        conn.close()

@app.route('/static/<path:path>')
def send_static(path):
    return send_from_directory('static', path)

if __name__ == '__main__':
    app.run(debug=True)
