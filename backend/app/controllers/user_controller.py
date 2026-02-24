from flask import request, jsonify
from app.models.models import db, User
from flask_jwt_extended import get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash

def get_home():
    return jsonify({
        "status": "success",
        "message": "Welcome to E-commerce AI Platform API!" 
    }), 200

# 1. Lấy thông tin cá nhân
def get_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404
        
    return jsonify({
        "user": {
            "username": user.username,
            "phone_number": user.phone_number,
            "address": user.address,
            "role": user.role
        }
    }), 200

# 2. Cập nhật hồ sơ (Số ĐT, Địa chỉ)
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

# 3. Đổi mật khẩu
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
        
    # Kiểm tra mật khẩu cũ có khớp không
    if not check_password_hash(user.password, old_password):
        return jsonify({"message": "Incorrect old password"}), 400
        
    # Hash mật khẩu mới và lưu lại
    user.password = generate_password_hash(new_password)
    
    try:
        db.session.commit()
        return jsonify({"message": "Password changed successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Error changing password"}), 500