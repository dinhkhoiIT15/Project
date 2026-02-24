from flask import request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token
from app.models.models import db, User
import datetime

def register():
    data = request.get_json()
    
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({"message": "Missing username or password"}), 400
        
    username = data.get('username')
    password = data.get('password')
    phone_number = data.get('phone_number', '')
    address = data.get('address', '')
    
    existing_user = User.query.filter_by(username=username).first()
    if existing_user:
        return jsonify({"message": "Username already exists"}), 409
        
    hashed_password = generate_password_hash(password)
    
    new_user = User(
        username=username,
        password=hashed_password,
        phone_number=phone_number,
        address=address,
        role='Customer',
        account_status='activated'
    )
    
    try:
        db.session.add(new_user)
        db.session.commit()
        return jsonify({"message": "User registered successfully"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "An error occurred while registering user"}), 500

def login():
    data = request.get_json()
    
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({"message": "Missing username or password"}), 400
        
    username = data.get('username')
    password = data.get('password')
    
    user = User.query.filter_by(username=username).first()
    
    if not user or not check_password_hash(user.password, password):
        return jsonify({"message": "Invalid username or password"}), 401
        
    if user.account_status != 'activated':
        return jsonify({"message": "Account is locked. Please contact Admin."}), 403
        
    # Tạo Access Token
    access_token = create_access_token(
        identity=str(user.user_id),
        expires_delta=datetime.timedelta(days=1)
    )
    
    return jsonify({
        "message": "Login successful",
        "access_token": access_token,
        "user": {
            "id": user.user_id,
            "username": user.username,
            "role": user.role
        }
    }), 200