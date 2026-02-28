from flask import request, jsonify
from app.models.models import db, User
from flask_jwt_extended import get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from app.extensions import socketio 

def get_home():
    return jsonify({
        "status": "success",
        "message": "Welcome to E-commerce AI Platform API!" 
    }), 200

def get_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404
        
    return jsonify({
        "user": {
            "id": user.user_id,
            "username": user.username,
            "role": user.role, 
            "phone_number": user.phone_number,
            "address": user.address
        },
        "status": "success"
    }), 200

def update_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404
        
    data = request.get_json()
    if 'phone_number' in data:
        user.phone_number = data['phone_number']
    if 'address' in data:
        user.address = data['address']
        
    try:
        db.session.commit()
        return jsonify({"message": "Profile updated successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Error updating profile"}), 500

def change_password():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404
        
    data = request.get_json()
    old_password = data.get('old_password')
    new_password = data.get('new_password')
    
    if not old_password or not new_password:
        return jsonify({"message": "Missing password data"}), 400
        
    if not check_password_hash(user.password, old_password):
        return jsonify({"message": "Incorrect old password"}), 400
        
    user.password = generate_password_hash(new_password)
    
    try:
        db.session.commit()
        return jsonify({"message": "Password changed successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Error changing password"}), 500
    
def admin_get_all_users():
    search = request.args.get('search', '')
    page = request.args.get('page', 1, type=int) 
    
    query = User.query
    if search:
        query = query.filter(User.username.ilike(f"%{search}%"))
        
    pagination = query.order_by(User.user_id.desc()).paginate(page=page, per_page=5, error_out=False)
    users = pagination.items
    
    result = []
    for u in users:
        result.append({
            "id": u.user_id,
            "username": u.username,
            "phone_number": u.phone_number,
            "role": u.role,
            "account_status": u.account_status
        })
        
    return jsonify({
        "users": result, 
        "total_pages": pagination.pages,
        "current_page": pagination.page,
        "status": "success"
    }), 200

def admin_toggle_user_status(user_id):
    current_admin_id = get_jwt_identity()
    if str(user_id) == str(current_admin_id):
        return jsonify({"message": "You cannot lock your own account"}), 400
        
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404
        
    user.account_status = 'locked' if user.account_status == 'activated' else 'activated'
    db.session.commit()
    
    if user.account_status == 'locked':
        socketio.emit('force_logout', {"message": "Your account has been locked by Admin."}, to=f'user_{user_id}')
    
    socketio.emit('user_list_updated')
    return jsonify({"message": f"User is now {user.account_status}", "status": "success"}), 200
        
def admin_update_user_info(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404
        
    data = request.get_json()
    password_changed = False
    
    if 'phone_number' in data:
        user.phone_number = data['phone_number']
    if 'address' in data:
        user.address = data['address']
        
    if 'password' in data and data['password'].strip() != "":
        user.password = generate_password_hash(data['password'])
        password_changed = True
        
    db.session.commit()
    
    if password_changed:
        socketio.emit('force_logout', {
            "message": "Your password has been reset by Admin. Please log in again with your new credentials."
        }, to=f'user_{user_id}')
    
    socketio.emit('user_list_updated')
    return jsonify({"message": "User information updated successfully", "status": "success"}), 200