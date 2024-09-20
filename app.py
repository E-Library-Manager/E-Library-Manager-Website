from flask import Flask, session, jsonify, request, render_template
from flask_cors import CORS
from datetime import timedelta
import os

app = Flask(__name__, static_folder='static')
app.secret_key = "randomstring123456"
app.permanent_session_lifetime = timedelta(minutes=30)
CORS(app)

# Sample in-memory data for users and books
users = []
books = [
    {'id': 1, 'name': '\"Pride and Prejudice\"', 'author': 'Jane Austen', 'borrowed': False, 'user_id': None},
    {'id': 2, 'name': '\"1984\"', 'author': 'George Orwell', 'borrowed': False, 'user_id': None},
    {'id': 3, 'name': '\"Dune\"', 'author': 'Frank Herbert', 'borrowed': False, 'user_id': None},
    {'id': 4, 'name': '\"It\"', 'author': 'Stephen King', 'borrowed': False, 'user_id': None},
]

user_id_counter = 1

# Helper function to find a user by username
def find_user_by_username(username):
    for user in users:
        if user['username'] == username:
            return user
    return None

# Route to serve the index.html file
@app.route('/')
def index():
    return render_template('index.html')

# Route for user registration
@app.route('/register', methods=['POST'])
def register():
    global user_id_counter
    data = request.get_json()
    name = data.get('name')
    username = data.get('username')
    password = data.get('password')

    # Check if the username is already taken
    if find_user_by_username(username):
        return jsonify({'success': False, 'message': 'Username already exists.'})

    # Create a new user
    user = {
        'id': user_id_counter,
        'name': name,
        'username': username,
        'password': password,
    }
    users.append(user)
    user_id_counter += 1
    session.permanent = True
    return jsonify({'success': True, 'message': 'Registration successful!', 'user_id': user['id'], 'name': user['name']})

# Route for user login
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    # Find the user by username and check password
    user = find_user_by_username(username)
    if user and user['password'] == password:
        session.permanent = True
        return jsonify({'success': True, 'message': 'Login successful!', 'user_id': user['id'], 'name': user['name']})
    return jsonify({'success': False, 'message': 'Invalid username or password.'})

@app.route('/logout', methods=['POST'])
def logout():
    session.pop('user_id', None)
    return jsonify({'success': True, 'message': 'Logout successful!'})

# Route to fetch all books
@app.route('/books', methods=['GET'])
def get_books():
    return jsonify(books)

# Route to borrow a book
@app.route('/borrow', methods=['POST'])
def borrow_book():
    data = request.get_json()
    book_id = data.get('book_id')
    user_id = data.get('user_id')

    # Find the book by ID
    book = next((book for book in books if book['id'] == book_id), None)
    if book:
        if book['borrowed']:
            return jsonify({'success': False, 'message': 'Book is already borrowed.'})
        # Mark the book as borrowed by the user
        book['borrowed'] = True
        book['user_id'] = user_id
        return jsonify({'success': True, 'message': 'Book borrowed successfully!'})
    return jsonify({'success': False, 'message': 'Book not found.'})

# Route to return a book
@app.route('/return', methods=['POST'])
def return_book():
    data = request.get_json()
    book_id = data.get('book_id')
    user_id = data.get('user_id')

    # Find the book by ID
    book = next((book for book in books if book['id'] == book_id), None)
    if book:
        if book['borrowed'] and book['user_id'] == user_id:
            # Mark the book as returned
            book['borrowed'] = False
            book['user_id'] = None
            return jsonify({'success': True, 'message': 'Book returned successfully!'})
        return jsonify({'success': False, 'message': 'You cannot return this book.'})
    return jsonify({'success': False, 'message': 'Book not found.'})

if __name__ == '__main__':
    app.run(debug=True)
