from flask import request, jsonify
from app.models.models import db, User
from flask_jwt_extended import get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from app.extensions import socketio # MỚI: Dùng để ép user văng ra ngoài khi bị khóa

def get_home():
    return jsonify({
        "status": "success",
        "message": "Welcome to E-commerce AI Platform API!" 
    }), 200

# 1. Lấy thông tin cá nhân
def get_profile():
    """Lấy thông tin profile và trả về Role thực tế từ DB"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404
        
    return jsonify({
        "user": {
            "id": user.user_id,
            "username": user.username,
            "role": user.role, # Role này rất quan trọng để Frontend kiểm tra chéo
            "phone_number": user.phone_number,
            "address": user.address
        },
        "status": "success"
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
    
# ================= MỚI: API QUẢN LÝ USER CHO ADMIN =================
def admin_get_all_users():
    """Admin lấy danh sách tất cả user (Có thể tìm kiếm theo username)"""
    search = request.args.get('search', '')
    query = User.query
    if search:
        query = query.filter(User.username.ilike(f"%{search}%"))
        
    users = query.order_by(User.user_id.desc()).all()
    result = []
    for u in users:
        result.append({
            "id": u.user_id,
            "username": u.username,
            "phone_number": u.phone_number,
            "role": u.role,
            "account_status": u.account_status
        })
    return jsonify({"users": result, "status": "success"}), 200

def admin_toggle_user_status(user_id):
    """Admin Khóa / Mở khóa tài khoản"""
    current_admin_id = get_jwt_identity()
    if str(user_id) == str(current_admin_id):
        return jsonify({"message": "You cannot lock your own account"}), 400
        
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404
        
    # Đảo ngược trạng thái
    user.account_status = 'locked' if user.account_status == 'activated' else 'activated'
    db.session.commit()
    
    # Nếu khóa tài khoản, bắn socket để ép máy của User đó tự đăng xuất (nếu đang online)
    if user.account_status == 'locked':
        socketio.emit('force_logout', {"message": "Your account has been locked by Admin."}, to=f'user_{user_id}')
    
    # MỚI: Báo cho các Admin khác cập nhật lại bảng danh sách User
    socketio.emit('user_list_updated')
    return jsonify({"message": f"User is now {user.account_status}", "status": "success"}), 200
        
def admin_update_user_info(user_id):
    """Admin cập nhật thông tin User (Phone, Address, Password)"""
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404
        
    data = request.get_json()
    password_changed = False
    
    # Cập nhật thông tin nếu có truyền lên
    if 'phone_number' in data:
        user.phone_number = data['phone_number']
    if 'address' in data:
        user.address = data['address']
        
    # Cập nhật mật khẩu nếu Admin có nhập mật khẩu mới
    if 'password' in data and data['password'].strip() != "":
        user.password = generate_password_hash(data['password'])
        password_changed = True
        
    db.session.commit()
    
    # Nếu Admin đặt lại mật khẩu, PHẢI KÍCH HOẠT WEBSOCKET để ép User đó văng ra ngoài ngay lập tức
    if password_changed:
        socketio.emit('force_logout', {
            "message": "Your password has been reset by Admin. Please log in again with your new credentials."
        }, to=f'user_{user_id}')
    
    # MỚI: Báo cho các Admin khác cập nhật lại bảng danh sách User
    socketio.emit('user_list_updated')
    return jsonify({"message": "User information updated successfully", "status": "success"}), 200