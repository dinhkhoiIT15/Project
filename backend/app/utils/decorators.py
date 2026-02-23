from functools import wraps
from flask import jsonify
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request
from app.models.models import User

def admin_required():
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            # 1. Kiểm tra xem request có token hợp lệ không
            verify_jwt_in_request()
            
            # 2. Lấy ID của user từ token
            user_id = get_jwt_identity()
            
            # 3. Tìm user trong database
            user = User.query.get(user_id)
            
            # 4. Kiểm tra quyền Admin
            if not user or user.role != 'Admin':
                return jsonify({"message": "Access denied. Admin privileges required."}), 403
                
            return fn(*args, **kwargs)
        return decorator
    return wrapper